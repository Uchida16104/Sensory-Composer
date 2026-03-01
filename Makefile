.PHONY: install dev frontend backend fastapi rust clean

install:
	cd frontend && npm ci
	cd backend && composer install --no-interaction
	cd backend/services/fastapi && pip install -r requirements.txt --break-system-packages
	cd backend/services/rust-dsp && cargo build --release

dev:
	$(MAKE) -j4 frontend backend fastapi

frontend:
	cd frontend && npm run dev

backend:
	cd backend && php artisan serve --port=8000

fastapi:
	cd backend/services/fastapi && uvicorn main:app --reload --port=8001

rust:
	cd backend/services/rust-dsp && cargo run --release

clean:
	cd frontend && rm -rf .next node_modules
	cd backend && rm -rf vendor
	cd backend/services/fastapi && find . -type d -name __pycache__ -exec rm -rf {} +
	cd backend/services/rust-dsp && cargo clean
