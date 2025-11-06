#!/bin/bash

echo "🚀 Deploying Vignan Timetable Backend to Render..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Add all files
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Deploy backend to Render - $(date)"

# Push to main branch
echo "Pushing to GitHub..."
git push origin main

echo "✅ Backend pushed to GitHub!"
echo "📝 Next steps:"
echo "1. Go to render.com and create a new Web Service"
echo "2. Connect your GitHub repository"
echo "3. Set environment variables:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - MONGODB_URI=your_mongodb_connection_string"
echo "   - JWT_SECRET=your_jwt_secret"
echo "4. Deploy!"