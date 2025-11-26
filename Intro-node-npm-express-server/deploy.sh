#!/bin/bash

# Quick deployment script for Google Cloud Run

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Google Cloud Run Deployment Script          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found${NC}"
    echo -e "${YELLOW}Please install: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ No project configured${NC}"
    echo -e "${YELLOW}Run: gcloud config set project YOUR_PROJECT_ID${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project ID: ${PROJECT_ID}${NC}"
echo ""

# Confirm deployment
echo -e "${YELLOW}This will:${NC}"
echo "  1. Build Docker image with React + Express"
echo "  2. Push to Google Container Registry"
echo "  3. Deploy to Cloud Run"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🚀 Starting deployment...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo ""

# Submit to Cloud Build
echo -e "${GREEN}📦 Submitting to Cloud Build...${NC}"
gcloud builds submit --config cloudbuild.yaml

# Get service URL
echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo ""

SERVICE_URL=$(gcloud run services describe intro-node-express-app \
  --region us-central1 \
  --format 'value(status.url)' 2>/dev/null || echo "")

if [ -n "$SERVICE_URL" ]; then
    echo -e "${GREEN}🌐 Your app is live at:${NC}"
    echo -e "   ${BLUE}${SERVICE_URL}${NC}"
    echo ""
    echo -e "${YELLOW}Test endpoints:${NC}"
    echo "   curl ${SERVICE_URL}/"
    echo "   curl ${SERVICE_URL}/users"
    echo ""
    echo -e "${YELLOW}Open in browser:${NC}"
    echo "   open ${SERVICE_URL}"
else
    echo -e "${YELLOW}⚠️  Could not retrieve service URL${NC}"
    echo "Check Cloud Console: https://console.cloud.google.com/run"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Useful commands:${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo "  View logs:    gcloud run logs read intro-node-express-app --region us-central1"
echo "  View service: gcloud run services describe intro-node-express-app --region us-central1"
echo "  Delete:       gcloud run services delete intro-node-express-app --region us-central1"
echo ""

