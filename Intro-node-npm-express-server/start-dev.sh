#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   React + Express Development Environment     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo -e "${YELLOW}   MongoDB features will not work${NC}"
    echo -e "${YELLOW}   See SETUP.md for instructions${NC}"
    echo ""
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    jobs -p | xargs kill 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${GREEN}🚀 Starting Backend API Server (port 3000)...${NC}"
npm start &
BACKEND_PID=$!

echo -e "${GREEN}⚡ Starting Frontend Dev Server (port 8081)...${NC}"
sleep 2
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Development environment is running!${NC}"
echo ""
echo -e "  Backend API:  ${BLUE}http://localhost:3000${NC}"
echo -e "  Frontend App: ${BLUE}http://localhost:8081${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo ""

# Wait for both processes
wait

