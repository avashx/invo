# Vercel Deployment Guide for DTC Bus Tracker

## ✅ Changes Made to Fix Deployment

### 1. Created `vercel.json`
This file configures how Vercel handles your Node.js application:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/live",
      "dest": "/server.js"
    },
    {
      "src": "/track",
      "dest": "/server.js"
    },
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*\\.(html|css|js|jpg|jpeg|png|gif|svg|otf|ttf|woff|woff2|csv|proto))",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

**Key Points:**
- All `/live` and `/track` requests are routed to `server.js`
- API routes are properly handled
- Static files (HTML, CSS, JS, images, fonts, CSV, proto) are served directly
- All other routes fallback to `server.js`

### 2. Created `.vercelignore`
Prevents unnecessary files from being deployed:

```
# Don't ignore these files
!*.ejs
!*.csv
!*.proto
!*.otf

# Ignore these
node_modules
.env
.git
temp/
```

**Important:** Makes sure `.ejs` files ARE included in deployment.

### 3. Updated `server.js`
**Three critical fixes:**

#### a) Prevented .ejs files from being downloaded
```javascript
// Middleware to prevent direct access to .ejs files
app.use((req, res, next) => {
    if (req.path.endsWith('.ejs')) {
        return res.status(404).send('Not Found');
    }
    next();
});
```

#### b) Improved views path configuration
```javascript
app.set('views', path.join(__dirname, '/'));
```

#### c) Added fallback rendering for /live route
```javascript
app.get('/live', async (req, res) => {
    try {
        res.set('Content-Type', 'text/html');
        res.render('live', { ... });
    } catch (error) {
        // Fallback: serve file directly if EJS fails
        const content = fs.readFileSync(path.join(__dirname, 'live.ejs'), 'utf8');
        res.set('Content-Type', 'text/html');
        res.send(content);
    }
});
```

## 🚀 Deployment Steps

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

### Step 2: Redeploy on Vercel
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your project `dtcpelocal`
3. Click **"Redeploy"** or trigger a new deployment
4. Vercel will automatically detect the new `vercel.json` configuration

### Step 3: Set Environment Variables (if needed)
In Vercel Dashboard → Project Settings → Environment Variables:

- `MONGODB_URI` - Your MongoDB connection string
- `NODE_ENV` - Set to `production`
- Any other environment variables from your `.env` file

### Step 4: Wait for Deployment
- Deployment usually takes 1-2 minutes
- Check the deployment logs for any errors

## ✨ Expected Results

After redeployment:

✅ **https://dtcpelocal.vercel.app/live** - Should render the live booking page
✅ **https://dtcpelocal.vercel.app/track** - Should render the tracking map
✅ **https://dtcpelocal.vercel.app/live.ejs** - Should return 404 (not download)
✅ **All API endpoints** - Should work correctly

## 🔍 Troubleshooting

### If /live still doesn't work:

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Deployments → Click latest deployment
   - Check "Functions" tab for errors

2. **Verify .ejs files are included:**
   - In deployment logs, look for "Traced files" section
   - Should see `live.ejs` and `bapp.ejs` listed

3. **Check build output:**
   ```
   ✓ Building...
   ✓ Compiled successfully
   ✓ Traced files: server.js, live.ejs, bapp.ejs, etc.
   ```

4. **Test locally:**
   ```bash
   npm start
   # Visit http://localhost:3001/live
   ```

### Common Issues:

**Issue 1: "Cannot find module 'ejs'"**
- Solution: Make sure `ejs` is in `dependencies` (not `devDependencies`) in `package.json`

**Issue 2: "Template not found"**
- Solution: Check that `.vercelignore` includes `!*.ejs`

**Issue 3: .ejs file downloads instead of rendering**
- Solution: Already fixed with middleware to block direct .ejs access

## 📱 Testing Your Deployment

After redeployment, test these URLs:

1. **Live Booking Page:**
   ```
   https://dtcpelocal.vercel.app/live
   ```
   Should show the live ticket booking interface with radar

2. **Tracking Map:**
   ```
   https://dtcpelocal.vercel.app/track
   ```
   Should show the bus tracking map

3. **API Endpoints:**
   ```
   https://dtcpelocal.vercel.app/api/buses
   https://dtcpelocal.vercel.app/api/all-stops
   ```
   Should return JSON data

4. **Static Files:**
   ```
   https://dtcpelocal.vercel.app/invoice.html
   https://dtcpelocal.vercel.app/index.html
   ```
   Should load properly

## 🎯 Next Steps After Deployment

1. **Monitor Serverless Function Limits:**
   - Vercel free tier: 10-second execution limit
   - If you hit limits, consider Vercel Pro or optimize long-running operations

2. **Enable Caching:**
   - Add cache headers for static assets
   - Consider using Vercel's Edge Network

3. **Add Custom Domain (Optional):**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `dtc.yourdomain.com`)

## 📞 Support

If issues persist:
- Check Vercel documentation: https://vercel.com/docs
- Review deployment logs in Vercel dashboard
- Test locally first to isolate issues

---

**Last Updated:** October 4, 2025
**Deployment:** https://dtcpelocal.vercel.app
**Repository:** https://github.com/avashx/invo
