# SciolyHub Deployment Guide

## 🚀 Environment Variables Configuration

### Local Development
- Uses `.env` files in `frontend/` and `backend/` directories
- These files are ignored by Git (see `.gitignore`)

### Production (Vercel)
- Environment variables must be set in Vercel Dashboard
- **DO NOT** create `.env.production` files - they won't work!

## 📋 Vercel Environment Variables Setup

Go to your Vercel Dashboard → Project Settings → Environment Variables and add:

### Frontend Variables:
```
VITE_SUPABASE_URL = [Your Supabase Project URL]
VITE_SUPABASE_ANON_KEY = [Your Supabase Anon Key]
VITE_API_URL = https://sciolyhub.vercel.app/api
```

### Backend Variables:
```
NODE_ENV = production
PORT = 3001
```

**Environment Targets:**
- Set variables for: Production, Preview, and Development

## 🔐 Security Notes

1. **Never commit .env files** - they're in .gitignore for a reason
2. **Use Vercel Dashboard** for production environment variables
3. **Regenerate keys** if they've been exposed publicly

## 🚀 Deployment Steps

1. Commit and push your code to GitHub
2. Connect repository to Vercel  
3. Set environment variables in Vercel dashboard (with your actual values)
4. Deploy!

Your site will be available at: https://sciolyhub.vercel.app

## 🛠️ File Structure
```
sciolyhub/
├── .gitignore                 # Ignores all .env files
├── README-DEPLOYMENT.md       # This safe deployment guide
├── vercel.json                # Vercel configuration
├── frontend/
│   ├── .env                   # Local development only (gitignored)
│   └── src/supabase.js        # Uses environment variables
└── backend/
    ├── .env                   # Local development only (gitignored)
    └── index.js               # Backend server
```

## ⚠️ Important Security Note

If you've accidentally committed sensitive credentials:
1. **Regenerate all exposed keys immediately**
2. **Remove files from Git history**
3. **Update your local and production environments with new keys**
