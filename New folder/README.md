# Project Task Tracker

A Next.js app for managing projects, assigning tasks, and tracking progress with Admin/Member access control.

## Features
- Signup/login with JWT cookie auth
- Role-based access control for Admin and Member
- Project and team management
- Task creation, assignment, and status tracking
- Dashboard metrics for tasks, status, and overdue work
- REST APIs backed by Prisma
- Railway-ready deployment configuration

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file from `.env.example`.
3. Generate the Prisma client and run migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
4. Start the app:
   ```bash
   npm run dev
   ```

## Railway Deployment
- Set `DATABASE_URL` and `JWT_SECRET` in Railway.
- Run `npm run prisma:deploy` during the deploy process.
- Start command: `npm run start`

## Notes
- Local development uses PostgreSQL through `DATABASE_URL`.
- The app uses server-side RBAC checks for protected routes and APIs.
