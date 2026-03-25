# Express.js API with Advanced Caching, Rate Limiting, and Security

A production-ready, high-performance Express.js API server built with TypeScript, featuring advanced caching strategies, sophisticated rate limiting, comprehensive security measures, and asynchronous request processing.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Caching Strategy](#caching-strategy)
- [Rate Limiting](#rate-limiting)
- [Configuration](#configuration)
- [Testing Guide](#testing-guide)
- [Error Handling](#error-handling)

## Features

### Core Features
- **LRU Cache with TTL**: In-memory cache with 60-second expiration and automatic cleanup
- **Advanced Rate Limiting**: Dual-layer rate limiting (10 req/min, 5 req/10s burst)
- **Request Deduplication**: Prevents duplicate concurrent requests for the same resource
- **Response Time Tracking**: Monitors and reports average response times
- **Input Validation**: Comprehensive request validation using express-validator
- **Request Logging**: Structured logging with morgan

### Security Features
- **Helmet.js**: Security headers (CSP, XSS protection, content type validation)
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Request Size Limiting**: 10MB maximum body size to prevent DoS attacks
- **Input Sanitization**: Automatic input trimming and sanitization
- **Compression**: Response compression for better performance

## Architecture

The application follows a clean, modular architecture with clear separation of concerns:

```
server/
├── index.ts                 # Server entry point
├── src/
│   ├── app.ts              # Express app configuration
│   ├── controllers/        # Request/response handlers
│   ├── services/           # Business logic layer
│   ├── utils/              # Reusable utilities (cache, queue, response tracker)
│   ├── routes/             # Route definitions with validation
│   ├── middleware/         # Express middleware (security, validation, logging)
│   ├── types/              # TypeScript type definitions
│   └── config/             # Configuration files
```

### Layer Responsibilities

- **Controllers**: Handle HTTP requests/responses, delegate to services
- **Services**: Contain business logic, interact with utilities and data sources
- **Utils**: Reusable utilities (LRU cache, request queue, response tracker)
- **Routes**: Define API endpoints, apply validation middleware, connect to controllers
- **Middleware**: Cross-cutting concerns (security, rate limiting, validation, logging, error handling)
- **Config**: Centralized configuration for all aspects of the application

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
```bash
# Create .env file
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
TRUST_PROXY=false
```

4. Start the development server:
```bash
npm run dev
```

The server will start on port 3000 by default (configurable via `PORT` environment variable).

### Available Scripts

- `npm run dev` - Start development server with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server (requires build first)
- `npm run watch` - Start development server with file watching

## API Endpoints

### Base URL
```
http://localhost:3000
```

### 1. Get All Users
**GET** `/users`

Retrieves all users. Returns cached data if available, otherwise fetches from mock database.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "message": "Found 3 user(s)"
}
```

**Features:**
- Results are cached for 60 seconds
- Request deduplication for concurrent requests

### 2. Get User by ID
**GET** `/users/:id`

Retrieves user data by ID. Returns cached data if available.

**Parameters:**
- `id` (path parameter): User ID (positive integer, validated)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- **400 Bad Request**: Invalid user ID format
- **404 Not Found**: User does not exist

### 3. Create User
**POST** `/users`

Creates a new user and adds it to the mock database and cache.

**Request Body:**
```json
{
  "name": "Bob Wilson",
  "email": "bob@example.com"
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters, letters and spaces only
- `email`: Required, valid email format, automatically normalized

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Bob Wilson",
    "email": "bob@example.com"
  },
  "message": "User created successfully"
}
```

### 4. Clear Cache
**DELETE** `/cache`

Clears the entire cache and resets statistics.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

### 5. Get Cache Status
**GET** `/cache/status`

Returns cache statistics including size, hits, misses, and average response time.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hits": 15,
    "misses": 3,
    "size": 3,
    "maxSize": 100,
    "averageResponseTime": 45.2
  }
}
```

### 6. Health Check
**GET** `/health`

Returns server health status. This endpoint is excluded from rate limiting.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Caching Strategy

### LRU (Least Recently Used) Cache

The application implements an in-memory LRU cache with the following features:

- **TTL (Time To Live)**: 60 seconds - cached entries expire after 60 seconds
- **Maximum Size**: 100 entries - when the cache is full, least recently used entries are evicted
- **Automatic Cleanup**: Background task runs every 10 seconds to remove stale entries
- **Statistics Tracking**: Tracks cache hits, misses, and current size

### Cache Behavior

1. **Cache Hit**: Data exists in cache and hasn't expired → returned immediately without database simulation
2. **Cache Miss**: Data not in cache or expired → request queued, database simulation (200ms), result cached and returned
3. **Concurrent Requests**: Multiple requests for the same ID → first triggers fetch, others wait on the same Promise, all receive cached result

### Cache Invalidation

- **Automatic**: Entries expire after 60 seconds (TTL-based)
- **Manual**: Use `DELETE /cache` endpoint to clear entire cache
- **On Create**: New users are automatically cached when created

## Rate Limiting

### Implementation

Dual-layer rate limiting using `express-rate-limit`:

1. **Base Window**: 10 requests per minute per IP
2. **Burst Window**: 5 requests per 10 seconds per IP

Both limiters are applied sequentially. If either window is exhausted, the request is rejected with a 429 status code. Health check endpoint (`/health`) is excluded from rate limiting.

### Rate Limit Exceeded Response

**Status Code**: 429 Too Many Requests

**Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests from this IP, please try again later. Maximum 10 requests per minute."
}
```

**Headers:**
- `X-RateLimit-Limit`: Maximum number of requests
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Configuration

Configuration files are located in `src/config/`:

- **`cache.config.ts`**: Cache TTL (60s), max size (100), cleanup interval (10s)
- **`rate-limit.config.ts`**: Base limit (10/min), burst limit (5/10s)
- **`security.config.ts`**: CORS, Helmet headers, body parser limits, trust proxy
- **`app.config.ts`**: Server port (default: 3000), environment
- **`mock-data.config.ts`**: Initial mock user data

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: CORS origin (default: `*`)
- `TRUST_PROXY`: Trust proxy setting (default: false)

## Testing Guide

### Quick Test Commands

```bash
# Get all users
curl http://localhost:3000/users

# Test cache miss/hit
curl http://localhost:3000/users/1  # First: ~200ms, Second: <10ms

# Test rate limiting (6th request should fail)
for i in {1..6}; do curl http://localhost:3000/users/1; done

# Test input validation
curl http://localhost:3000/users/abc  # Should return 400

# Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "New User", "email": "new@example.com"}'

# Check cache status
curl http://localhost:3000/cache/status

# Clear cache
curl -X DELETE http://localhost:3000/cache
```

### Testing Scenarios

1. **Cache Hit/Miss**: First request to `/users/1` takes ~200ms (cache miss), second request <10ms (cache hit)
2. **Rate Limiting**: Send 6 requests within 10 seconds → 6th request returns 429
3. **Concurrent Requests**: Send 5 simultaneous requests for same user ID → all complete ~200ms, only 1 database call
4. **Input Validation**: Invalid user ID or email format → returns 400 with validation errors

## Error Handling

All errors are handled centrally by the error handler middleware:

- **400 Bad Request**: Invalid input (validation errors)
- **404 Not Found**: User does not exist
- **413 Payload Too Large**: Request body exceeds size limit
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unexpected server errors

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "errors": [] // Only present for validation errors
}
```
