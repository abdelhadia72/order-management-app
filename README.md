# Order Management App

A full-stack order management solution built with Next.js 15, Nest.js, Prisma, and PostgreSQL in a monorepo structure.

## Features

- Create, view, update, and manage orders
- Track products and inventory
- Customer information management
- Modern UI with Mantine components and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router) with React 19, Mantine UI, and Tailwind CSS
- **Backend**: Nest.js API with Swagger documentation
- **Database**: PostgreSQL with Prisma ORM
- **DevOps**: Docker containerization for development environment
- **Tools**: TypeScript, pnpm monorepo

## Getting Started

### Prerequisites

- Node.js 20.x
- pnpm 8.x
- Docker and Docker Compose

### Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Start the development environment:
   ```
   docker compose up
   ```

The applications will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger Documentation: http://localhost:8000

## Project Structure

```
order-management-app/
├── apps/
│   ├── frontend/       # Next.js application
│   └── backend/        # Nest.js API
├── packages/
│   └── shared-types/   # Shared TypeScript interfaces
├── docker/            # Docker configuration files
└── docker-compose.yml # Docker Compose configuration
```
