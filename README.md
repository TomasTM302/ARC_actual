# ARC Actual

This project is a Next.js application. Data was previously stored only in local state.

## Database Connection

A new connection pool using MySQL is available at `lib/db.ts`. Configure your environment variables using `.env.example` as a starting point.

### Health Check

Run `GET /api/health` to verify database connectivity.

### Authentication

Login requests are handled via `/api/login` which validates credentials against
the MySQL `usuarios` table using `bcryptjs` hashed passwords.

### File Uploads

`POST /api/upload` saves images to an FTP server configured with environment
variables (`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`, `FTP_BASE_PATH`, and
`FTP_PUBLIC_URL_BASE`). The response returns the public URL of the uploaded
file.

## Development

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```
