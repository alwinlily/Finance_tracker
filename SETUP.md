# Finance Tracker - Setup Instructions

A comprehensive finance tracking application built with Next.js, Clerk, Supabase, and AI-powered categorization.

## Features

- **Track Expenses & Income**: Monitor transactions across multiple wallets
- **Debt Management**: Track receivables and payables with due dates
- **Smart Reminders**: Automated notifications for debt collections and payments
- **AI Categorization**: Intelligent transaction categorization using AI
- **Dashboard Analytics**: Visual insights with charts and statistics
- **Multi-Wallet Support**: Manage cash, bank accounts, e-wallets, and investments

## Prerequisites

- Node.js 18+
- npm or yarn
- Clerk account (for authentication)
- Supabase account (for database)
- OpenAI or Anthropic API key (optional, for AI features)

## Installation

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# AI Integration (Optional - for transaction categorization)
ANTHROPIC_API_KEY=sk-ant-...
# OR
OPENAI_API_KEY=sk-...
```

### 3. Set Up Supabase Database

#### A. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key to `.env.local`

#### B. Set Up Clerk Integration in Supabase

1. In your Supabase project, go to **Settings** → **Auth** → **Third-Party Auth**
2. Enable **JWT Template** for **Clerk**
3. In Clerk dashboard:
   - Go to **JWT Templates**
   - Create a new template for Supabase
   - Copy the JWKS Endpoint URL
4. Paste the JWKS URL in Supabase JWT settings

#### C. Run Database Migrations

In Supabase SQL Editor, run these migrations in order:

1. **002_finance_tracker_schema.sql** - Creates all database tables
2. **003_finance_tracker_rls.sql** - Sets up Row Level Security policies

You can find these files in `supabase/migrations/`

### 4. Set Up Clerk

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application
3. Copy your publishable key and secret key to `.env.local`
4. In **JWT Templates**, create a Supabase template
5. Ensure Email authentication is enabled

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Time Setup

1. **Sign In**: Click "Sign In" and create an account
2. **Onboarding**: Complete the onboarding flow (creates profile, default wallet, and categories)
3. **Start Tracking**: Begin adding transactions, debts, and setting up reminders

## Usage

### Dashboard
- View balance across all wallets
- See monthly income and expenses
- Track outstanding debts
- Visualize spending by category

### Transactions
- Add expenses, income, transfers, and investments
- Use AI categorization (click AI button after entering description)
- Filter and search transactions
- Edit or delete existing transactions

### Debts Manager
- Track money you've lent (receivables)
- Track money you owe (payables)
- Record partial payments
- Monitor due dates and overdue debts

### Reminders
- Set up email reminders for debt collections
- Configure recurring reminders
- View reminder history

### Settings
- Manage wallets (cash, bank, e-wallet, investment accounts)
- View and organize categories
- Update profile preferences

## Database Schema

### Core Tables

- **profiles**: User profiles (linked to Clerk)
- **wallets**: User accounts (cash, bank, e-wallet, investment)
- **categories**: Transaction categories (expense, income, investment)
- **transactions**: All financial transactions
- **debts**: Receivables and payables
- **debt_payments**: Payment records for debts
- **reminders**: Scheduled notifications
- **counterparties**: People/entities you transact with

### Security

All tables use Row Level Security (RLS) with Clerk JWT integration:
- Users can only access their own data
- `user_id` from Clerk JWT is matched against table rows
- Composite foreign keys ensure data isolation

## Currency Format

- All amounts stored in **minor units** (IDR * 100)
- Example: Rp 10,000 stored as 1,000,000
- Display formatting handles conversion automatically

## AI Categorization

When adding a transaction:
1. Enter a description
2. Click the "AI" button
3. AI suggests the best category based on description
4. You can override the suggestion manually

Requires either `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` in environment.

## Reminder System (Future)

The reminder system uses Supabase Edge Functions and Scheduled Cron:
- Daily checks for due reminders
- Sends notifications via email, Telegram, or webhooks
- Handles recurring reminders (RFC 5545 RRULE format)
- Logs all reminder executions

To set up:
1. Deploy Edge Function: `supabase functions deploy reminder_dispatcher`
2. Set up cron: Schedule in Supabase dashboard for daily 08:00 Asia/Jakarta

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **AI**: Vercel AI SDK with Anthropic Claude / OpenAI
- **UI**: shadcn/ui + TailwindCSS
- **Charts**: Recharts
- **Language**: TypeScript

## Troubleshooting

### "Unauthorized" errors
- Check Clerk keys in `.env.local`
- Verify JWT template is set up correctly
- Ensure middleware is protecting routes

### Database access denied
- Verify Supabase RLS policies are created
- Check Clerk JWT integration in Supabase
- Ensure JWKS endpoint is correct

### AI categorization not working
- Verify `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is set
- Check API key validity
- Review browser console for errors

## Contributing

This is a starter template. Feel free to customize:
- Add more transaction types
- Enhance debt payment workflows
- Implement multi-currency support
- Add OCR receipt scanning
- Create shared ledgers
- Build mobile apps

## License

MIT
