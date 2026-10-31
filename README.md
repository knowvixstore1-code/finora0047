# Finora — Personal Finance Manager

A dark, responsive personal finance web app built with React, Vite, Tailwind CSS v4, Supabase (PostgreSQL + Auth), Recharts and PWA support.

## Features included

- Responsive dark dashboard for phone and laptop
- Supabase email/password sign-up and sign-in
- Private user-scoped transactions, budgets, savings goals and recurring-transaction schema
- Income and expense transactions with category, date, payment method and notes
- Monthly income/expense totals, cash-flow chart and spending category chart
- Category budgets and progress indicators
- Savings-goal database schema
- CSV export of transactions
- PWA manifest and automatic service-worker updates
- Demo preview before configuring Supabase

**Scope note:** The schema includes savings goals and recurring transactions, but the current UI only has working CRUD screens for transactions and budgets. Goal and recurring-payment screens, edit-transaction flow, and true offline-write queue are follow-on features; the PWA shell can be installed but saved data requires internet and Supabase.

## 1. Install prerequisites

Install Node.js LTS from https://nodejs.org/ and VS Code from https://code.visualstudio.com/.

Open this folder in VS Code. In Terminal → New Terminal, run:

```bash
npm install
npm run dev
```

Open the local URL Vite prints (normally http://localhost:5173). Before Supabase setup, the app runs in demo preview mode. Preview changes are kept in memory only and disappear when the page reloads.

## 2. Create your Supabase database (free tier available)

1. Create a project at https://supabase.com/dashboard.
2. Open **SQL Editor → New query**.
3. Copy the entire contents of `supabase/schema.sql` into the editor and click **Run**.
4. Open **Project Settings → API Keys** (wording may vary) and copy the **Project URL** and **publishable key**. Use a publishable key (or legacy anon key), never a service-role/secret key in the browser.
5. Copy `.env.example` to a new file named `.env` in the project root.
6. Replace the placeholders:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

7. Stop and restart Vite after changing `.env` (Ctrl+C, then `npm run dev`).
8. Create an account in Finora. If email confirmation is enabled, confirm the message before signing in.

RLS policies restrict every database row to its owner. Never put a service-role key in `.env` for this frontend.

## 3. Build and check

```bash
npm run build
npm run preview
```

The `dist/` folder is the production build.

## 4. Deploy to Vercel

1. Create a GitHub repository and push this project. Do not commit `.env`.
2. Import the repository at https://vercel.com/new.
3. Add environment variables in Vercel Project Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Deploy. If you change environment variables, redeploy.
5. In Supabase Authentication → URL Configuration, set Site URL to the deployed URL and add it to Redirect URLs if required.
6. Open the HTTPS deployment on your phone. Use the browser's **Add to Home Screen** / **Install app** action.

## 5. Verify security and app behavior

- Create two separate test accounts. Confirm each account sees only its own transactions.
- Try a direct query while signed out; private data should not be returned.
- In Supabase, review Database → Advisors for security suggestions.
- Test add/delete transaction, budgets, CSV export, and responsive layout.
- Use sample values until you are confident the app is configured correctly.
- Make regular database exports/backups; free tiers may not provide automatic backups.

## Troubleshooting

- **"Invalid API key"**: use the project's publishable key or legacy anon key, not a secret/service-role key.
- **Tables not found**: run `supabase/schema.sql` in SQL Editor and confirm the tables appear under Table Editor.
- **Sign-up works but no sign-in**: check email confirmation and Supabase Auth logs.
- **Old environment values**: restart `npm run dev` after editing `.env`.
- **Build issue**: use a current Node.js LTS release, then run `npm install` again.
