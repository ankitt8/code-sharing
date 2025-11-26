# React + Express + MongoDB App

A full-stack application with:
- **Frontend**: React with Webpack (hot reload)
- **Backend**: Express.js REST API
- **Database**: MongoDB Atlas

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string_here
```

> **Note**: The app will run without MongoDB, but database features won't work. See [SETUP.md](./SETUP.md) for MongoDB setup instructions.

### 3. Run in Development Mode

**Terminal 1 - Start Backend API (port 3000):**
```bash
npm start
```

**Terminal 2 - Start Frontend Dev Server (port 8081):**
```bash
npm run dev
```

This will:
- ✅ Start the Express API server on `http://localhost:3000`
- ✅ Start the React dev server on `http://localhost:8081` with hot reload
- ✅ Automatically open your browser to the React app
- ✅ Proxy all API calls from frontend to backend

## 📦 Production Build

Build and serve the production version:

```bash
# Build the React app
npm run build

# Start the backend (it will serve the built React app)
npm start
```

Then visit `http://localhost:3000`

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (React)                           │
│  http://localhost:8081                      │
│  - Hot Module Replacement                   │
│  - Calls backend API directly               │
└──────────────────┬──────────────────────────┘
                   │
                   │ Direct API Calls
                   │ http://localhost:3000/users
                   │ http://localhost:3000/submit
                   ▼
┌─────────────────────────────────────────────┐
│  Backend (Express)                          │
│  http://localhost:3000                      │
│  - REST API endpoints                       │
│  - CORS enabled for localhost:8081          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Database (MongoDB)                         │
│  - Stores user data                         │
└─────────────────────────────────────────────┘
```

## 📡 API Endpoints

| Method | Endpoint         | Description               |
|--------|------------------|---------------------------|
| GET    | `/`              | API info                  |
| GET    | `/about-us`      | About endpoint            |
| POST   | `/submit`        | Submit user (name, email) |
| GET    | `/users`         | Get all users             |
| GET    | `/users/:id`     | Get user by ID            |
| POST   | `/api/greet`     | Greet API                 |

## 📝 Available Scripts

| Command       | Description                                      |
|---------------|--------------------------------------------------|
| `npm start`   | Start the Express backend server                 |
| `npm run dev` | Start webpack dev server (frontend with hot reload) |
| `npm run build` | Build production-ready React app                |

## 🔧 Project Structure

```
Intro-node-npm-express-server/
├── src/                      # React source files
│   ├── App.jsx              # Main React component
│   ├── index.jsx            # React entry point
│   ├── styles.css           # Styles
│   └── template.html        # HTML template
├── dist/                    # Built React app (after npm run build)
├── server.js                # Express API server
├── webpack.config.js        # Webpack configuration
├── .babelrc                 # Babel configuration
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables (create this!)
├── README.md                # This file
└── SETUP.md                 # Detailed setup instructions
```

## 🛠️ Development Workflow

### Frontend Development
1. Run `npm run dev` to start the webpack dev server
2. Edit files in `src/` directory
3. Changes auto-reload in browser (hot module replacement)
4. Access frontend at `http://localhost:8081`

### Backend Development
1. Run `npm start` to start the Express server
2. Edit `server.js` or API routes
3. Restart server to see changes (or use nodemon)
4. Test API at `http://localhost:3000`

### Full Stack Development
Run both commands in separate terminals:
```bash
# Terminal 1
npm start

# Terminal 2
npm run dev
```

## 🔍 Testing the Setup

### Test Backend API
```bash
curl http://localhost:3000/
```

### Test Frontend
Open browser to `http://localhost:8081`

### Test Database Connection
Check the backend console logs:
- ✅ `Connected to MongoDB Atlas successfully!` - Database working
- ❌ `MongoDB Connection error` - Check your `.env` file

## 🐛 Troubleshooting

### Frontend can't connect to backend
- ✅ Make sure backend is running on port 3000
- ✅ Check that CORS is enabled in server.js
- ✅ Look for CORS errors in browser console
- ✅ Verify React app is calling `http://localhost:3000/...` URLs

### Database errors
- ✅ Verify `MONGODB_URI` in `.env` file
- ✅ Check MongoDB Atlas IP whitelist
- ✅ Ensure database user has correct permissions

### Port already in use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

## 📚 Learn More

- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Webpack Documentation](https://webpack.js.org/)

## 🎯 Next Steps

1. Set up MongoDB (see [SETUP.md](./SETUP.md))
2. Start both servers (`npm start` + `npm run dev`)
3. Open `http://localhost:8081` in your browser
4. Try adding a user through the form
5. View all saved users in the list

Happy coding! 🚀

