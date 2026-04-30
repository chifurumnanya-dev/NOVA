# NOVA — Nigerian Open Verified Access

NOVA is a production-grade, open-source healthcare data platform for Nigeria. It provides a structured API and a comprehensive dashboard for exploring health facilities and clinic schedules across the country.

## 🏗 Project Structure

This is a TypeScript monorepo managed with `npm` (or `pnpm`) and `turbo`.

- `apps/api`: Cloudflare Workers API built with Hono and Drizzle ORM.
- `apps/dashboard`: Next.js dashboard with Tailwind CSS, Recharts, and Leaflet.
- `packages/db`: Database schema, migrations, and seeder.
- `packages/utils`: Shared utility functions and HTTP response helpers.
- `packages/types`: Shared TypeScript interfaces and Zod validation schemas.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- A PostgreSQL database (e.g., Neon, Supabase, or local)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp apps/api/.dev.vars.example apps/api/.dev.vars
cp packages/db/.env.example packages/db/.env
cp apps/dashboard/.env.local.example apps/dashboard/.env.local
```

Set `ADMIN_SECRET` to the same value in `apps/api/.dev.vars` and `apps/dashboard/.env.local` if you want to use the admin dashboard locally.

### Database Setup

```bash
# Generate and run migrations
npm run db:generate
npm run db:migrate

# Seed the database with 10,000+ records
npm run db:seed
```

### Development

```bash
# Run all apps in development mode
npm run dev
```

The API will be available at `http://localhost:8787` and the Dashboard at `http://localhost:3000`.

## 🛠 Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Lucide React, Recharts, Leaflet.
- **Backend**: Hono, Cloudflare Workers.
- **Database**: PostgreSQL, Drizzle ORM.
- **Validation**: Zod.
- **Monorepo**: Turbo, npm workspaces.
- **Testing**: Vitest.

## 🔐 Security

- **Rate Limiting**: Integrated in the API (100 req/hr for anonymous users).
- **Authentication**: API Key and Admin Secret middleware for protected routes.
- **Audit Logs**: All admin actions and contributions are logged.

## 🤝 Contributing

Contributions are welcome! Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting a pull request.

## 📄 License

This project is licensed under the MIT License.
