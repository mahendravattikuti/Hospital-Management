# 🚀 Quick Start - Vercel Deployment

## **5-Minute Overview**

Your project had these **critical issues preventing Vercel deployment**:

### **The Problems**
| Problem | Why It Fails |
|---------|-------------|
| **SQLite database** | Vercel has read-only filesystem; data vanishes after execution |
| **No vercel.json** | Vercel doesn't know how to deploy your monorepo |
| **Backend as Express server** | Vercel uses serverless functions, not long-running servers |
| **Hardcoded http://localhost:5000** | Frontend can't reach backend on production |

### **The Solutions Applied** ✅

1. **api/db.js** - PostgreSQL connection (replaces SQLite)
2. **api/register.js** - Serverless registration function
3. **api/login.js** - Serverless login function  
4. **vercel.json** - Tells Vercel how to build & deploy
5. **.env.local.example** - Template for secrets
6. **Updated package.json** - Removed sqlite3, uses pg instead

---

## **What You Need to Do**

### **1️⃣ Create a PostgreSQL Database**

Choose ONE (Vercel Postgres recommended):
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Supabase**: https://supabase.com (free)
- **Your own PostgreSQL** locally

Get your connection string like:
```
postgresql://user:password@host:5432/hospital_db
```

### **2️⃣ Set Up Environment Variables**

Create `.env.local` file (copy from `.env.local.example`):
```bash
DATABASE_URL=postgresql://your-db-connection-string
JWT_SECRET=your-super-secret-key-here
REACT_APP_API_URL=http://localhost:3000/api
```

### **3️⃣ Install Dependencies**

```bash
cd backend && npm install
cd ../frontend && npm install
```

### **4️⃣ Test Locally**

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

Visit: http://localhost:3000

### **5️⃣ Deploy to Vercel**

```bash
# Push to GitHub
git add .
git commit -m "Setup for Vercel"
git push origin main
```

Then:
1. Go to https://vercel.com/import
2. Select your GitHub repository
3. Click "Import"
4. Add environment variables:
   - `DATABASE_URL` (from PostgreSQL)
   - `JWT_SECRET` (any strong random string)
5. Click "Deploy"

Done! Your app is live at `https://your-project.vercel.app`

---

## **Remaining Work**

If you have more API routes in `backend/server.js` (beyond register/login):

1. Create files in `/api` folder:
   ```
   api/endpoint-name.js
   ```

2. Follow the pattern from `api/register.js` or `api/login.js`

3. Convert Express route to serverless function:
   ```javascript
   export default async (req, res) => {
     // Your handler here
   }
   ```

See `MIGRATION_GUIDE.md` for details.

---

## **Quick Checklist**

- [ ] PostgreSQL database created
- [ ] `.env.local` file created with DB URL
- [ ] `npm install` ran in both backend & frontend
- [ ] Tested locally (`http://localhost:3000`)
- [ ] Code pushed to GitHub
- [ ] Imported into Vercel
- [ ] Environment variables added in Vercel dashboard
- [ ] Deployment successful ✅

---

## **Still Having Issues?**

**Most Common Errors:**

1. `"DATABASE_URL is not defined"` 
   → Add it to Vercel environment variables

2. `"Cannot GET /login"` on Vercel
   → Check vercel.json exists in root

3. Frontend can't reach API
   → Verify `REACT_APP_API_URL` in env vars

4. `"module not found: pg"`
   → Run `npm install` in backend folder

See `VERCEL_DEPLOYMENT_CHECKLIST.md` for full troubleshooting.

---

**That's it! You're ready to deploy.** 🎉
