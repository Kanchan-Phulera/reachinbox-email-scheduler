# ReachInbox Email Job Scheduler

A full-stack email scheduling application built for the ReachInbox internship assignment.

The application allows users to register/login, compose emails, schedule them for a future date and time, view scheduled emails, and view sent emails with Ethereal preview links.

## Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- Nodemailer
- Ethereal Email
- JWT authentication
- bcryptjs

### Frontend
- React.js
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS

### Infrastructure
- Docker / Docker Compose
- PostgreSQL container
- Redis container

## Features

- User registration and login
- bcrypt password hashing
- JWT authentication and protected email APIs
- Email composition and future scheduling
- BullMQ delayed jobs backed by Redis
- PostgreSQL persistence through Prisma
- BullMQ worker for scheduled processing
- Ethereal SMTP email sending
- Scheduled / Processing / Sent / Failed status tracking
- Ethereal preview URL for sent emails
- Dashboard with email statistics and activity
- Scheduled Emails and Sent Emails views
- Logout and protected routes

## Project Structure

```text
ReachInbox/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   └── redis.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── email.controller.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── queues/
│   │   │   └── email.queue.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── email.routes.ts
│   │   ├── workers/
│   │   │   └── email.worker.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── prisma.config.ts
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ScheduleEmail.tsx
│   │   │   ├── ScheduledEmails.tsx
│   │   │   └── SentEmails.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## Requirements

Install:

- Node.js
- npm
- Docker Desktop
- Git

Docker is used to run PostgreSQL and Redis.

## Environment Variables

Create:

```text
backend/.env
```

Use:

```env
PORT=5000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/email_scheduler"

REDIS_HOST=localhost
REDIS_PORT=6379

ETHEREAL_HOST=smtp.ethereal.email
ETHEREAL_PORT=587
ETHEREAL_USER=
ETHEREAL_PASSWORD=

JWT_SECRET=
```

Do not commit the real `.env` file.

Use `backend/.env.example` as the template.

## Ethereal Email Setup

Ethereal Email provides a fake SMTP service for testing email delivery without sending real emails to recipients.

1. Create an Ethereal test account.
2. Copy the SMTP username and password.
3. Add them to `backend/.env`:

```env
ETHEREAL_HOST=smtp.ethereal.email
ETHEREAL_PORT=587
ETHEREAL_USER=your_ethereal_username
ETHEREAL_PASSWORD=your_ethereal_password
```

When the worker sends an email, Nodemailer creates an Ethereal preview URL. The preview URL is stored in PostgreSQL and displayed on the Sent Emails page.

## Running the Backend

From the project root:

```powershell
docker compose up -d
```

Then:

```powershell
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npm start
```

Backend:

```text
http://localhost:5000
```

The backend provides the Express API and starts the BullMQ worker.

## Running the Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, for example:

```text
http://localhost:5174
```

## Architecture Overview

```text
                         React Frontend
                              |
                              | REST API + JWT
                              v
                     Express + TypeScript
                       /              \
                      /                \
                     v                  v
               PostgreSQL             BullMQ
                                        |
                                        v
                                      Redis
                                        |
                                  delayed job
                                        |
                                        v
                                  BullMQ Worker
                                        |
                                        v
                                Nodemailer / SMTP
                                        |
                                        v
                                  Ethereal Email
                                        |
                     +------------------+------------------+
                     |                                     |
                     v                                     v
              Email status                          Preview URL
                     |
                     v
                 PostgreSQL
