# Chicago Community Compass - Backend API

Backend API server for Chicago Community Compass, built with Node.js, Express, and PostgreSQL.

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up Database

1. Create a PostgreSQL database:
```bash
createdb chicago_compass
```

Or using a managed service like Supabase, Neon, or Railway.

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your database URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/chicago_compass?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

### 3. Run Database Migrations

```bash
npm run db:migrate
```

This will create all the database tables.

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new provider
- `POST /api/auth/login` - Login provider

### Providers (Protected)
- `GET /api/providers/me` - Get current provider profile
- `PUT /api/providers/me` - Update provider profile
- `GET /api/providers/me/services` - Get provider's services
- `GET /api/providers/me/events` - Get provider's events

### Services (Public)
- `GET /api/services` - Get all services (with filters)
- `GET /api/services/:id` - Get single service

### Services (Protected - Providers)
- `POST /api/services` - Create a new service
- `PUT /api/services/:id` - Update a service
- `DELETE /api/services/:id` - Delete a service

### Events (Public)
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event

### Events (Protected - Providers)
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Management

### View Database in Prisma Studio
```bash
npm run db:studio
```

### Create a Migration
```bash
npm run db:migrate
```

### Reset Database (Development Only)
```bash
npx prisma migrate reset
```

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── middleware/
│   │   └── auth.js         # Authentication middleware
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── providers.js    # Provider routes
│   │   ├── services.js     # Service routes
│   │   └── events.js       # Event routes
│   └── server.js           # Main server file
├── .env                    # Environment variables (not in git)
└── package.json
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

