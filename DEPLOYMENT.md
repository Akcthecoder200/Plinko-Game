# 🚀 Vercel Deployment Guide for Plinko Lab

This guide will walk you through deploying Plinko Lab to Vercel.

## ⚠️ Important: Database Consideration

**SQLite doesn't work on Vercel** because Vercel uses serverless functions that are stateless. You need a hosted database.

### Database Options:

1. **Turso (Recommended)** - SQLite in the cloud, compatible with Prisma

   - Free tier: 500 MB storage
   - https://turso.tech/

2. **Vercel Postgres** - PostgreSQL managed by Vercel

   - Free tier: 256 MB storage
   - https://vercel.com/docs/storage/vercel-postgres

3. **Neon** - Serverless PostgreSQL
   - Free tier: 512 MB storage
   - https://neon.tech/

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] Database choice made (Turso/Vercel Postgres/Neon)
- [ ] Environment variables prepared
- [ ] Build tested locally (`npm run build`)

---

## 🔧 Step 1: Setup Database

### Option A: Turso (SQLite-compatible)

1. **Install Turso CLI:**

   ```bash
   # Windows (PowerShell as Admin)
   irm get.turso.tech/install.ps1 | iex

   # Or download from https://docs.turso.tech/cli/installation
   ```

2. **Sign up and create database:**

   ```bash
   turso auth signup
   turso db create plinko-lab
   ```

3. **Get connection string:**

   ```bash
   turso db show plinko-lab --url
   ```

4. **Get auth token:**

   ```bash
   turso db tokens create plinko-lab
   ```

5. **Update DATABASE_URL:**
   ```
   DATABASE_URL="libsql://[your-db].turso.io?authToken=[your-token]"
   ```

### Option B: Vercel Postgres

1. Go to your Vercel dashboard
2. Select your project → Storage → Create Database → Postgres
3. Copy the `DATABASE_URL` from the environment variables

### Option C: Neon

1. Sign up at https://neon.tech/
2. Create a new project
3. Copy the connection string from dashboard
4. Update `DATABASE_URL`

---

## 🚀 Step 2: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy from project directory:**

   ```bash
   cd "D:\Plink Lab"
   vercel
   ```

4. **Follow prompts:**

   - Set up and deploy? `Y`
   - Which scope? (Select your account)
   - Link to existing project? `N`
   - Project name? `plinko-lab`
   - Directory? `./`
   - Override settings? `N`

5. **Set environment variables:**

   ```bash
   # Generate a random salt
   $salt = -join ((0..63) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
   echo $salt

   # Set environment variables
   vercel env add DATABASE_URL
   # Paste your database URL when prompted

   vercel env add SERVER_SEED_SALT
   # Paste the generated salt when prompted

   vercel env add NODE_ENV
   # Enter: production
   ```

6. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Method 2: GitHub Integration (Easier)

1. **Push code to GitHub:**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard:**

   - Visit https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository

3. **Configure Project:**

   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   DATABASE_URL = [your database URL]
   SERVER_SEED_SALT = [random 64-char hex string]
   NODE_ENV = production
   ```

5. **Click "Deploy"**

---

## 🔐 Step 3: Generate Secure Salt

**Generate a cryptographically random salt for production:**

```powershell
# PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output:**

```
a1b2c3d4e5f6789012345678901234567890abcdefabcdef1234567890abcd
```

**Copy this value and use it as `SERVER_SEED_SALT`**

---

## 🗄️ Step 4: Run Database Migrations

After deployment, run Prisma migrations on your production database:

```bash
# If using Vercel CLI
vercel env pull .env.production
npx prisma generate
npx prisma db push

# Or set DATABASE_URL locally and run
DATABASE_URL="your-prod-url" npx prisma db push
```

---

## ✅ Step 5: Verify Deployment

1. **Check deployment logs:**

   - Go to Vercel dashboard → Deployments
   - Click on latest deployment
   - Check build logs for errors

2. **Test the live site:**

   - Visit your Vercel URL (e.g., `plinko-lab.vercel.app`)
   - Go to `/play` and play a round
   - Check `/verify` page works
   - Test on mobile device

3. **Verify database connection:**
   - Play a round and check if it saves
   - Try revealing server seed
   - Check round history persists

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module 'prisma'"**

```bash
# Add postinstall script to package.json
"postinstall": "prisma generate"
```

**Error: "Database connection failed"**

- Verify `DATABASE_URL` is correctly set in Vercel
- Check database is accessible (not behind firewall)
- For Turso, ensure auth token is included

### Runtime Errors

**Error: "PrismaClient initialization failed"**

```typescript
// Check lib/db/prisma.ts uses singleton pattern
// Already implemented correctly in the project
```

**Error: "Cannot write to database"**

- SQLite won't work on Vercel (stateless)
- Use Turso, Vercel Postgres, or Neon instead

### Performance Issues

**Slow API responses:**

- Choose database region close to Vercel region
- Enable Vercel Edge Network
- Consider caching with Redis (optional)

---

## 📊 Post-Deployment Checklist

- [ ] Site loads on production URL
- [ ] Can create new rounds
- [ ] Ball animation works
- [ ] Sound effects play
- [ ] History persists across page reloads
- [ ] Verify page works with revealed seeds
- [ ] Mobile responsive layout works
- [ ] No console errors in browser

---

## 🔄 Continuous Deployment

Once connected to GitHub, Vercel automatically deploys:

- **Push to `main`** → Production deployment
- **Pull requests** → Preview deployments

**Configure in Vercel Dashboard:**

- Settings → Git → Production Branch: `main`
- Settings → Git → Enable Preview Deployments

---

## 🌍 Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain (e.g., `plinkolab.com`)
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate (automatic)

---

## 📈 Monitoring

**Vercel Analytics (Free):**

- Enable in project settings
- Track page views, performance

**Error Tracking:**

- Vercel logs available in dashboard
- Consider Sentry for advanced error tracking

---

## 💰 Cost Estimate

**Free Tier (Hobby Plan):**

- Vercel hosting: **Free**
- Turso database: **Free** (500 MB)
- Bandwidth: **100 GB/month free**

**Paid Plan (if needed):**

- Vercel Pro: **$20/month**
- Turso Scaler: **$29/month** (8 GB storage)

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Turso Docs**: https://docs.turso.tech/
- **Prisma Docs**: https://www.prisma.io/docs/
- **GitHub Issues**: Open an issue in your repository

---

**Ready to deploy? Start with Step 1!** 🚀
