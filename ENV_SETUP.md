# Environment Variables Setup Guide

## 📋 Quick Reference

You have two `.env` files to manage:
1. **`backend/.env`** - Local development
2. **`backend/.env.production`** - Vercel production (template only)

---

## 🔑 Getting Your Supabase Credentials

### Step 1: Get DATABASE_URL from Supabase

1. Go to [Supabase Console](https://app.supabase.com)
2. Select your project
3. Click **Settings** → **Database**
4. Find the **"Connection String"** section
5. Select **"Use Connection Parameters"** or **"URI"** tab
6. Copy the string that looks like:
   ```
   postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.supabase.co:5432/postgres
   ```

**Replace**:
- `YOUR_PASSWORD` - Your Supabase database password
- `YOUR_HOST` - Your Supabase host (e.g., `eabcdefghijk.supabase.co`)

### Example:
```
DATABASE_URL=postgresql://postgres:abc123xyz_password@eabcdefghijk.supabase.co:5432/postgres
```

---

## 🖥️ Local Development Setup

### Option 1: Using Supabase Cloud (Recommended)

1. Get your `DATABASE_URL` from Supabase (see above)
2. Update `backend/.env`:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.supabase.co:5432/postgres
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   PORT=5000
   REACT_APP_API_URL=http://localhost:5000
   ```
3. Test locally:
   ```bash
   cd backend
   npm install
   node server.js
   ```

### Option 2: Using Local PostgreSQL (Advanced)

If you have PostgreSQL installed locally:
```
DATABASE_URL=postgresql://postgres:your_local_password@localhost:5432/hospital_db
```

---

## 🚀 Vercel Production Setup

### Step 1: Prepare Your Credentials
Have ready:
- Supabase `DATABASE_URL` (from Supabase Settings > Database)
- `JWT_SECRET` (any strong random string, minimum 32 characters)
- Your Vercel project URL (e.g., `your-project-name.vercel.app`)

### Step 2: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Hospital Management** project
3. Click **Settings** → **Environment Variables**
4. Add these variables:

| Key | Value | Example |
|-----|-------|---------|
| `DATABASE_URL` | Your Supabase connection string | `postgresql://postgres:pass@host.supabase.co:5432/postgres` |
| `JWT_SECRET` | Any strong random string (32+ chars) | `abc123xyz_super_secret_key_2026` |
| `NODE_ENV` | `production` | `production` |
| `PORT` | `5000` | `5000` |
| `REACT_APP_API_URL` | Your Vercel API endpoint | `https://your-project-name.vercel.app/api` |

5. Click **Save**

### Step 3: Redeploy on Vercel
1. Go to your Vercel project
2. Click **Redeploy** (or push new code to trigger auto-deploy)
3. Wait for build to complete
4. Test your API at: `https://your-project-name.vercel.app/api/`

---

## ✅ Verify Your Setup

### Local Testing
```bash
# Test if backend is running
curl http://localhost:5000/

# Test registration endpoint
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "patient"
  }'
```

### Production Testing (after Vercel deployment)
```bash
# Replace with your actual Vercel URL
curl https://your-project-name.vercel.app/api/

# Test registration
curl -X POST https://your-project-name.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "patient"
  }'
```

---

## 🔐 Security Tips

✅ **Do:**
- Use strong JWT_SECRET (32+ characters with mix of numbers, letters, symbols)
- Never commit `.env` files to Git (already in `.gitignore`)
- Use different secrets for development and production
- Rotate secrets regularly

❌ **Don't:**
- Share your DATABASE_URL or JWT_SECRET
- Use weak passwords
- Commit `.env` files
- Use same secret in dev and production

---

## 📝 File Reference

### `backend/.env` (Local Development)
```
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
JWT_SECRET=your_dev_secret_key
NODE_ENV=development
PORT=5000
REACT_APP_API_URL=http://localhost:5000
```

### `backend/.env.production` (Vercel Template - for reference)
```
DATABASE_URL=postgresql://postgres:password@host.supabase.co:5432/postgres
JWT_SECRET=your_production_secret_key
NODE_ENV=production
PORT=5000
REACT_APP_API_URL=https://your-vercel-project.vercel.app/api
```

---

## 🆘 Troubleshooting

### Error: "Connection refused" or "Database connection failed"
- Check if `DATABASE_URL` is correct
- Verify password is correct in Supabase
- Ensure the host URL is complete with `.supabase.co`

### Error: "Invalid token" or "Unable to parse connection string"
- Check for typos in `DATABASE_URL`
- Ensure password doesn't have special characters (URL encode if needed)
- Copy directly from Supabase Settings, don't type manually

### API Returns HTML instead of JSON
- Environment variables not set in Vercel
- Go to Vercel Settings > Environment Variables
- Add all 5 variables listed above
- Click Redeploy

### Changes to .env not taking effect
- Restart backend: `npm run dev`
- Restart frontend: `npm start`
- For Vercel: Always click Redeploy after changing env vars

---

## 📚 Next Steps

1. ✅ Get Supabase credentials
2. ✅ Update `backend/.env` with real values
3. ✅ Test locally
4. ✅ Add environment variables to Vercel
5. ✅ Redeploy on Vercel
6. ✅ Test production endpoints

---

**Questions? Check VERCEL_SUPABASE_DEPLOYMENT.md for detailed setup guide.**