```

## How Scheduling Works

1. User logs in.
2. User opens **Schedule Email**.
3. User enters recipient, subject, message, and a future date/time.
4. Frontend sends `POST /api/emails`.
5. JWT authentication middleware verifies the user.
6. The email is saved in PostgreSQL with status `SCHEDULED`.
7. A delayed BullMQ job containing the email ID is added to Redis.
8. Redis keeps the delayed job until its scheduled execution time.
9. The BullMQ worker receives the job.
10. The worker fetches the email from PostgreSQL.
11. Status changes to `PROCESSING`.
12. Nodemailer sends the email through Ethereal SMTP.
13. On success, PostgreSQL is updated to `SENT`.
14. Message ID, sent time, and Ethereal preview URL are stored.
15. The Sent Emails page displays the result.

Failed jobs are stored with status `FAILED` and the error message.

## Persistence on Restart

Scheduling does not depend on `setTimeout` or an in-memory JavaScript timer.

- PostgreSQL stores email records.
- Redis stores BullMQ delayed jobs.
- Docker Compose uses persistent volumes for PostgreSQL and Redis.

Therefore, restarting the backend does not remove scheduled jobs. When the worker starts again, pending BullMQ jobs can continue processing.

## Rate Limiting and Concurrency

### Concurrency

The current worker uses BullMQ's default worker concurrency. No custom higher concurrency value is configured.

If higher parallel processing is required, BullMQ supports explicit worker concurrency, for example:

```ts
new Worker(
  "email-queue",
  processor,
  {
    connection: redisConnection,
    concurrency: 5,
  }
);
```

### Rate Limiting

No explicit BullMQ rate limiter is currently configured in this implementation.

For production use, BullMQ rate limiting can be added to control the number of jobs processed during a time window.

Example:

```ts
limiter: {
  max: 10,
  duration: 1000,
}
```

This README documents the current implementation rather than claiming a rate limiter that is not configured.

## API Overview

### Register

```http
POST /api/auth/register
```

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Login

```http
POST /api/auth/login
```

Returns a JWT token.

### Schedule Email

```http
POST /api/emails
```

Requires:

```http
Authorization: Bearer <JWT>
```

Example:

```json
{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "body": "Hello from ReachInbox",
  "scheduledAt": "2026-09-29T12:00:00.000Z"
}
```

### Get All Emails

```http
GET /api/emails
```

### Get Scheduled Emails

```http
GET /api/emails/scheduled
```

### Get Sent Emails

```http
GET /api/emails/sent
```

All email endpoints require a valid JWT.

## Implemented Features Mapped to Assignment

### Backend

| Requirement | Implementation |
|---|---|
| Email scheduler | BullMQ delayed jobs |
| Persistence | PostgreSQL + Redis |
| Database ORM | Prisma |
| Email sending | Nodemailer + Ethereal SMTP |
| Worker | BullMQ Worker |
| Authentication | JWT + bcrypt |
| Status tracking | SCHEDULED / PROCESSING / SENT / FAILED |
| Restart persistence | Docker persistent volumes |
| Concurrency | BullMQ default worker concurrency |
| Rate limiting | Not explicitly configured |

### Frontend

| Requirement | Implementation |
|---|---|
| Login | React login page + JWT |
| Registration | React registration page |
| Dashboard | Email statistics and activity |
| Compose | Schedule Email page |
| Scheduled emails | Scheduled Emails page |
| Sent emails | Sent Emails page |
| Preview | Ethereal preview URL |
| API communication | Axios |
| Styling | Tailwind CSS |
| Routing | React Router |

## Database Models

The `Email` model stores:

```text
id
to
subject
body
scheduledAt
status
sentAt
messageId
previewUrl
error
createdAt
updatedAt
```

The `User` model stores:

```text
id
email
password
createdAt
updatedAt
```

Passwords are stored as bcrypt hashes rather than plain text.

## Docker Services

### PostgreSQL

```text
localhost:5432
```

Database:

```text
email_scheduler
```

### Redis

```text
localhost:6379
```

Start:

```powershell
docker compose up -d
```

Stop without deleting persistent data:

```powershell
docker compose down
```

Avoid:

```powershell
docker compose down -v
```

because `-v` deletes the persistent volumes.

## Production Build

Frontend:

```powershell
cd frontend
npm run build
```

Backend:

```powershell
cd backend
npm run build
```

Backend production server:

```powershell
npm run start:prod
```

## Security Notes

- `.env` must not be committed.
- Database credentials must not be committed.
- Ethereal credentials must not be committed.
- JWT secret must not be committed.
- Authentication APIs use bcrypt password hashing.
- Email APIs require a valid JWT.

## Application Flow

```text
Register
   ↓
Login
   ↓
JWT token
   ↓
Dashboard
   ↓
Compose Email
   ↓
Select future date/time
   ↓
POST /api/emails
   ↓
PostgreSQL + BullMQ
   ↓
Redis delayed job
   ↓
Scheduled time
   ↓
BullMQ Worker
   ↓
Nodemailer
   ↓
Ethereal SMTP
   ↓
SENT
   ↓
Preview URL
   ↓
Sent Emails
```

## Author

**Kanchan Phulera**

Full Stack Developer

GitHub: https://github.com/Kanchan-Phulera
