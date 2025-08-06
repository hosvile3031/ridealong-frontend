# 🔧 FIX AUTHENTICATION - Get Your Backend URL

## 🚨 **THE PROBLEM**
Your authentication fails because your frontend is trying to connect to the wrong backend URL.

---

## ✅ **STEP 1: Get Your EXACT Backend URL**

1. **Open Render Dashboard**: https://dashboard.render.com
2. **Find your service**: Look for `ridealong-backend`
3. **Copy the URL**: It should look like:
   ```
   https://ridealong-backend-abc123.onrender.com
   ```
4. **Test it**: Visit `https://YOUR-URL.onrender.com/api/health`
   - Should show: `{"message": "Ridealong API is running!", "status": "healthy"}`

---

## ✅ **STEP 2: Update Frontend Environment File**

I've already updated your `.env` file, but you need to replace `XXXX` with your real backend URL:

1. **Open**: `.env` file in your frontend directory
2. **Replace**: `https://ridealong-backend-XXXX.onrender.com/api`
3. **With**: `https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api`

Example:
```env
VITE_API_BASE_URL=https://ridealong-backend-abc123.onrender.com/api
```

---

## ✅ **STEP 3: Update Vercel Environment Variables**

This is the MOST IMPORTANT step:

1. **Go to**: https://vercel.com/dashboard
2. **Select**: `ridealong-frontend` project
3. **Go to**: Settings → Environment Variables
4. **Add or Update**:

```
Variable Name: VITE_API_BASE_URL
Value: https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api
Target: Production, Preview, Development
```

```
Variable Name: VITE_APP_NAME  
Value: Ridealong
Target: Production, Preview, Development
```

```
Variable Name: VITE_APP_URL
Value: https://ridealong-frontend.vercel.app  
Target: Production, Preview, Development
```

---

## ✅ **STEP 4: Redeploy Frontend**

After updating Vercel environment variables:

**Option A - Redeploy from Vercel Dashboard:**
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Wait 2-3 minutes

**Option B - Push a commit:**
```bash
# Make a small change to trigger deployment
echo "# Updated environment variables" >> README.md
git add .
git commit -m "fix: update production environment variables"
git push origin main
```

---

## ✅ **STEP 5: Test The Fix**

1. **Wait 3-5 minutes** for deployment to complete
2. **Visit**: https://ridealong-frontend.vercel.app
3. **Open Browser Console** (Press F12)
4. **Try to register or login**
5. **Check Network tab**:
   - API calls should go to `https://your-backend.onrender.com/api/`
   - NOT to `localhost:5000`

---

## 🧪 **DEBUGGING CHECKLIST**

### If authentication still fails:

1. **Check Browser Console (F12)**:
   - Any red errors?
   - Network tab showing correct API URL?

2. **Test Backend Directly**:
   ```bash
   # Replace with your actual backend URL
   curl https://your-backend.onrender.com/api/health
   ```

3. **Check Vercel Environment Variables**:
   - Go to Vercel → Settings → Environment Variables
   - Confirm `VITE_API_BASE_URL` is set correctly
   - Make sure it's enabled for Production

4. **Common Issues**:
   - ❌ Environment variables not saved in Vercel
   - ❌ Backend URL wrong or has `/api` twice
   - ❌ Backend is sleeping (first request takes 30+ seconds)
   - ❌ CORS error (need to update backend CORS settings)

---

## 📋 **WHAT YOUR URLS SHOULD LOOK LIKE**

Replace `abc123` with your actual values:

- **Backend**: `https://ridealong-backend-abc123.onrender.com`
- **API Base**: `https://ridealong-backend-abc123.onrender.com/api`
- **Health Check**: `https://ridealong-backend-abc123.onrender.com/api/health`
- **Frontend**: `https://ridealong-frontend.vercel.app`

---

## 🎯 **AFTER THE FIX**

You should be able to:
- ✅ Register new users
- ✅ Login existing users  
- ✅ See no authentication errors
- ✅ API calls go to production backend
- ✅ No CORS errors in browser console

---

**🔥 PRIORITY:** The most critical step is updating the Vercel environment variables with your correct backend URL!
