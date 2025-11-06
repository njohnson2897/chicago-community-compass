# Backend Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**

Install PostgreSQL if you haven't already, then:
```bash
createdb chicago_compass
```

**Option B: Managed Database (Recommended for Easy Setup)**

Use one of these free tier options:
- **Supabase**: https://supabase.com (free PostgreSQL)
- **Neon**: https://neon.tech (serverless PostgreSQL)
- **Railway**: https://railway.app (includes PostgreSQL)

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` and update:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Generate a strong random string (use `openssl rand -hex 32`)

### 4. Set Up Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create tables
npm run db:migrate
```

### 5. Start the Server

```bash
# Development mode (auto-reload)
npm run dev

# Or production mode
npm start
```

The server will run on `http://localhost:3001`

## Verify Setup

1. Check health endpoint:
```bash
curl http://localhost:3001/api/health
```

2. Register a test provider:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "organizationName": "Test Organization"
  }'
```

## Common Issues

### Database Connection Error
- Check your `DATABASE_URL` is correct
- Ensure PostgreSQL is running (if local)
- Verify database exists

### Port Already in Use
- Change `PORT` in `.env` to a different number (e.g., 3002)

### Prisma Client Not Generated
- Run `npm run db:generate` before starting server

## Next Steps

Once the backend is running:
1. Test the API endpoints (see README.md)
2. Connect the frontend to the backend
3. Start building provider portal features

