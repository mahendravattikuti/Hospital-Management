# Vercel + Supabase Deployment Guide

## 🚀 Quick Start

This guide will help you deploy the Hospital Management System to Vercel with Supabase as your database.

## Prerequisites
- GitHub account with your repository pushed
- Supabase account (https://supabase.com)
- Vercel account (https://vercel.com)

---

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [Supabase Console](https://app.supabase.com)
2. Click **"New Project"**
3. Select your organization
4. Enter project details:
   - **Name**: `hospital-management`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Select closest to your location
5. Click **"Create new project"** and wait for initialization

### 1.2 Get Connection String
1. Go to your project's **Settings** → **Database**
2. Find the "Connection string" section
3. Copy the URI (it will look like this):
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

### 1.3 Test Connection Locally (Optional)
Before deploying, test your database connection:

```bash
cd backend
# Update .env with your Supabase connection string
DATABASE_URL=postgresql://postgres:your_password@your_host:5432/postgres

npm install
node server.js
```

You should see: `"Connected to Supabase PostgreSQL database"`

---

## Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repository
4. Click **"Import"**

### 2.2 Configure Project Settings
1. **Framework Preset**: Select **"Other"** or **"Next.js"** (doesn't matter for this project)
2. **Root Directory**: Keep as is (Vercel auto-detects)
3. **Build & Output**:
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/build`
4. Click **"Environment Variables"** and add:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres
JWT_SECRET=your_super_secret_jwt_key_2026
NODE_ENV=production
REACT_APP_API_URL=https://your-project-name.vercel.app/api
```

**Replace**:
- `YOUR_PASSWORD`: Your Supabase database password
- `YOUR_HOST`: Your Supabase host (from connection string)
- `your-project-name`: Your Vercel project name

### 2.3 Deploy
1. Click **"Deploy"**
2. Wait for the build to complete
3. Your app is now live! 🎉

---

## Step 3: Verify Deployment

### Test URLs
- **Frontend**: `https://your-project-name.vercel.app`
- **Register**: `https://your-project-name.vercel.app/register`
- **Login**: `https://your-project-name.vercel.app/login`
- **API Health**: `https://your-project-name.vercel.app/api/`

### Test API Endpoint
```bash
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

## 🔧 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://postgres:pass@host.supabase.co:5432/postgres` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key_2026` |
| `NODE_ENV` | Environment mode | `production` |
| `REACT_APP_API_URL` | Frontend API endpoint | `https://your-app.vercel.app/api` |

---

## 🐛 Troubleshooting

### Issue: "Database connection failed"
**Solution**:
1. Check if `DATABASE_URL` is set correctly in Vercel
2. Verify the password is correct in your Supabase connection string
3. Ensure the PostgreSQL user has the right permissions
4. Check Vercel logs: `vercel logs --tail`

### Issue: "CORS error" or "Failed to fetch"
**Solution**:
1. Verify `REACT_APP_API_URL` is set correctly
2. Check if the API endpoint is responding: `curl https://your-app.vercel.app/api/`
3. CORS is enabled by default in the API

### Issue: "Invalid JWT token"
**Solution**:
1. Ensure `JWT_SECRET` is the same locally and in production
2. Tokens expire after 24 hours (defined in backend)
3. Users need to login again if token expires

### Issue: "Registration works but tables not created"
**Solution**:
1. Tables are auto-created on first API call
2. Check Supabase SQL Editor to verify tables exist
3. If still missing, manually run:
   ```sql
   CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     role TEXT CHECK(role IN ('admin','doctor','patient','staff')) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

---

## 📊 Vercel Analytics & Monitoring

1. Go to your Vercel project dashboard
2. View **Deployments**, **Analytics**, and **Logs**
3. Check **Environment Variables** are correct
4. Monitor **Function Usage** and **Database Queries**

---

## 🔄 Updates & Redeployment

### To update your app:
1. Make changes locally
2. Push to GitHub: `git push`
3. Vercel auto-deploys! (watch the deployment in dashboard)

### To manually redeploy:
1. Go to Vercel dashboard
2. Click on your project
3. Click **"Redeploy"** button

---

## 🔐 Security Best Practices

✅ **Do**:
- Use strong JWT_SECRET (at least 32 characters)
- Never commit `.env` files
- Use Supabase's built-in security features
- Enable Row Level Security (RLS) for sensitive data

❌ **Don't**:
- Share `DATABASE_URL` or `JWT_SECRET`
- Commit environment variables
- Use weak passwords
- Disable SSL connections

---

## 📱 Access Your App

After deployment:
1. Navigate to `https://your-project-name.vercel.app`
2. Register a new account
3. Login with your credentials
4. Access your dashboard

---

## Next Steps

1. **Configure Admin Users**: Create admin accounts and assign roles
2. **Set Up Doctors**: Register doctor accounts with specializations
3. **Customize**: Modify the frontend/backend for your needs
4. **Backup**: Set up automatic backups in Supabase
5. **Monitor**: Enable Vercel analytics and error tracking

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **React Docs**: https://react.dev

---

**Happy Deploying! 🚀**
