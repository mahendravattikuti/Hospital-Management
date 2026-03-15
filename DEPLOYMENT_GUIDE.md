# Hospital Management System - Vercel Deployment Guide

## **Critical Issues Fixed** ✅

1. **SQLite → PostgreSQL Migration**: SQLite doesn't work on Vercel (ephemeral filesystem)
2. **Monorepo Configuration**: Added `vercel.json` for proper setup
3. **Serverless API Routes**: Created `/api` folder with Vercel-compatible functions
4. **Environment Variables**: Set up proper environment configuration
5. **Production Ready**: Removed local-only dependencies

---

## **Step-by-Step Deployment Instructions**

### **Step 1: Set Up PostgreSQL Database**

You need a PostgreSQL database. Choose one:

#### Option A: **Vercel Postgres (Recommended)**
```bash
# Go to https://vercel.com/docs/storage/vercel-postgres
# Create a new Postgres database through Vercel Dashboard
# Copy the connection string
```

#### Option B: **External PostgreSQL Service**
- **Supabase** (https://supabase.com) - Free tier available
- **Heroku Postgres** - Paid option
- **AWS RDS** - Scalable option

### **Step 2: Update Backend Dependencies**

Your `backend/package.json` already has `pg` (PostgreSQL driver) ✅

However, add this to `backend/package.json` if needed:
```json
"pg": "^8.11.0"
```

### **Step 3: Update API Files**

The following new files have been created:
- `/api/register.js` - User registration
- `/api/login.js` - User login
- `/api/db.js` - Database connection

Update your other API routes similarly (add more endpoints to the `/api` folder as needed).

### **Step 4: Update Frontend Configuration**

Update [frontend/src/api/api.js](frontend/src/api/api.js) to handle relative API paths:

```javascript
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api"
export const api = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)
  
  // Use relative path for production
  const url = BASE_URL.startsWith('http') 
    ? `${BASE_URL}${endpoint}` 
    : `/api${endpoint}`
  
  const res = await fetch(url, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Something went wrong")
  return data
}
```

### **Step 5: Migrate Data from SQLite to PostgreSQL**

Run this migration script locally:

```bash
# Install migration tool
npm install pg-migrate

# Export data from SQLite and import to PostgreSQL
node migrate-data.js
```

Or manually recreate your existing data in PostgreSQL.

### **Step 6: Deploy to Vercel**

#### **6a. Install Vercel CLI**
```bash
npm install -g vercel
```

#### **6b. Login to Vercel**
```bash
vercel login
```

#### **6c. Set Environment Variables on Vercel**

Go to your Vercel project dashboard and add:

```
DATABASE_URL = postgresql://user:pass@host:5432/hospital_db
JWT_SECRET = your-super-secret-key-here
REACT_APP_API_URL = https://your-project.vercel.app/api
```

#### **6d. Deploy**
```bash
cd hospital-management
vercel --prod
```

Or use GitHub integration:
1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Add environment variables in Vercel
4. Auto-deploy on push

### **Step 7: Verify Deployment**

```bash
# Test registration endpoint
curl -X POST https://your-project.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456","role":"patient"}'

# Test login endpoint
curl -X POST https://your-project.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

## **Key Configuration Files**

### **vercel.json** - Monorepo setup
- Builds React frontend
- Routes `/api/*` to serverless functions
- Rewrites client routes for React Router

### **.env.local** - Environment variables
```
DATABASE_URL = PostgreSQL connection string
JWT_SECRET = Secret key for JWT tokens
REACT_APP_API_URL = Frontend's API base URL
```

---

## **Remaining Tasks**

1. ✅ Create PostgreSQL database
2. ✅ Migrate existing SQLite data to PostgreSQL
3. ✅ Update all backend routes (see `/api` folder) following the pattern in `register.js` and `login.js`
4. ✅ Test API locally with `npm run dev` in backend folder
5. ✅ Update frontend API calls to use correct endpoints
6. ✅ Deploy to Vercel with environment variables

---

## **Common Issues & Solutions**

### **Issue 1: "DATABASE_URL is not defined"**
- ✅ Solution: Add `DATABASE_URL` to Vercel environment variables

### **Issue 2: "Module not found: pg"**
- ✅ Solution: `npm install pg` in backend folder

### **Issue 3: "CORS errors" on frontend**
- ✅ Solution: Already configured in vercel.json rewrites

### **Issue 4: "SQLite database not found"**
- ✅ Solution: Replaced with PostgreSQL (SQLite not suitable for Vercel)

### **Issue 5: "React Router 404 errors"**
- ✅ Solution: vercel.json configured to rewrite all routes to /index.html

---

## **Security Best Practices**

⚠️ **IMPORTANT**: 
- Never commit `.env` files to GitHub
- Use Vercel's environment variable dashboard
- Change `JWT_SECRET` to a strong random string
- Use strong database passwords
- Enable HTTPS (automatic with Vercel)

---

## **Next Steps**

1. Create PostgreSQL database
2. Update all remaining API routes
3. Test locally with `npm run dev`
4. Deploy to Vercel
5. Monitor logs in Vercel dashboard

For help: https://vercel.com/docs
