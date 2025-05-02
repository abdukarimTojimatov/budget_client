#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting deployment in production mode..."

# Step 1: Pull the latest code
echo "Pulling the latest changes from Git..."
git checkout dev1
git reset --hard
git pull origin dev1

# Step 2: Ensure dependencies are installed
echo "Installing dependencies..."
npm install

# Step 3: Check and install Vite globally (if necessary)
if ! command -v vite &> /dev/null; then
  echo "Vite is not installed globally. Installing..."
  npm install -g vite
fi

# Step 4: Build the project for production
echo "Building the project for production..."
npm run build

# Step 5: Start the project with PM2 in production mode
echo "Starting the application with PM2 in production mode..."
pm2 delete elegroClient || true  # Ensure old process is removed

# Get the server IP address
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "Server IP: $SERVER_IP"

# Start serving the production build
pm2 start "npx vite preview --host $SERVER_IP --port 3003" --name=elegroClient

# Step 6: Synchronize PM2 process list
echo "Saving PM2 process list..."
pm2 save

echo "Deployment complete! The application is now running in production mode at http://$SERVER_IP:3000"
