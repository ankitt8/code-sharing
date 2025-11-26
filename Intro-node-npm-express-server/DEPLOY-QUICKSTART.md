# ☁️ Deploy to Google Cloud - Quick Start

## 🚀 One-Command Deployment

```bash
./deploy.sh
```

That's it! The script handles everything automatically.

---

## 📋 Manual Steps (if preferred)

### 1. Setup (One-time)

```bash
# Install gcloud CLI (if not installed)
# Visit: https://cloud.google.com/sdk/docs/install

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
```

### 2. Deploy

```bash
gcloud builds submit --config cloudbuild.yaml
```

### 3. Get URL

```bash
gcloud run services describe intro-node-express-app \
  --region us-central1 \
  --format 'value(status.url)'
```

---

## 🧪 Test Deployment

```bash
# Get service URL
export URL=$(gcloud run services describe intro-node-express-app \
  --region us-central1 --format 'value(status.url)')

# Open in browser
open $URL

# Test API
curl $URL/
curl $URL/users
```

---

## 📊 Monitor

```bash
# View logs
gcloud run logs read intro-node-express-app --region us-central1

# Stream logs
gcloud run logs tail intro-node-express-app --region us-central1
```

---

## 🔄 Update

Made changes? Redeploy:

```bash
gcloud builds submit --config cloudbuild.yaml
```

---

## 🗑️ Delete

```bash
gcloud run services delete intro-node-express-app --region us-central1
```

---

## 📁 Deployment Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Builds React + Express container |
| `cloudbuild.yaml` | Cloud Build config |
| `.dockerignore` | Excludes unnecessary files |
| `deploy.sh` | Automated deployment script |
| `DEPLOYMENT.md` | Full deployment guide |

---

## 💡 Key Features

✅ **Auto-scaling** - Scales to zero when idle  
✅ **HTTPS** - Enabled by default  
✅ **Global CDN** - Fast worldwide  
✅ **Pay-as-you-go** - Only pay for usage  
✅ **Free tier** - 2M requests/month free  

---

## ❓ Need Help?

See detailed guide: `DEPLOYMENT.md`

Common issues:
- **gcloud not found**: Install from https://cloud.google.com/sdk/docs/install
- **No project set**: Run `gcloud config set project YOUR_PROJECT_ID`
- **Build fails**: Check `gcloud builds list` for errors
- **App not loading**: Check logs with `gcloud run logs read intro-node-express-app --region us-central1`

---

**That's it!** Your React + Express app will be live on Google Cloud Run 🎉

