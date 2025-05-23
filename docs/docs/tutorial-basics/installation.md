---
sidebar_position: 2
---

# Installation Guide

This guide will help you set up CueHire on your local machine for development.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- Yarn package manager
- Docker and Docker Compose
- Git

## Getting the Code

1. Clone the repository:
```bash
git clone <repository-url>
cd cuemeet/Apps/CueHire
```

## Docker Setup

If you prefer using Docker, you can start the entire application using Docker Compose. This setup includes:
- Frontend (Vite) application
- Backend (Node.js) server
- PostgreSQL database
- Redis cache

### Prerequisites
- Docker Engine (latest version)
- Docker Compose (latest version)

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

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Here's the required environment variables format for the backend:
```env
NODE_ENV=
PORT=

ORIGIN=

POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_HOST=
POSTGRES_PORT=

REDIS_HOST=
REDIS_PORT=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

CUEMEET_BASE_URL=

GEMINI_API_KEY=
```

Edit the `.env` file with your configuration.

4. Start the development server:
```bash
yarn start:dev
```

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Here's the required environment variables format for the frontend:
```env
VITE_GOOGLE_AUTH_URL=
VITE_GRAPHQL_URL=
```

Edit the `.env` file with your configuration.

4. Start the development server:
```bash
yarn dev
```

## Verifying the Installation

1. Backend API should be running at: `http://localhost:8080`
2. Frontend application should be running at: `http://localhost:5173`

## Common Issues

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env` file
- Verify database port is not blocked

### Port Conflicts
- If port 3000 is in use, modify the backend port in `.env`
- If port 5173 is in use, modify the frontend port in `vite.config.ts`

### Node Version Issues
- Use `nvm` to switch to the correct Node.js version
- Ensure you're using Node.js v18 or higher