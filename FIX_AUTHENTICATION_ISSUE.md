# 🔧 FIX AUTHENTICATION ISSUE - Ridealong App

## 🚨 **PROBLEM IDENTIFIED**
Your frontend on Vercel is trying to connect to `localhost:5000` but needs to connect to your production backend on Render.

---

## ✅ **STEP 1: Get Your Backend URL**

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Find your service**: `ridealong-backend`
3. **Copy the URL**: Should look like `https://ridealong-backend-xxxx.onrender.com`
4. **Test it**: Visit `https://your-backend-url.onrender.com/api/health`
   - Should return: `{"message": "Ridealong API is running!", "status": "healthy"}`

---

## ✅ **STEP 2: Update Vercel Environment Variables**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `ridealong-frontend`
3. **Go to Settings** → **Environment Variables**
4. **Add or Update these variables**:

```
VITE_API_BASE_URL = https://your-backend-url.onrender.com/api
VITE_APP_NAME = Ridealong
VITE_APP_URL = https://ridealong-frontend.vercel.app
```

**⚠️ IMPORTANT**: Replace `your-backend-url` with your actual Render backend URL!

---

## ✅ **STEP 3: Redeploy Frontend**

After updating environment variables:

1. **In Vercel Dashboard**:
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - OR trigger new deployment by pushing a commit

2. **Alternative - Push a commit**:
```bash
# In your frontend directory
echo "# Fix: Updated environment variables for production" >> README.md
git add .
git commit -m "fix: update environment variables for production backend"
git push origin main
```

---

## ✅ **STEP 4: Update Backend CORS (If Needed)**

If you still get CORS errors:

1. **Go to Render Dashboard** → **ridealong-backend** → **Environment**
2. **Update CORS_ORIGIN**:
   ```
   CORS_ORIGIN = https://ridealong-frontend.vercel.app
   ```
3. **Save and redeploy**

---

## 🧪 **STEP 5: Test The Fix**

1. **Wait 2-3 minutes** for redeployment
2. **Visit**: https://ridealong-frontend.vercel.app
3. **Open Browser Console** (F12)
4. **Try to register/login**
5. **Check for errors**:
   - ✅ **Success**: No errors, authentication works
   - ❌ **Still failing**: Check the steps below

---

## 🔍 **DEBUGGING CHECKLIST**

### **Check Backend Health**
```bash
# Test your backend URL
curl https://your-backend-url.onrender.com/api/health
```

### **Check Frontend API Calls**
1. **Open Browser Console** (F12)
2. **Go to Network tab**
3. **Try to register/login**
4. **Look for API calls**:
   - Should go to `https://your-backend-url.onrender.com/api/`
   - NOT to `localhost:5000`

### **Common Issues**:
- ❌ **Still calling localhost**: Environment variables not updated
- ❌ **CORS Error**: Update CORS_ORIGIN in Render
- ❌ **500 Error**: Backend database connection issue
- ❌ **404 Error**: Wrong backend URL

---

## 📋 **QUICK REFERENCE**

**Your URLs should be**:
- **Backend**: `https://ridealong-backend-xxxx.onrender.com`
- **Frontend**: `https://ridealong-frontend.vercel.app`
- **API Health**: `https://ridealong-backend-xxxx.onrender.com/api/health`

**Environment Variables**:
- **Vercel**: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
- **Render**: `CORS_ORIGIN=https://ridealong-frontend.vercel.app`

---

## 🎯 **EXPECTED OUTCOME**

After following these steps:
- ✅ Registration should work
- ✅ Login should work  
- ✅ No "authentication failed" errors
- ✅ Browser console shows no errors
- ✅ API calls go to production backend

---

**Need help?** Share:
1. Your exact backend URL from Render
2. Any error messages from browser console
3. Network tab showing which URLs are being called
