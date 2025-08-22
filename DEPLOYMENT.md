# 🚀 Quick Deployment Guide

## Option 1: Vercel (Recommended - 2 minutes)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy
```bash
vercel
```

### 3. Set Environment Variables
In your Vercel dashboard:
- `OPENAI_API_KEY` = your OpenAI API key
- `VERIFY_TOKEN` = any random string (e.g., `instaclose_2024`)
- `SLACK_WEBHOOK_URL` = your Slack webhook (optional)

### 4. Get Your URLs
- **Landing Page:** `https://your-app.vercel.app`
- **Onboarding:** `https://your-app.vercel.app/onboarding`
- **Admin Dashboard:** `https://your-app.vercel.app/admin`

## Option 2: Render (Alternative)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Render
1. Go to [render.com](https://render.com)
2. Connect your GitHub repo
3. Create new Web Service
4. Set environment variables

### 3. Deploy
Render will automatically deploy from your GitHub repo.

## 🎯 Post-Deployment

### 1. Test Your Landing Page
Visit your domain to ensure the landing page loads.

### 2. Test Onboarding
Go to `/onboarding` and walk through the setup process.

### 3. Share with Creators
Direct creators to your onboarding URL:
```
https://your-domain.com/onboarding
```

### 4. Monitor in Admin Dashboard
Check `/admin` to see new tenants as they sign up.

## 🔧 Environment Variables

Make sure these are set in your deployment platform:

```bash
OPENAI_API_KEY=sk-your-openai-key-here
VERIFY_TOKEN=voicely_2024
SLACK_WEBHOOK_URL=https://hooks.slack.com/...  # optional
```

## 🚨 Important Notes

- **Domain:** Update `your-domain.com` in the code with your actual domain
- **HTTPS:** Required for Meta webhooks
- **Rate Limits:** Monitor OpenAI API usage
- **Backup:** Consider backing up tenant configs

## 🆘 Troubleshooting

### Common Issues:
1. **Webhook verification fails:** Check VERIFY_TOKEN matches
2. **Messages not sending:** Verify Meta app setup
3. **OpenAI errors:** Check API key and billing

### Support:
- Check logs in your deployment platform
- Test with `npm test` locally
- Verify environment variables are set correctly
