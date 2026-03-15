# Supabase Setup Guide

## Prerequisites
- Supabase account (https://app.supabase.com)
- Vercel account (https://vercel.com)

## Step 1: Create a Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the details:
   - Project name: `hospital-management`
   - Database password: Create a strong password
   - Region: Choose closest to your location
4. Wait for the project to be created

## Step 2: Get Your Database Connection String
1. Go to your Supabase project
2. Click "Settings" → "Database"
3. Copy the connection string under "Connection String"
4. It will look like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

## Step 3: Update Environment Variables

### For Local Development
1. Update `backend/.env`:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=hospital_super_secret_key_2026
NODE_ENV=development
PORT=5000
```

### For Vercel Production
1. Go to your Vercel project settings
2. Go to "Environment Variables"
3. Add these variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `JWT_SECRET`: Your secret key
   - `NODE_ENV`: `production`
   - `REACT_APP_API_URL`: `https://your-project-name.vercel.app/api`

## Step 4: Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## Step 5: Verify Deployment
- Test registration: `https://your-project-name.vercel.app/register`
- Test login: `https://your-project-name.vercel.app/login`
- API endpoints will be available at: `https://your-project-name.vercel.app/api/`

## Troubleshooting

### Database Connection Issues
- Check if your Supabase connection string is correct
- Verify DATABASE_URL is set in Vercel environment variables
- Check if network is accessible from Vercel (no IP whitelisting required for Supabase)

### CORS Issues
- CORS is already configured in the API
- Make sure your frontend URL matches the REACT_APP_API_URL

### API Not Working
- Check Vercel deployment logs
- Verify all environment variables are set
- Test API directly: `curl https://your-project-name.vercel.app/api/login`
