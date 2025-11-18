# 🚀 Quick Start Guide

## Get Your Site Running in 5 Minutes

### Step 1: Install Dependencies (2 min)
```bash
cd /home/behar/Desktop/kroi-autocenter-migrated
npm install
```

### Step 2: Start Development Server (30 sec)
```bash
npm run dev
```

✅ Visit: **http://localhost:3000**

### Step 3: Explore Your Site
- **Homepage:** See featured cars
- **Cars Page:** Browse all 59 vehicles
- **Individual Car:** Click any car for details
- **Search:** Try filtering by brand or price

---

## 📝 Quick Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Check code quality

# Testing
npm test             # Run tests (if configured)
```

---

## ⚙️ Quick Configuration

### Minimum Setup (Optional)
Create `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Kroi Autocenter"
```

### Full Setup (For Production)
See `MIGRATION_README.md` for complete environment variables

---

##🎯 What's Working Right Now

✅ **59 Cars Loaded** - All data from WordPress
✅ **Search & Filter** - By brand, price, fuel type, etc.
✅ **Car Details** - Full specs and info
✅ **Responsive Design** - Mobile, tablet, desktop
✅ **Contact Forms** - Ready to receive inquiries
✅ **SEO Optimized** - Meta tags, sitemap, robots.txt

---

## ⚠️ What Needs Attention

❗ **Car Images Missing**
- WordPress site went offline during migration
- Currently using placeholders
- **Action:** Add real photos to `/public/cars/[car-slug]/`

❗ **Email Service**
- Needs Resend API key
- **Action:** Sign up at resend.com, add key to `.env.local`

---

## 🔧 Quick Fixes

### Problem: Port 3000 already in use
```bash
# Use different port
PORT=3001 npm run dev
```

### Problem: Build errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Problem: Missing dependencies
```bash
# Reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📸 Adding Car Images (Example)

1. **Create folder:**
```bash
mkdir -p public/cars/audi-q3-15-900-e
```

2. **Add images:**
```
public/cars/audi-q3-15-900-e/
  ├── 01_front.jpg
  ├── 02_side.jpg
  ├── 03_interior.jpg
  └── 04_back.jpg
```

3. **Update car data** in `app/data/cars.ts`:
```typescript
images: [
  {
    url: "/cars/audi-q3-15-900-e/01_front.jpg",
    altText: "Audi Q3 - Front",
    order: 1,
    isPrimary: true
  },
  // ... more images
]
```

---

## 🚀 Deploy to Vercel (2 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository at **vercel.com**

---

## 💡 Tips

1. **Test locally first** - Always run `npm run build` before deploying
2. **Check console** - Browser console shows helpful errors
3. **Use TypeScript** - Auto-completion helps avoid errors
4. **Read logs** - Terminal output shows what's happening

---

## 📞 Need Help?

1. Check `MIGRATION_README.md` for detailed info
2. Review Next.js docs: https://nextjs.org/docs
3. Check browser console for errors
4. Review terminal output

---

**You're all set!** 🎉

Start with `npm run dev` and explore your new site!
