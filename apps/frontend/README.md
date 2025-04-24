# Order Management System

A modern, responsive web application for managing orders, inventory, and customer relationships. Built with Next.js and React, this system provides a seamless experience for tracking orders, managing products, and monitoring business performance.

## Features

- **Dashboard Overview**: View key business metrics, recent orders, and product inventory at a glance
- **Order Management**: Create, view, update, and cancel orders with real-time status tracking
- **Product Management**: Manage your product catalog with inventory tracking
- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile devices
- **Authentication**: Secure user authentication and authorization
- **Data Visualization**: Charts and statistics to help visualize business performance

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **UI Components**: Shadcn UI with Radix UI primitives
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form with Zod validation
- **API Integration**: Custom API client with fetch
- **Data Visualization**: Recharts
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/abdelhadia72/order-management-app.git
```

2. Install the dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory and add the following:

```
NEXT_PUBLIC_API_URL=your_api_url_here
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

### Dashboard

The dashboard provides an overview of your business performance including:
- Total orders and revenue
- Recent orders
- Product inventory status
- Sales trends

### Managing Orders

1. Navigate to the Orders tab to view all orders
2. Click on an order to view details
3. Update order status or cancel orders as needed
4. Create new orders through the "New Order" button

### Managing Products

1. Navigate to the Products tab to view your product catalog
2. Add, edit, or remove products as needed
3. Monitor inventory levels and set up alerts for low stock

## Project Structure

```
order-management-system01/
├── app/                  # Next.js app router
│   ├── (dashboard)/      # Dashboard routes
│   ├── api/              # API routes
├── components/           # React components
│   ├── ui/               # Shadcn UI components
│   ├── dashboard/        # Dashboard-specific components
├── lib/                  # Utility libraries
│   ├── api/              # API client and services
├── hooks/                # Custom React hooks
├── styles/               # Global styles
├── utils/                # Utility functions
├── public/               # Static assets
```

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

