# 🚀 Vercel Deployment Guide - KROI Auto Center

## ✅ Pre-Deployment Checklist

Your project has been configured for Vercel deployment! Here's what was updated:

- ✅ Removed `output: "standalone"` from next.config.ts
- ✅ Enabled Vercel image optimization
- ✅ Fixed build script in package.json
- ✅ Added Vercel-specific domains to image remotePatterns
- ✅ Created vercel.json with security headers

## 📋 Step-by-Step Deployment

### 1. Push to Git Repository

```bash
cd "/home/behar/Desktop/New Folder (2)/kroi-auto-center"
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Vercel will auto-detect Next.js - keep default settings
5. **DO NOT deploy yet** - configure environment variables first

### 3. Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

#### Required Variables:

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
CONTACT_EMAIL=contact@yourdomain.com

# Authentication
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.vercel.app

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

#### Optional but Recommended:

```bash
# Redis (Vercel KV or Upstash)
REDIS_URL=redis://default:password@host:port

# Rate Limiting
ENABLE_RATE_LIMITING=true
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000

# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Error Tracking
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### 4. Redis Setup (Important!)

Your app uses Redis for caching. Choose one option:

#### Option A: Vercel KV (Recommended)
1. In your Vercel project, go to **Storage** tab
2. Create a **KV Database**
3. Connect it to your project
4. Vercel will automatically add `KV_*` environment variables
5. Update your Redis client to use Vercel KV

#### Option B: Upstash Redis (Free Tier)
1. Sign up at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy the `REDIS_URL`
4. Add to Vercel environment variables

#### Option C: Make Redis Optional
If you want to deploy without Redis temporarily, you can make it optional in your code.

### 5. Deploy!

Click **"Deploy"** in Vercel dashboard.

Build time: ~2-3 minutes

### 6. Post-Deployment Steps

#### Update Sanity CORS Settings:
1. Go to [sanity.io/manage](https://manage.sanity.io)
2. Select your project
3. Go to **API** → **CORS Origins**
4. Add your Vercel domain: `https://your-domain.vercel.app`
5. Check "Allow credentials"

#### Update NEXTAUTH_URL:
1. After first deployment, copy your Vercel URL
2. Update `NEXTAUTH_URL` in environment variables
3. Redeploy (or it will auto-redeploy)

#### Test Your Deployment:
- [ ] Homepage loads correctly
- [ ] Images display properly
- [ ] Contact form works
- [ ] Test drive booking works
- [ ] Financing application works
- [ ] Email notifications arrive

## 🔧 Custom Domain Setup (Optional)

1. In Vercel project settings → **Domains**
2. Add your custom domain (e.g., `kroiauto.com`)
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to use custom domain
5. Update Sanity CORS to include custom domain

## ⚡ Performance Tips

### Enable Vercel Analytics:
```bash
npm install @vercel/analytics
```

### Enable Vercel Speed Insights:
```bash
npm install @vercel/speed-insights
```

Then add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Add before closing </body> tag
<Analytics />
<SpeedInsights />
```

## 🐛 Troubleshooting

### Build Fails?
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Try building locally: `npm run build`

### Images Not Loading?
- Verify remote image domains in `next.config.ts`
- Check Sanity CDN URLs
- Ensure images exist in public folder

### API Routes Timing Out?
- Default timeout is 10s (set in vercel.json)
- For Pro plans, can increase to 60s
- Check Redis connection

### Redis Connection Errors?
- Verify `REDIS_URL` is correct
- Check if Redis service is running
- Make Redis optional for testing

## 📊 Monitoring

### Vercel Dashboard:
- Real-time logs
- Function execution times
- Bandwidth usage
- Error tracking

### Set Up Alerts:
1. Go to project settings → **Notifications**
2. Enable deployment notifications
3. Enable error notifications

## 🔒 Security Checklist

- ✅ Security headers configured in vercel.json
- ✅ Environment variables properly set (not in code)
- ✅ CORS configured in Sanity
- ✅ Rate limiting on API routes
- ⚠️ Consider adding CSRF protection
- ⚠️ Consider adding WAF (Web Application Firewall)

## 💰 Pricing Considerations

**Vercel Free Tier Includes:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Edge Functions
- Preview deployments

**May Need Pro Plan For:**
- Redis/KV storage
- Longer function timeouts (>10s)
- Advanced analytics
- Team collaboration

## 🆘 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

---

**Last Updated**: November 1, 2025
**Next.js Version**: 15.5.4
**Vercel Compatible**: ✅

## Quick Deploy Command

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from terminal
vercel --prod
```

Good luck with your deployment! 🚀
