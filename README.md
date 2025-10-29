# Advanced E-Commerce API with Asynchronous Processing & State Management

A robust, scalable microservice backend built with Node.js, Express, MongoDB, and Mongoose. This API demonstrates advanced concepts including complex state management, asynchronous workflows, database transactions, and system resilience.

##Features

- **JWT Authentication & Authorization**: Role-based access control (User vs Admin)
- **Complex State Management**: Order lifecycle through various statuses
- **Inventory Reservation**: Stock locking mechanism to prevent race conditions
- **Advanced Database Transactions**: Multi-step atomic operations
- **Asynchronous Processing**: Background job handling with Bull Queue
- **Robust API Design**: Pagination, filtering, sorting, and comprehensive error handling
- **Real-time Order Processing**: Automatic expiration handling and stock management

## System Workflow

1. **User Registration/Login**: Users register and receive JWT tokens
2. **Product Browsing**: Users can view products with pagination and filtering
3. **Cart Management**: Add/remove items with real-time stock validation
4. **Checkout Process**: Creates order with `PENDING_PAYMENT` status and reserves stock
5. **Payment Processing**: Mock payment with 90% success rate
6. **Order Fulfillment**: Admin can update order status to `SHIPPED`/`DELIVERED`
7. **Automatic Cleanup**: Expired orders are automatically cancelled and stock released

## Architecture

```
├── controllers/          
├── middleware/          
├── models/             
├── routes/             
├── services/            
├── config/             
└── server.js            
```

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Queue Processing**: Bull (Redis-based)
- **Security**: Helmet, CORS, Rate Limiting
- **Background Jobs**: node-cron

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp config.env .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB and Redis**
   ```bash
   # MongoDB
   mongod
   
   # Redis (for queue processing)
   redis-server
   ```

5. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce-api
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Login user and return JWT
- `GET /me` - Get current user details

### Products (`/api/products`)
- `GET /` - List all products (with pagination, sorting, filtering)
- `GET /:id` - Get single product
- `POST /` - Create product (Admin only)
- `PUT /:id` - Update product (Admin only)
- `DELETE /:id` - Delete product (Admin only)

### Cart (`/api/cart`)
- `GET /` - View user's cart
- `POST /items` - Add item to cart
- `PUT /items/:productId` - Update item quantity
- `DELETE /items/:productId` - Remove item from cart
- `DELETE /` - Clear cart

### Orders (`/api/orders`)
- `POST /checkout` - Create order from cart
- `POST /:id/pay` - Process payment for order
- `GET /` - Get user's order history
- `GET /:id` - Get single order details

### Admin (`/api/admin`)
- `GET /orders` - Get all orders (with filtering)
- `GET /orders/stats` - Get order statistics
- `GET /orders/:id` - Get single order
- `PATCH /orders/:id/status` - Update order status

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **USER**: Can manage cart, place orders, view own orders
- **ADMIN**: Full access to all resources, can manage products and orders

## Order State Management

The order lifecycle follows these transitions:

```
PENDING_PAYMENT → PAID → SHIPPED → DELIVERED
       ↓              ↓
   CANCELLED      CANCELLED
```

- **PENDING_PAYMENT**: Order created, stock reserved, payment pending
- **PAID**: Payment successful, stock deducted, email queued
- **SHIPPED**: Order shipped by admin
- **DELIVERED**: Order delivered
- **CANCELLED**: Payment failed or expired, stock released

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents abuse (100 requests per 15 minutes)
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Mongoose ODM
- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers

##  Performance Features

- **Database Indexing**: Optimized queries
- **Pagination**: Efficient data loading
- **Connection Pooling**: MongoDB connection management
- **Background Processing**: Non-blocking operations
- **Caching**: Redis-based queue system

## Monitoring & Logging

- **Health Check**: `/api/health` endpoint
- **Error Logging**: Centralized error handling
- **Job Monitoring**: Queue status and processing
- **Performance Metrics**: Request timing and database queries

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Add Product (Admin)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Laptop",
    "price": 999.99,
    "description": "High-performance laptop",
    "stock": 50
  }'
```

### Checkout Order
```bash
curl -X POST http://localhost:3000/api/orders/checkout \
  -H "Authorization: Bearer <user-token>"
```

## 🔧 Configuration

### Database Configuration
- MongoDB connection with retry logic
- Automatic reconnection on failure
- Connection pooling for performance

### Queue Configuration
- Redis-based job queue
- Automatic retry on failure
- Job cleanup and monitoring



