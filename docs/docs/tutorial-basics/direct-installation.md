---
sidebar_position: 3
---

# Direct Installation Guide

This guide will help you set up CueHire directly on your local machine for development without using Docker.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- Yarn package manager
- PostgreSQL (latest version)
- Redis (latest version)
- Git

## Getting the Code

1. Clone the repository:
```bash
git clone <repository-url>
cd cuemeet/Apps/CueHire
```

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

### Redis Connection Issues
- Ensure Redis server is running
- Check Redis connection settings in `.env` file
- Verify Redis port is not blocked 