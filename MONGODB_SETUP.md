# Connecting the database (MongoDB Atlas)

The website runs on its built-in products and text until a database is connected. Once it is,
everything you change at **`/admin`** shows on the website within seconds, with no redeploy.

Everything here is free. It takes about 10 minutes.

## Local database on this Mac (already set up)

For development, MongoDB runs on this Mac and `.env.local` points at it
(`mongodb://127.0.0.1:27017`, database `zee-masterpiece`). It doesn't start by itself after a
restart; start it again with:

```sh
nohup ~/.local/mongodb/bin/mongod --dbpath ~/.local/mongodb/data --logpath ~/.local/mongodb/log/mongod.log --bind_ip 127.0.0.1 >/dev/null 2>&1 &
```

The steps below set up **MongoDB Atlas**, the online database the live site needs.

## 1. Create the database

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a **free (M0)** cluster. Pick the provider region closest to your customers, and name it
   anything (e.g. `zee`).
3. When it asks how to connect:
   - **Database user**: username `zee-admin`, click **Autogenerate Secure Password**, and copy the
     password somewhere safe.
   - **Network access**: add `0.0.0.0/0` ("Allow access from anywhere"). Vercel's servers don't have
     fixed addresses, so this is needed; the database password is what protects it.
4. Choose **Drivers** and copy the connection string. It looks like
   `mongodb+srv://zee-admin:<db_password>@zee.abc123.mongodb.net/?retryWrites=true&w=majority`.

## 2. Connect the project

1. Copy `.env.example` to `.env.local`.
2. Paste the connection string as `MONGODB_URI`, replacing `<db_password>` with the password from step 1.3.
3. In the project folder, run:

   ```sh
   npm run db:setup
   ```

   This prepares the database, adds the current 8 products and the store settings, and asks for the
   email and password for your dashboard login.
4. Run `npm run dev` and open <http://localhost:5173/admin>.

`.env.local` is never committed to git and never sent to visitors' browsers.

## 3. Password reset emails (Resend)

Locally you don't need this: "Forgot your password?" prints the reset link in the terminal running
`npm run dev`.

For the live site:

1. Sign up at [resend.com](https://resend.com) **with the same email you use for the dashboard**.
2. **API Keys** → **Create API key** (permission: Sending access) and copy it.
3. Set it as `RESEND_API_KEY` (in `.env.local` and on Vercel, see below).

Until you verify your own domain in Resend, emails come from `onboarding@resend.dev` and can only
go to your Resend account's email. That's fine for a single admin. To send from your own address,
verify a domain under **Domains**, then set `RESEND_FROM`, e.g. `ZEE Masterpiece <hello@yourdomain.com>`.

Locked out without email? On your computer, run `npm run admin:create you@example.com` to set a
new password directly.

## 4. Going live on Vercel

1. Push the project to GitHub and import it at [vercel.com/new](https://vercel.com/new). Vercel
   detects Vite automatically; the `api/` folder becomes the server.
2. In **Settings** → **Environment Variables**, add `MONGODB_URI`, `MONGODB_DB`, `RESEND_API_KEY` and
   `SITE_URL` (your live address, e.g. `https://zeemasterpiece.com`).
3. Deploy. `vercel.json` already makes `/admin` and `/favorites` work as direct links.

## Managing admins

- **Add an admin or reset a password:** `npm run admin:create` (asks for email and password).
- Only people added this way can sign in. There's no public sign-up.

## How it's stored

| Collection        | What's in it                                                |
| ----------------- | ----------------------------------------------------------- |
| `products`        | Names and descriptions (English/Arabic), price, photo, order |
| `settings`        | WhatsApp number, social links, currency, homepage text      |
| `images`          | Uploaded photos (shrunk before upload)                      |
| `admins`          | Dashboard logins (passwords are hashed, never stored as-is) |
| `sessions`, `password_resets`, `login_attempts` | Sign-ins and resets; expire automatically |
