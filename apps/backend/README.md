# Order Management System (backend)

A robust API for managing orders, products, and users with authentication, role-based access control, and comprehensive error handling.

## Features

- **User Management**
  - Registration and authentication
  - Role-based access (Admin/User)
  - User profiles

- **Product Management**
  - Create and list products
  - Product details including price, stock, and description
  - Owner-based product visibility

- **Order Management**
  - Create orders with multiple products
  - View order history
  - Order status tracking

- **Security**
  - JWT-based authentication
  - Password hashing using bcrypt
  - Role-based access control

- **API Documentation**
  - Swagger UI integration for easy API exploration

## Tech Stack

- **Backend**: NestJS (TypeScript-based Node.js framework)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Class-validator and class-transformer
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- pnpm package manager
- PostgreSQL database

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/ordermanagement?schema=public"
JWT_SECRET="your-secret-key"
```

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/abdelhadia72/order-management-system.git
   cd order-management-system
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Generate Prisma client
   ```bash
   pnpm prisma:generate
   ```

4. Run database migrations
   ```bash
   pnpm prisma:migrate
   ```

5. Seed the database (optional)
   ```bash
   pnpm prisma:seed
   ```

### Running the Application

Start the development server:
```bash
pnpm start
```

The API will be available at `http://localhost:8000` by default.

### API Documentation

Access the Swagger UI documentation at `http://localhost:8000/api`

## API Endpoints

### Auth
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token

### Users
- `GET /users/me` - Get current user profile
- `GET /users` - Get all users (admin only)
- `GET /users/:userId` - Get user by ID (admin only)
- `POST /users` - Create new user (admin only)
- `DELETE /users/:userId` - Delete user (admin only)

### Products
- `POST /products` - Create a new product
- `GET /products` - Get products created by the user
- `GET /products/admin/all` - Get all products (admin only)
- `GET /products/:productId` - Get product by ID

### Orders
- `POST /orders` - Create a new order
- `GET /orders` - Get orders placed by the user
- `GET /orders/admin/all` - Get all orders (admin only)
- `GET /orders/:orderId` - Get order by ID

## Default Users

After running the seed command, the following users will be created:

- **Admin User**
  - Email: juma@jumatech.com
  - Password: juma123
  - Role: admin

- **Regular User 1**
  - Email: john@example.com
  - Password: password123
  - Role: user

- **Regular User 2**
  - Email: jane@example.com
  - Password: password123
  - Role: user

