# Use the official Node.js 18 image as a base
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package manifests and install dependencies first (caching)
COPY package.json package-lock.json* ./

RUN npm ci --only=production

# Copy the rest of your source code
COPY . .

# Make sure your server.js uses process.env.PORT
# e.g. const PORT = process.env.PORT || 3000;
# and listens on that port.

# Tell Cloud Run which port to listen on
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Start the server
CMD ["node", "server.js"]

