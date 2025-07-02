# ARC Actual

This project is a Next.js application. Data was previously stored only in local state.

## Database Connection

A new connection pool using MySQL is available at `lib/db.ts`. Configure your environment variables using `.env.example` as a starting point.

### Health Check

Run `GET /api/health` to verify database connectivity.

### Authentication

Login requests are handled via `/api/login` which validates credentials against
the MySQL `usuarios` table using `bcryptjs` hashed passwords.

## Development

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```
