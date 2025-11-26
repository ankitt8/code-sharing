# 🚀 Google Cloud Deployment Guide

Deploy your React + Express app to Google Cloud Run using Cloud Build.

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed ([Install Guide](https://cloud.google.com/sdk/docs/install))
3. **Project created** in Google Cloud Console

## 🔧 Setup

### 1. Install and Configure gcloud CLI

```bash
# Install gcloud (if not already installed)
# Visit: https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Configure Project

```bash
# Set environment variables
export PROJECT_ID=$(gcloud config get-value project)
export REGION=us-central1

echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
```

## 🐳 Docker Build & Test Locally (Optional)

Before deploying to Cloud, test the Docker build locally:

```bash
# Build the Docker image
docker build -t intro-node-express-app .

# Run the container
docker run -p 8080:8080 intro-node-express-app

# Test in browser
open http://localhost:8080
```

## ☁️ Deploy to Google Cloud

### Option 1: Using Cloud Build (Recommended)

```bash
# Navigate to project directory
cd /Users/ankittiwari/Workspace/code-sharing/Intro-node-npm-express-server

# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml

# This will:
# 1. Build the Docker image
# 2. Push to Google Container Registry
# 3. Deploy to Cloud Run
```

### Option 2: Manual Deployment

```bash
# Build and push manually
docker build -t gcr.io/$PROJECT_ID/intro-node-express-app:latest .
docker push gcr.io/$PROJECT_ID/intro-node-express-app:latest

# Deploy to Cloud Run
gcloud run deploy intro-node-express-app \
  --image gcr.io/$PROJECT_ID/intro-node-express-app:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

## 🔐 Adding MongoDB (Optional)

### Using Secret Manager

1. **Create secret in Cloud Console:**
   ```bash
   echo -n "mongodb+srv://username:password@cluster.mongodb.net/dbname" | \
     gcloud secrets create mongodb-uri --data-file=-
   ```

2. **Grant Cloud Run access to secret:**
   ```bash
   gcloud secrets add-iam-policy-binding mongodb-uri \
     --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **Update cloudbuild.yaml:**
   Uncomment this line in `cloudbuild.yaml`:
   ```yaml
   - '--set-secrets=MONGODB_URI=mongodb-uri:latest'
   ```

4. **Redeploy:**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

## 📊 Monitor Deployment

```bash
# View build logs
gcloud builds list --limit 5

# View Cloud Run services
gcloud run services list

# Get service URL
gcloud run services describe intro-node-express-app \
  --region $REGION \
  --format 'value(status.url)'

# View logs
gcloud run logs read intro-node-express-app --region $REGION
```

## 🧪 Test Deployed App

After deployment, you'll get a URL like:
```
https://intro-node-express-app-xxxxx-uc.a.run.app
```

Test the endpoints:

```bash
# Get your service URL
export SERVICE_URL=$(gcloud run services describe intro-node-express-app \
  --region $REGION \
  --format 'value(status.url)')

# Test API
curl $SERVICE_URL/

# Test frontend (opens in browser)
open $SERVICE_URL

# Test adding a user
curl -X POST $SERVICE_URL/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Cloud User","email":"cloud@example.com"}'

# Test getting users
curl $SERVICE_URL/users
```

## 🔄 Update Deployment

To update your app:

```bash
# Make code changes, then:
gcloud builds submit --config cloudbuild.yaml
```

## 💰 Cost Optimization

Cloud Run pricing (as of 2024):
- **Free tier:** 2 million requests/month
- **Pay only for what you use**
- **Auto-scales to zero** (no cost when idle)

Recommended settings for low-cost:
```yaml
--min-instances=0        # Scale to zero when idle
--max-instances=10       # Limit scaling
--memory=512Mi          # Minimum needed
--cpu=1                 # Adequate for most workloads
```

## 🐛 Troubleshooting

### Build fails

```bash
# Check build logs
gcloud builds list --limit 1
gcloud builds log <BUILD_ID>
```

### Container doesn't start

```bash
# Check Cloud Run logs
gcloud run logs read intro-node-express-app --region $REGION --limit 50

# Check if port 8080 is exposed
gcloud run services describe intro-node-express-app --region $REGION
```

### MongoDB connection fails

1. Check if MongoDB Atlas allows Cloud Run IPs
2. Verify secret is correctly set
3. Check logs for connection errors

### React app not loading

1. Verify `dist` folder was created during build
2. Check if `npm run build` succeeded in Docker logs
3. Ensure static files are being served

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build (React + Node) |
| `cloudbuild.yaml` | Cloud Build configuration |
| `.dockerignore` | Files to exclude from Docker |
| `DEPLOYMENT.md` | This guide |

## 🎯 Architecture

```
┌─────────────────────────────────────┐
│   Google Cloud Run                  │
│   ┌─────────────────────────────┐   │
│   │  Docker Container           │   │
│   │  ┌────────────────────────┐ │   │
│   │  │  React (Static Files)  │ │   │
│   │  └────────────────────────┘ │   │
│   │  ┌────────────────────────┐ │   │
│   │  │  Express Server        │ │   │
│   │  │  Port 8080             │ │   │
│   │  └────────────────────────┘ │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│   MongoDB Atlas (Optional)          │
└─────────────────────────────────────┘
```

## 📚 Useful Commands

```bash
# View all Cloud Run services
gcloud run services list

# Delete service
gcloud run services delete intro-node-express-app --region $REGION

# Update environment variables
gcloud run services update intro-node-express-app \
  --region $REGION \
  --set-env-vars "NODE_ENV=production,DEBUG=true"

# View service details
gcloud run services describe intro-node-express-app --region $REGION

# Stream logs
gcloud run logs tail intro-node-express-app --region $REGION
```

## 🎉 Success!

Once deployed, your app will be live at:
```
https://intro-node-express-app-xxxxx-uc.a.run.app
```

Features:
- ✅ Auto-scaling (scales to zero when idle)
- ✅ HTTPS enabled by default
- ✅ Global CDN
- ✅ Automatic health checks
- ✅ Pay only for what you use

## 📖 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Container Registry](https://cloud.google.com/container-registry/docs)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)

---

Need help? Check the [Cloud Run Troubleshooting Guide](https://cloud.google.com/run/docs/troubleshooting)

