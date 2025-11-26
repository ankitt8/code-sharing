# 🚀 Quick Start Guide

## Two Ways to Run

### Option 1: Separate Terminals (Recommended for Development)

**Terminal 1 - Backend API:**
```bash
npm start
```
Backend runs on: `http://localhost:3000`

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
```
Frontend runs on: `http://localhost:8081` (opens automatically)

---

### Option 2: Single Command (Uses start-dev.sh)

```bash
./start-dev.sh
```

This automatically starts both servers. Press `Ctrl+C` to stop both.

---

## What You'll See

### Backend (Terminal 1)
```
============================================================
🚀 Backend API Server running on http://localhost:3000
============================================================
📋 Available API Endpoints:
   GET    /               - API info
   GET    /about-us       - About endpoint
   POST   /submit         - Submit user (name, email)
   GET    /users          - Get all users
   GET    /users/:id      - Get user by ID
   POST   /api/greet      - Greet API
============================================================
💡 Frontend Dev Server: http://localhost:8081
   Run: npm run dev

[2025-11-18T10:30:45.123Z] GET /users
📥 GET /users - Request received
🔗 MongoDB connection state: 1 (1=connected, 0=disconnected)
✅ Found 5 users
```

### Frontend (Terminal 2)
```
<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:8081/
<i> [webpack-dev-server] Content not from webpack is served from 'dist'
webpack 5.103.0 compiled successfully in 1234 ms
```

---

## Test the Setup

### 1. Test Backend API
```bash
curl http://localhost:3000/
```

Should return:
```json
{
  "message": "🚀 Backend API Server",
  "status": "running",
  "database": "disconnected",
  "endpoints": { ... }
}
```

### 2. Test Frontend
Open browser to `http://localhost:8081` - you should see the React app!

### 3. Test Full Stack
1. Go to `http://localhost:8081`
2. Fill out the form (name + email)
3. Click "Save user"
4. Watch the backend terminal for logs:
   ```
   [2025-11-18T10:30:50.789Z] POST /submit
   📝 POST /submit - Request received
   📦 Request body: { name: 'John', email: 'john@example.com' }
   ```

---

## Architecture

```
┌──────────────────────┐
│  Browser             │
│  http://localhost:8081│
└──────────┬───────────┘
           │
           │ React App
           │ (Webpack Dev Server)
           │
           │ API Calls
           ▼
┌──────────────────────┐
│  Express Server      │
│  http://localhost:3000│
│  - REST APIs         │
│  - CORS enabled      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  MongoDB Atlas       │
│  (Optional)          │
└──────────────────────┘
```

---

## Key Benefits of This Setup

✅ **Hot Reload** - Edit React files, see changes instantly  
✅ **Separate Concerns** - Frontend and backend run independently  
✅ **API Testing** - Test backend APIs directly via curl/Postman  
✅ **Detailed Logs** - See every request in real-time  
✅ **CORS Enabled** - Frontend can call backend APIs  
✅ **Production Ready** - `npm run build` creates optimized bundle  

---

## Common Commands

| Task                    | Command              |
|-------------------------|----------------------|
| Start backend only      | `npm start`          |
| Start frontend only     | `npm run dev`        |
| Start both (one command)| `./start-dev.sh`     |
| Build for production    | `npm run build`      |
| Install dependencies    | `npm install`        |

---

## Next Steps

1. ✅ Run both servers
2. ✅ Open `http://localhost:8081`
3. ✅ Play with the React app
4. ✅ Watch backend logs
5. 📚 Read [README.md](./README.md) for more details
6. 🔧 Set up MongoDB (see [SETUP.md](./SETUP.md))

---

## Troubleshooting

**Port 3000 already in use?**
```bash
lsof -ti:3000 | xargs kill -9
```

**Port 8081 already in use?**
```bash
lsof -ti:8081 | xargs kill -9
```

**Backend not responding?**
- Check if `npm start` is running
- Visit `http://localhost:3000/` to see API info

**Frontend not loading?**
- Check if `npm run dev` is running
- Look for webpack compilation errors
- Check browser console for errors

**Database errors?**
- The app works without MongoDB!
- Database features just won't work
- See [SETUP.md](./SETUP.md) to configure MongoDB

---

Happy coding! 🎉

