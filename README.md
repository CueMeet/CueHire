<div align="center">
  <img src="https://i.postimg.cc/FRLZLSSF/Banner.png" alt="Meeting Bots Control Panel Banner" />
</div>

---
## Links to CueMeet Repositories

You can explore all our repositories for additional tools and integrations:

<ul>
  <li><a href="https://github.com/CueMeet/cuemeet-documentation" target="_blank">CueMeet Docs</a></li>
  <li><a href="https://github.com/CueMeet/Meeting-Bots-Control-Panel" target="_blank">CueMeet Control Panel</a></li>
  <li><a href="https://github.com/CueMeet/cuemeet-google-bot" target="_blank">Google Meet Bot</a></li>
  <li><a href="https://github.com/CueMeet/cuemeet-teams-bot" target="_blank">Ms Teams Bot</a></li>
  <li><a href="https://github.com/CueMeet/cuemeet-zoom-bot" target="_blank">Zoom Meet Bot</a></li>
</ul>

---

[![License](https://img.shields.io/badge/license-GPL%203.0-blue.svg)](LICENSE)
[![Docusaurus](https://img.shields.io/badge/Docusaurus-3.7.0-blue)](https://docusaurus.io/)
[![Node.js](https://img.shields.io/badge/Node.js-20.11.0-green)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Available-blue)](https://www.docker.com/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-4.3.4-orange)](https://www.openapis.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![Yarn](https://img.shields.io/badge/Yarn-Package%20Manager-blue)](https://yarnpkg.com/)
[![Community](https://img.shields.io/badge/Community-Supported-green)](SUPPORT.md)

This directory contains the documentation website built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

<div align="center">
  <h1>CueHired Documentation</h1>
  <p>CueHired is a comprehensive hiring platform that helps organizations manage their recruitment process efficiently. It provides features for job posting, candidate management, interview scheduling, and organization management.</p>
</div>


## Key Features
- Authentication & Authorization: Secure user authentication and role-based access control
- Organization Management: Manage company profiles and team structures
- Job Management: Create, manage, and track job postings
- Interview Management: Schedule and conduct interviews with candidates

## Getting Started

To work with the documentation locally using Docker, you'll docker or compatible tool installed on your system.

1. Build and start all services:
```bash
docker-compose up -d
```
2. Stop all services:
```bash
docker-compose down
```


To work with the documentation locally, you'll need Node.js installed on your system.

1. Install dependencies:
```bash
yarn install
```

2. Start the development server:
```bash
yarn start
```

This will start a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the static website
- `npm run serve` - Serve the built website locally
- `npm run deploy` - Deploy the site to production
- `npm run clear` - Clear the local build cache

## Project Structure

```
backend/
├── src/                    # Source code
│   ├── modules/           # Feature modules
│   ├── database/          # Database configurations and migrations
│   ├── decorators/        # Custom decorators
│   ├── guards/            # Authentication and authorization guards
│   ├── providers/         # Service providers
│   ├── processors/        # Background processors
│   ├── schedulers/        # Scheduled tasks
│   ├── utils/             # Utility functions
│   ├── constants/         # Application constants
│   ├── app.module.ts      # Root application module
│   └── main.ts           # Application entry point
├── test/                  # Test files
├── Dockerfile            # Docker configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── nest-cli.json         # NestJS CLI configuration
```

```
frontend/
├── src/                   # Source code
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── routes/           # Route definitions
│   ├── store/            # State management
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── lib/              # Library configurations
│   ├── graphql/          # GraphQL queries and mutations
│   ├── App.tsx           # Root component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── Dockerfile           # Docker configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── tailwind.config.ts   # Tailwind CSS configuration
```

## 📚 Documentation

Detailed documentation is available in the [docs](https://cuemeet.github.io/CueHired/) directory:

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

---

## 🔐 Security

Please refer to [SECURITY.md](./SECURITY.md) for information about reporting security vulnerabilities and best practices.

---

## 🆙 Upgrading

For version compatibility and migration steps, see [UPGRADE.md](./UPGRADE.md).

---

## 📜 Code of Conduct

We follow a standard of respectful communication and collaboration. Please review our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

---

## 📝 License

This project is licensed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE)  — see the LICENSE file for details.

<div align="center">
  Made with ❤️ by CueCard.ai team
</div>