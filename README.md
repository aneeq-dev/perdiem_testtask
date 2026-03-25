# Full Stack Coding Challenge Submission

This repository contains:
- `server/server`: Express + TypeScript backend proxying Square APIs
- `frontend`: Next.js mobile-first frontend menu browser

## Requirements covered
- Square proxy endpoints:
  - `GET /api/locations`
  - `GET /api/catalog?location_id=...`
  - `GET /api/catalog/categories?location_id=...`
- Pagination handled transparently in backend
- Typed responses and clean error mapping
- In-memory caching with TTL/LRU
- Request logging (method/path/status/duration)
- Frontend location selector + localStorage persistence
- Category navigation and grouped menu items
- Item card with image placeholder, read-more description, prices, variations
- Loading, error with retry, and empty states
- Search bonus (client-side)
- Dark mode toggle bonus
- Accessibility baseline (labels, keyboard-friendly controls)
- Docker support bonus (`docker-compose.yml`)
- Webhook cache busting bonus (`POST /api/webhooks/square`)
- Tests (unit/integration/e2e-style)

## Setup

### Backend
```bash
cd server/server
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend: http://localhost:4000
Backend: http://localhost:3000

## Docker
```bash
# from repo root
export SQUARE_ACCESS_TOKEN=your_token
docker compose up --build
```

## Testing
```bash
cd server/server
npm test
```
