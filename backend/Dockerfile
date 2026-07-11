FROM python:3.12-slim

WORKDIR /app

# System deps needed for psycopg2 (Postgres driver) to build
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Shell form (not exec/JSON form) so ${PORT} is expanded at container start.
# Railway injects PORT dynamically; falls back to 8000 for local docker-compose.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
