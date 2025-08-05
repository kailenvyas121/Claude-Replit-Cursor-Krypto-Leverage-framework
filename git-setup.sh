#!/bin/bash

# CryptoLevragePro GitHub Setup Script
echo "🚀 CryptoLevragePro GitHub Setup"
echo "================================="

# Check if we need to set up user info
echo ""
echo "Current git config:"
git config --list | grep user

echo ""
echo "📝 To connect to your GitHub repository, run these commands:"
echo ""
echo "1. Set your GitHub username and email (replace with your actual info):"
echo "   git config user.name 'Your GitHub Username'"
echo "   git config user.email 'your.email@example.com'"
echo ""
echo "2. Add your GitHub repository as remote:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo ""
echo "3. Or if you already have a repo, update the remote:"
echo "   git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo ""
echo "4. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Updated CryptoLevragePro application'"
echo "   git push -u origin main"
echo ""
echo "💡 Pro tip: You can also use GitHub CLI (gh) if available!"