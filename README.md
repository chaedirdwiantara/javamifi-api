# JavaMiFi Backend API

REST API backend for JavaMiFi E-commerce Application built with Node.js, Express, TypeScript, Supabase, and Midtrans.

## 🚀 Quick Start

### Prerequisites
- Node.js v20+
- Supabase account
- Midtrans account (Sandbox for testing)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase and Midtrans credentials

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📋 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Products
- `GET /categories` - Get all categories
- `GET /products` - Get products (with pagination & filters)
- `GET /products/:id` - Get product details

### Orders
- `POST /orders` - Create new order
- `GET /orders/:orderId` - Get order details

### Payment
- `POST /payment/create-transaction` - Generate Midtrans token
- `POST /payment/notification` - Midtrans webhook (internal)
- `GET /payment/status/:orderId` - Check payment status

## 🏗️ Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── services/       # Business logic
├── routes/         # API routes
├── middleware/     # Express middleware
├── types/          # TypeScript types
├── utils/          # Utility functions
├── app.ts          # Express app setup
└── server.ts       # Server entry point
```

## 🔧 Development

- **Hot reload:** `npm run dev`
- **Lint code:** `npm run lint`
- **Format code:** `npm run format`

## 📝 Environment Variables

See `.env.example` for required variables.

## 🧪 Testing

Use Thunder Client, Postman, or curl to test endpoints.

Example:
```bash
curl http://localhost:3000/health
```

## 📦 Deployment

See deployment guide in `/docs` folder (to be created).
