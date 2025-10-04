# HTML to EJS Conversion Summary

## Overview
Converted static HTML pages to EJS templates for better Vercel serverless deployment compatibility.

## Changes Made

### 1. New EJS Files Created

#### `index.ejs`
- **Source**: Copied from `index.html`
- **Purpose**: Home page with bus number scanner
- **Route**: `/` (root path)
- **Changes**: Updated form submission to redirect to `/invoice` instead of `invoice.html`

#### `invoice.ejs`
- **Source**: Copied from `invoice.html`
- **Purpose**: Ticket generator page
- **Route**: `/invoice`
- **Changes**: 
  - Updated "Back to Home" link to use `/` instead of `index.html`
  - Accepts query parameters: `busNumber`, `from`, `to`, `route`, `bus`, `timestamp`

#### `live.ejs`
- **Status**: Already existed, updated redirects
- **Purpose**: Live bus tracker with auto-location
- **Route**: `/live`
- **Changes**: Updated ticket generation redirect from `invoice.html` to `/invoice`

### 2. Server Configuration Updates

#### `server.js`
Added two new routes with EJS rendering:

```javascript
// Home page route (default)
app.get('/', async (req, res) => {
    res.render('index');
});

// Invoice/ticket generator route
app.get('/invoice', async (req, res) => {
    res.render('invoice');
});
```

Both routes include fallback mechanisms to serve files directly if EJS rendering fails.

#### `vercel.json`
Updated routing configuration:

**Before:**
- Static HTML files served directly
- Only `/live` and `/track` routed to server.js

**After:**
- All page routes go through server.js
- `/` → server.js (renders index.ejs)
- `/invoice` → server.js (renders invoice.ejs)
- `/live` → server.js (renders live.ejs)
- `/track` → server.js (renders bapp.ejs)
- Static assets (CSS, JS, images, fonts) still served directly

### 3. Internal Link Updates

| File | Old Link | New Link |
|------|----------|----------|
| `index.ejs` | `invoice.html?busNumber=...` | `/invoice?busNumber=...` |
| `live.ejs` | `invoice.html?from=...&to=...` | `/invoice?from=...&to=...` |
| `invoice.ejs` | `<a href="index.html">` | `<a href="/">` |

## Why This Change?

### Problem
- Static HTML files weren't accessible on Vercel deployment
- `index.html` and `invoice.html` were downloading instead of rendering
- Vercel's serverless architecture works better with server-rendered pages

### Solution
- Convert all pages to EJS templates
- Route everything through Express server
- Maintain query parameter functionality
- Keep static assets served directly for performance

## Testing URLs

### Local Development (http://localhost:3001)
- Home: `http://localhost:3001/`
- Invoice: `http://localhost:3001/invoice`
- Live Tracker: `http://localhost:3001/live`
- Map Tracker: `http://localhost:3001/track`

### Vercel Production (https://dtcpelocal.vercel.app)
- Home: `https://dtcpelocal.vercel.app/`
- Invoice: `https://dtcpelocal.vercel.app/invoice`
- Live Tracker: `https://dtcpelocal.vercel.app/live`
- Map Tracker: `https://dtcpelocal.vercel.app/track`

## Functionality Preserved

✅ **Bus Number Scanner** (`/`)
- DL1PB, DL1PC, DL1PD, DL51GD, DL51EV prefix selection
- Number input with validation
- Form submission redirects to `/invoice` with `busNumber` parameter

✅ **Ticket Generator** (`/invoice`)
- Manual ticket creation
- Query parameter support for pre-filled data
- Route selection, fare calculation, passenger count
- AC/Non-AC toggle
- Download and WhatsApp share functionality
- Quick route buttons (827UP, 628STLUp, 835UP, etc.)

✅ **Live Tracker** (`/live`)
- Auto-location detection
- Nearest 5 bus stops (deduplicated)
- Nearest 10 buses with radar visualization
- Auto-refresh every 15 seconds
- Form submission redirects to `/invoice` with full details

## Files Status

### Active EJS Files
- ✅ `index.ejs` - Home page
- ✅ `invoice.ejs` - Ticket generator
- ✅ `live.ejs` - Live tracker
- ✅ `bapp.ejs` - Map tracker

### Legacy HTML Files (Still Present)
- 📄 `index.html` - Original home page (kept for reference)
- 📄 `invoice.html` - Original ticket generator (kept for reference)
- 📄 `live.html` - Original live tracker (kept for reference)

Note: HTML files are not used in deployment but kept in repository for backup.

## Deployment Notes

1. **Vercel Auto-Deploy**: Push to `main` branch triggers automatic deployment
2. **Build Time**: ~30-60 seconds for serverless function compilation
3. **Cold Start**: First request may take 2-3 seconds, subsequent requests <500ms
4. **Environment**: Node.js 18.x on Vercel

## Rollback Plan

If issues occur, revert to static HTML serving:

1. Update `vercel.json` routes:
   ```json
   {
     "src": "/",
     "dest": "/index.html"
   },
   {
     "src": "/invoice",
     "dest": "/invoice.html"
   }
   ```

2. Update internal links back to `.html` extensions

3. Redeploy

## Maintenance

- When updating pages, edit `.ejs` files (not `.html`)
- Test locally with `npm start` before deploying
- Verify all query parameters pass correctly
- Check mobile responsiveness on actual devices

---

**Conversion Date**: January 2025  
**Commit**: `73053ae`  
**Status**: ✅ Successfully deployed and tested
