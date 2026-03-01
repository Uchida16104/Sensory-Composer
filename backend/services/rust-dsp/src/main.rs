mod fft;

use axum::{
    Router,
    extract::Json,
    http::StatusCode,
    routing::{get, post},
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::EnvFilter;

#[derive(Deserialize)]
struct FftRequest {
    samples: Vec<f64>,
}

#[derive(Serialize)]
struct FftResponse {
    frequencies: Vec<f64>,
    magnitudes: Vec<f64>,
    dominant_frequency: f64,
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "rust-dsp",
    })
}

async fn run_fft(
    Json(payload): Json<FftRequest>,
) -> Result<Json<FftResponse>, (StatusCode, Json<ErrorResponse>)> {
    if payload.samples.len() < 2 {
        return Err((
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(ErrorResponse {
                error: "samples must contain at least 2 values".into(),
            }),
        ));
    }

    let (frequencies, magnitudes) = fft::compute_fft(&payload.samples, 44100.0);

    let dominant_idx = magnitudes
        .iter()
        .enumerate()
        .max_by(|a, b| a.1.partial_cmp(b.1).unwrap_or(std::cmp::Ordering::Equal))
        .map(|(i, _)| i)
        .unwrap_or(0);

    let dominant_frequency = frequencies.get(dominant_idx).copied().unwrap_or(0.0);

    Ok(Json(FftResponse {
        frequencies,
        magnitudes,
        dominant_frequency,
    }))
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("rust_dsp=info".parse().unwrap()))
        .init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health))
        .route("/fft", post(run_fft))
        .layer(cors);

    let port = std::env::var("PORT").unwrap_or_else(|_| "8002".to_string());
    let addr = format!("0.0.0.0:{port}");

    tracing::info!("Rust DSP service listening on {addr}");

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind address");

    axum::serve(listener, app)
        .await
        .expect("Server error");
}
