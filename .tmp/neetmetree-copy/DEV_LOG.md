# Development Log

## Development Accounts

### Test Profile: `/felirami`
- **Username**: `felirami`
- **Purpose**: Development and testing account
- **Created**: 2024
- **Profile URL**: `http://localhost:1337/felirami`
- **Note**: This is a test account for local development. Do not delete in production without creating a new test account first.
- **Status**: ✅ Active and accessible

## Dev Mode Access

### Dev Dashboard Menu: `/dev`
- **URL**: `http://localhost:1337/dev`
- **Purpose**: Access any profile's dashboard without authentication
- **How to use**:
  1. Go to `http://localhost:1337/dev`
  2. Select a profile from the dropdown
  3. Click "Access Dashboard"
  4. You'll be taken to `/dev/dashboard/[username]` where you can edit that profile

### Dev Dashboard: `/dev/dashboard/[username]`
- **Example**: `http://localhost:1337/dev/dashboard/felirami`
- **Features**: Full dashboard access without login
- **Note**: Only works in development mode (NODE_ENV !== 'production')

## Important Notes

- Minimum username length: **5 characters**
- Usernames can be changed from the dashboard
- Temporary usernames start with `temp_` and are blocked from public access
- Users are redirected to `/setup/username` if they have a temporary username

## Environment Setup

- **Local URL**: `http://localhost:1337`
- **Database**: PostgreSQL (required for all environments)
- **Auth**: Reown (WalletConnect) with social/email login
- **Note**: PostgreSQL is required even for local development. See README.md for setup options.

## Quick Commands

```bash
# Start dev server
npm run dev

# Database commands
npm run db:push      # Push schema changes
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

## Development Workflow

1. Test profile is available at `/felirami`
2. Use this account to test profile pages, links, and UI
3. Can sign in with any method (wallet, email, social) to test auth flow
4. Username can be changed from dashboard (min 5 chars)
5. Use `/dev` menu to quickly access any profile's dashboard for testing



