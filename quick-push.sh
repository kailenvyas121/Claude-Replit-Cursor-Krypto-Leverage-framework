#!/bin/bash

# Quick Push Script for CryptoLevragePro
echo "🚀 Quick Push to GitHub"
echo "======================="

# Check if we have uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Found changes to commit..."
    
    # Show what will be committed
    echo ""
    echo "Changes to be committed:"
    git status --short
    
    echo ""
    read -p "Enter commit message (or press Enter for default): " commit_msg
    
    if [ -z "$commit_msg" ]; then
        commit_msg="Updated CryptoLevragePro - $(date +'%Y-%m-%d %H:%M')"
    fi
    
    # Add, commit, and push
    echo "📤 Adding files..."
    git add .
    
    echo "💾 Committing with message: '$commit_msg'"
    git commit -m "$commit_msg"
    
    echo "🚀 Pushing to GitHub..."
    git push
    
    echo "✅ Successfully pushed to GitHub!"
    
else
    echo "✨ Working tree is clean - nothing to commit!"
    echo "🔄 Checking if we're up to date with remote..."
    git fetch
    git status
fi

echo ""
echo "🌐 Your repository should now be updated on GitHub!"