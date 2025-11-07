# My Chat API

My Chat API is a NestJS-based backend for experimenting with threaded chat features such as sending, editing, deleting, and replying to messages. The service exposes a versioned REST API, secures requests with common HTTP middleware, and uses Prisma to persist data in PostgreSQL.

## Table of contents

- [Architecture overview](#architecture-overview)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment variables](#environment-variables)
  - [Database setup](#database-setup)
- [Running the application](#running-the-application)
- [API documentation](#api-documentation)
- [Testing](#testing)
- [Available npm scripts](#available-npm-scripts)
- [License](#license)

## Architecture overview

- **Framework**: [NestJS](https://nestjs.com) 11 with Express under the hood for building modular services.
- **Configuration**: `@nestjs/config` loads strongly typed settings (see [`src/config/app.config.ts`](src/config/app.config.ts)).
- **Security**: [Helmet](https://helmetjs.github.io/) and [cors](https://github.com/expressjs/cors) middlewares are enabled globally during bootstrapping.
- **Validation & serialization**: `ValidationPipe` sanitizes incoming DTOs while `ClassSerializerInterceptor` shapes outgoing responses.
- **Database layer**: [Prisma](https://www.prisma.io/) (`PrismaService`) connects to a PostgreSQL instance using the schema defined in [`prisma/schema.prisma`](prisma/schema.prisma).
- **Health monitoring**: The [`HealthController`](src/modules/health/health.controller.ts) provides a versioned `/v1/health` endpoint that reports uptime.

## Project structure

```
.
├── prisma/
│   ├── schema.prisma         # PostgreSQL data model for users and messages
│   └── seed.ts               # Optional development seed script
└── src/
    ├── common/db/            # Prisma module + service for database access
    ├── config/               # Centralized configuration factories
    ├── main.ts               # Application bootstrap with global middleware
    └── modules/health/       # REST endpoint that exposes service health
```

## Getting started

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- PostgreSQL database (local Docker instance or hosted)

### Installation

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root and provide the following values:

```bash
# Application
PORT=3000
NODE_ENV=development

# Database (replace with your own connection string)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/my_chat_api?schema=public"
```

### Database setup

Synchronize the Prisma schema with your database and optionally seed baseline data:

```bash
npx prisma db push        # Creates tables defined in prisma/schema.prisma
npm run prisma:seed       # Populates the database with sample users
```

> ℹ️ `npm run prisma:seed` is safe to re-run; it uses `upsert` to avoid duplicate entries.

## Running the application

```bash
# Start the API in watch mode for development
npm run start:dev

# Start the API once (useful for production-like environments)
npm run start

# Build and serve the compiled bundle
npm run build
npm run start:prod
```

By default the server listens on `http://localhost:3000`, but you can override this via the `PORT` environment variable.

## API documentation

When `NODE_ENV` is not `production`, Swagger UI is available at [http://localhost:3000/docs](http://localhost:3000/docs) and is generated from the Nest application metadata during bootstrap.

## Testing

```bash
# Run unit tests
npm run test

# Launch the Jest watcher for development feedback
npm run test:watch

# Compute code coverage metrics
npm run test:cov

# Execute end-to-end tests
npm run test:e2e
```

## Available npm scripts

| Script                | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `npm run build`       | Compile the application to `dist/`.                    |
| `npm run lint`        | Run ESLint with automatic fixes.                       |
| `npm run format`      | Format source files using Prettier.                    |
| `npm run prisma:seed` | Seed the database with demo data.                      |
| `npm run start:debug` | Start the application with the Node inspector enabled. |

## License

This project is currently provided as **UNLICENSED**. See [`package.json`](package.json) for details.
