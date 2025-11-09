# NEET.me - Linktree Clone

A modern link-in-bio platform where users sign in with wallet, email, or social accounts and get their own personalized page at `domain.com/[username]`.

## Features

- 🔐 **Multi-Auth Support** - WalletConnect, Email, Google, GitHub, Apple, X, Discord
- 👤 Dynamic user profiles at `/[username]`
- 🔗 Customizable links with icons (Simple Icons integration)
- 📝 Bio editing
- 🖼️ Profile picture upload with client-side compression
- 🎨 Modern, responsive UI
- 🌙 Dark mode support
- 💾 **Database-backed storage** - All images stored in PostgreSQL

## Quick Start (Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/neetmetree"
   NEXT_PUBLIC_REOWN_PROJECT_ID="your_reown_project_id"
   NEXT_PUBLIC_APP_URL="http://localhost:1337"
   NEXTAUTH_URL="http://localhost:1337"
   NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
   ```

   **Important:** You need a PostgreSQL database running locally. You can:
   - Install PostgreSQL locally
   - Use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`
   - Use a cloud PostgreSQL service (like Railway, Supabase, or Neon)

3. **Get Reown Project ID:**
   - Sign up at [Reown Dashboard](https://dashboard.reown.com)
   - Create a new project
   - Copy your Project ID

4. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:1337](http://localhost:1337)** in your browser.

## Deployment to Railway

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for complete deployment instructions.

**Quick Railway Setup:**
1. Push code to GitHub
2. Create Railway project from GitHub repo
3. Add PostgreSQL database
4. Set environment variables (see `.env.example`)
5. Run `railway run npm run railway` to migrate database
6. Deploy!

## Tech Stack

- **Next.js 14** - React framework
- **Reown (WalletConnect)** - Authentication (600+ wallets, social, email)
- **Prisma** - Database ORM
- **PostgreSQL** - Database (required for all environments)
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Simple Icons** - Social media icons

## Project Structure

```
├── pages/
│   ├── [username].tsx      # Dynamic user profile page
│   ├── dashboard.tsx        # User dashboard for editing
│   ├── index.tsx            # Landing page
│   ├── setup/               # Username setup flow
│   └── api/
│       ├── auth/            # Authentication routes
│       ├── links/           # Link management API
│       ├── profile.ts       # Profile update API
│       ├── upload/           # Image upload API
│       └── images/           # Image serving API
├── lib/
│   ├── appkit.ts            # Reown AppKit configuration
│   ├── authContext.tsx      # Auth context provider
│   ├── auth.ts              # Auth middleware
│   ├── prisma.ts            # Prisma client
│   ├── socialIcons.ts       # Simple Icons integration
│   └── utils.ts             # Utility functions
├── prisma/
│   └── schema.prisma        # Database schema (PostgreSQL)
└── styles/
    └── globals.css           # Global styles
```

## Environment Variables

See `.env.example` for all required environment variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_REOWN_PROJECT_ID` - Reown project ID
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXTAUTH_URL` - NextAuth URL (same as APP_URL)
- `NEXTAUTH_SECRET` - Secret key for sessions

## Database

**PostgreSQL is required for all environments** (development and production).

All user-uploaded content (avatars, custom icons) is stored as base64 in PostgreSQL.

### Setting up PostgreSQL for Local Development

**Option 1: Local PostgreSQL Installation**
1. Install PostgreSQL on your machine
2. Create a database: `createdb neetmetree`
3. Update `DATABASE_URL` in `.env`

**Option 2: Docker**
```bash
docker run --name postgres-neetmetree \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=neetmetree \
  -p 5432:5432 \
  -d postgres
```

**Option 3: Cloud PostgreSQL (Recommended)**
- Use Railway, Supabase, or Neon for a free PostgreSQL database
- Copy the connection string to your `.env` file

## License

MIT

