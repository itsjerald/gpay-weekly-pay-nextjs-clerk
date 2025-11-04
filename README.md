# GPay Weekly Pay — Next.js + Clerk + Postgres (Prisma) Starter

A secure financial tracking web application built with Next.js, Clerk authentication, and Prisma ORM. Track your friend's weekly expenses and mark them as paid with verified transactions.

## Features

- ✅ Clerk authentication with session management
- ✅ Prisma ORM with SQLite (local) or PostgreSQL (production)
- ✅ Transaction tracking and marking as paid
- ✅ Payment history recording
- ✅ Weekly expense summaries
- ✅ Secure API endpoints with user verification

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (for production) or SQLite (local development)
- Clerk account (https://clerk.com)
- Vercel account for deployment (optional)

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/gpay-weekly-pay-nextjs-clerk.git
cd gpay-weekly-pay-nextjs-clerk
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Database (SQLite for local development)
DATABASE_URL="file:./dev.db"

# Clerk Authentication Keys (get from https://dashboard.clerk.com)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_FRONTEND_API=your_clerk_frontend_api
CLERK_BACKEND_API=your_clerk_backend_api

# Optional: Default friend's UPI for payment links
DEFAULT_PAYEE_UPI=friend@upi
```

**Important:** Do NOT commit `.env.local` to version control. It contains secrets.

### 4. Initialize the database

```bash
npx prisma migrate dev --name init
```

This creates the SQLite database and applies migrations.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
.
├── pages/
│   ├── api/
│   │   └── markPaid.js        # API endpoint to mark transactions as paid
│   └── _app.js                # Next.js app wrapper with Clerk provider
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Auto-generated migrations
├── lib/
│   └── db.ts                  # Prisma client instance
├── public/                    # Static assets
├── package.json               # Dependencies
├── .env.local                 # Environment variables (git-ignored)
└── README.md                  # This file
```

## API Routes

### POST `/api/markPaid`

Mark transactions as paid and create a payment record.

**Request body:**
```json
{
  "txnIds": ["id1", "id2"],
  "payerId": "your_name",
  "amount": 5000.00
}
```

**Response:**
```json
{
  "message": "Marked 2 transactions as paid."
}
```

**Authentication:** Requires valid Clerk session (Bearer token or session cookie).

## Database Schema

### Transaction Model

- `id`: Unique identifier (CUID)
- `userId`: User ID from Clerk
- `amount`: Transaction amount
- `date`: Transaction date
- `category`: Optional category
- `description`: Optional description
- `paid`: Boolean flag (default: false)
- `weekPaid`: Week when marked as paid (ISO date string)
- `createdAt`: Timestamp

### Payment Model

- `id`: Unique identifier (CUID)
- `payerId`: Person making the payment
- `payeeId`: Person receiving the payment (friend)
- `amount`: Payment amount
- `txnRefs`: Array of transaction IDs included in this payment
- `createdAt`: Timestamp

## Production Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project" and select your GitHub repository
4. Set environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `CLERK_*`: Your Clerk API keys
5. Deploy

### Production Database Setup

For production, use PostgreSQL instead of SQLite:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gpay_db"
```

Then run migrations:
```bash
npx prisma migrate deploy
```

## Security Considerations

⚠️ **Important:** The current implementation is a prototype. Before production use:

1. **MFA Requirement**: Add server-side MFA step-up check in `/api/markPaid` endpoint
   - Use Clerk's `sessionClaims` to enforce re-authentication for sensitive operations
   - Reference: https://clerk.com/docs/custom-flows/server-side-verification

2. **File Upload Security** (if implementing PDF/CSV parsing):
   - Add file size limits
   - Scan for malicious content
   - Validate file types
   - Use antivirus scanning service

3. **Encryption**: Consider encrypting sensitive fields at rest:
   - UPI IDs
   - Payment references
   - User contact information

4. **Rate Limiting**: Implement rate limiting on API endpoints:
   - `/api/markPaid`: Max 5 requests per minute per user
   - Prevent brute-force attempts

5. **Input Validation**: Validate all user inputs:
   - Amount values (no negative numbers)
   - Transaction IDs (CUID format)
   - Email/UPI formats

6. **Audit Logging**: Log all payment markings for compliance:
   - Who marked which transactions as paid
   - Timestamp and amount
   - IP address

## Development Guide

### Adding a new database model

1. Update `prisma/schema.prisma`
2. Create a migration: `npx prisma migrate dev --name add_new_model`
3. Use in your Next.js pages/API routes

### Creating new API routes

Example: `pages/api/example.js`
```javascript
import { auth } from '@clerk/nextjs/server'
import prisma from '../../lib/db'

export default async function handler(req, res) {
  const { userId } = auth(req)
  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  
  // Your logic here
  res.json({ success: true })
}
```

### Database queries

```javascript
// Create
await prisma.transaction.create({ data: { userId, amount, date } })

// Read
await prisma.transaction.findUnique({ where: { id } })
await prisma.transaction.findMany({ where: { userId } })

// Update
await prisma.transaction.update({ where: { id }, data: { paid: true } })

// Delete
await prisma.transaction.delete({ where: { id } })
```

## Troubleshooting

### "Cannot find module '@clerk/nextjs'"

Run: `npm install @clerk/nextjs`

### "Prisma Client not generated"

Run: `npx prisma generate`

### "Database connection error"

- Check `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running (for production)
- For SQLite, delete `dev.db` and run: `npx prisma migrate dev --name init`

### "Clerk authentication failing"

- Verify `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `.env.local`
- Check Clerk dashboard for correct API keys
- Ensure Clerk app URLs are configured for your domain

## Next Steps

1. ✅ Implement PDF/CSV parsing for Google Pay statements
2. ✅ Add transaction import UI
3. ✅ Build dashboard with weekly summaries
4. ✅ Add email notifications for payment reminders
5. ✅ Implement QR code generation for payment requests
6. ✅ Add step-up MFA for sensitive operations

## Contributing

Feel free to fork and submit pull requests!

## License

MIT

## Support

For issues or questions, open an issue on GitHub.
