use std::f64::consts::PI;

pub fn compute_fft(samples: &[f64], sample_rate: f64) -> (Vec<f64>, Vec<f64>) {
    let n = samples.len();
    let windowed = apply_hann_window(samples);
    let spectrum = dft(&windowed);

    let half = n / 2 + 1;
    let frequencies: Vec<f64> = (0..half)
        .map(|i| i as f64 * sample_rate / n as f64)
        .collect();

    let magnitudes: Vec<f64> = spectrum[..half]
        .iter()
        .map(|(re, im)| (re * re + im * im).sqrt())
        .collect();

    (frequencies, magnitudes)
}

fn apply_hann_window(samples: &[f64]) -> Vec<f64> {
    let n = samples.len();
    samples
        .iter()
        .enumerate()
        .map(|(i, &s)| {
            let w = 0.5 * (1.0 - (2.0 * PI * i as f64 / (n as f64 - 1.0)).cos());
            s * w
        })
        .collect()
}

fn dft(samples: &[f64]) -> Vec<(f64, f64)> {
    let n = samples.len();
    (0..n)
        .map(|k| {
            let (re, im) = samples.iter().enumerate().fold((0.0, 0.0), |(re, im), (t, &x)| {
                let angle = 2.0 * PI * k as f64 * t as f64 / n as f64;
                (re + x * angle.cos(), im - x * angle.sin())
            });
            (re, im)
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_single_sine_dominant_frequency() {
        let sample_rate = 44100.0_f64;
        let freq = 440.0_f64;
        let n = 512usize;
        let samples: Vec<f64> = (0..n)
            .map(|i| (2.0 * std::f64::consts::PI * freq * i as f64 / sample_rate).sin())
            .collect();

        let (frequencies, magnitudes) = compute_fft(&samples, sample_rate);

        let dominant_idx = magnitudes
            .iter()
            .enumerate()
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap())
            .map(|(i, _)| i)
            .unwrap();

        let dominant_freq = frequencies[dominant_idx];
        assert!(
            (dominant_freq - freq).abs() < 200.0,
            "Expected dominant freq near {freq} Hz, got {dominant_freq} Hz"
        );
    }

    #[test]
    fn test_fft_output_length() {
        let samples = vec![0.0f64; 64];
        let (freqs, mags) = compute_fft(&samples, 44100.0);
        assert_eq!(freqs.len(), mags.len());
        assert_eq!(freqs.len(), 33);
    }
}
