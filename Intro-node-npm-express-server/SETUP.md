# Setup Instructions

## MongoDB Connection Setup

The application requires a MongoDB database connection. Follow these steps:

### 1. Create a `.env` file

Create a `.env` file in the `Intro-node-npm-express-server` directory:

```bash
touch .env
```

### 2. Add your MongoDB connection string

Add the following line to your `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string_here
```

### 3. Get a MongoDB Connection String

#### Option A: Use MongoDB Atlas (Free Cloud Option)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your actual database password
7. Replace `<dbname>` with your database name (e.g., `userdb`)

Example:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/userdb?retryWrites=true&w=majority
```

#### Option B: Use Local MongoDB

If you have MongoDB installed locally:

```env
MONGODB_URI=mongodb://localhost:27017/userdb
```

### 4. Whitelist Your IP Address (Atlas Only)

If using MongoDB Atlas:
1. Go to "Network Access" in Atlas dashboard
2. Click "Add IP Address"
3. Either add your current IP or use `0.0.0.0/0` (allow from anywhere - for development only)

## Running the Application

### Development Mode

```bash
# Install dependencies (if not already done)
npm install

# Run webpack in development mode with hot reload
npm run dev

# In another terminal, start the Express server
npm start
```

The webpack dev server will run on `http://localhost:8081` and proxy API calls to the Express server on port 3000.

### Production Mode

```bash
# Build the React app
npm run build

# Start the Express server (serves the built React app)
npm start
```

Visit `http://localhost:3000` in your browser.

## Troubleshooting

### Error: "Database not connected"

This means your MongoDB connection failed. Check:

1. ✅ `.env` file exists with `MONGODB_URI`
2. ✅ Connection string is correct (no typos in password)
3. ✅ Your IP address is whitelisted in MongoDB Atlas
4. ✅ MongoDB cluster is running (Atlas) or MongoDB service is started (local)

### Error: "Failed to fetch users"

- Ensure the MongoDB connection is successful (check server console for "✅ Connected to MongoDB")
- Check network connectivity
- Verify the database user has read/write permissions

### React App Not Loading

- Ensure you ran `npm run build` to create the production bundle
- Check that the `dist` folder exists and contains `index.html`
- Look for errors in the browser console

## Project Structure

```
Intro-node-npm-express-server/
├── src/                    # React source files
│   ├── App.jsx            # Main React component
│   ├── index.jsx          # React entry point
│   ├── styles.css         # Styles
│   └── template.html      # HTML template
├── dist/                  # Built React app (generated)
├── server.js              # Express server
├── webpack.config.js      # Webpack configuration
├── .babelrc              # Babel configuration
├── package.json          # Dependencies and scripts
└── .env                  # Environment variables (create this!)
```

## Available Scripts

- `npm start` - Start the Express server
- `npm run build` - Build React app for production
- `npm run dev` - Start webpack dev server with hot reload

