# CueHire Application

CueHire is a full-stack application built with modern technologies, featuring a React frontend and NestJS backend, containerized with Docker.

## Tech Stack

### Frontend
- React with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- Node.js environment

### Backend
- NestJS (Node.js framework)
- TypeScript
- PostgreSQL database
- Redis for caching
- Google OAuth integration

### Infrastructure
- Docker and Docker Compose for containerization
- PostgreSQL 15 (Alpine)
- Redis 7 (Alpine)

## Prerequisites

Before running the application, ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Yarn](https://yarnpkg.com/) or npm

## Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd cuemeet/Apps/CueHire
```

2. Set up environment variables:
   - Create a `.env` file in the backend directory with the following variables:
     ```
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     ```
   - Note: Other environment variables are already configured in docker-compose.yml

## Running the Application

### Using Docker (Recommended)

1. Build and start all services:
```bash
docker-compose up --build
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:8080
- PostgreSQL on port 5433
- Redis on port 6379

2. To stop all services:
```bash
docker-compose down
```

### Manual Development Setup

#### Frontend
```bash
cd frontend
yarn install
yarn dev
```

#### Backend
```bash
cd backend
yarn install
yarn start:dev
```

## Development

- Frontend development server runs on http://localhost:3000
- Backend API is available at http://localhost:8080
- API documentation is available at http://localhost:8080/api/docs (when running)

## Database

- PostgreSQL is accessible on port 5433
- Default credentials:
  - Username: postgres
  - Password: postgres
  - Database: cue-calender

## Redis

- Redis is accessible on port 6379
- Used for caching and session management

## Available Scripts

### Frontend
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
- `yarn test` - Run tests

### Backend
- `yarn start:dev` - Start development server
- `yarn build` - Build for production
- `yarn start:prod` - Start production server
- `yarn test` - Run tests
- `yarn lint` - Run ESLint
