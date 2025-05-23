---
sidebar_position: 2
---

# Docker Installation Guide

This guide will help you set up CueHire using Docker on your local machine for development.

## Prerequisites

Before you begin, ensure you have the following installed:
- Docker Engine (latest version)
- Docker Compose (latest version)
- Git

## Getting the Code

1. Clone the repository:
```bash
git clone <repository-url>
cd cuemeet/Apps/CueHire
```

## Docker Setup

The Docker Compose setup includes all necessary services:
- Frontend (Vite) application
- Backend (Node.js) server
- PostgreSQL database
- Redis cache

### Starting the Application

1. From the root directory, start all services:
```bash
docker-compose up -d
```

This command will:
- Build and start the frontend service on port 3000
- Build and start the backend service on port 8080
- Start PostgreSQL on port 5433
- Start Redis on port 6379

### Environment Configuration

The Docker Compose setup includes the following environment variables:

#### Backend Environment Variables
```env
NODE_ENV=development
PORT=8080
ORIGIN=http://localhost:3000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=cue-calender
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
REDIS_HOST=redis
REDIS_PORT=6379
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/google/callback
```

#### Frontend Environment Variables
```env
NODE_ENV=development
VITE_API_URL=http://backend:8080
```

### Accessing Services
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5433
- Redis: localhost:6379

### Useful Docker Commands

- View running containers:
```bash
docker-compose ps
```

- View logs:
```bash
docker-compose logs -f [service_name]
```

- Stop all services:
```bash
docker-compose down
```

- Rebuild and restart services:
```bash
docker-compose up -d --build
```

### Data Persistence
- PostgreSQL data is persisted in a Docker volume named `postgres-data`
- Redis data is persisted in a Docker volume named `redis-data`

### Troubleshooting

1. If services fail to start:
   - Check if ports 3000, 8080, 5433, and 6379 are available
   - Ensure Docker has enough resources allocated
   - Check logs using `docker-compose logs`

2. Database connection issues:
   - Wait for PostgreSQL to be healthy (healthcheck runs every 5s)
   - Verify database credentials in the environment variables

3. Redis connection issues:
   - Wait for Redis to be healthy (healthcheck runs every 5s)
   - Check Redis logs for any startup errors 