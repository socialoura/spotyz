This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set up your environment variables:

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Stripe API keys
3. Set your admin credentials for the admin dashboard

```bash
cp .env.local.example .env.local
``` 
 
Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Admin Dashboard

The admin dashboard allows you to manage pricing for both Instagram and TikTok follower packages.

### Accessing the Admin Panel

1. Navigate to `/admin` in your browser
2. Log in with the credentials you set in your `.env.local` file:
   - Username: `ADMIN_USERNAME`
   - Password: `ADMIN_PASSWORD`
3. You'll be redirected to `/admin/dashboard`

### Managing Pricing

In the admin dashboard, you can:
- Add new follower goal options for Instagram and TikTok
- Edit existing pricing and follower counts
- Remove pricing options
- Save changes that will be immediately reflected on the website

The pricing data is stored in `pricing-data.json` in the project root.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API. 
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
