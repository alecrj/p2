#!/bin/bash

echo "🚀 Pikaso Tab Navigation Fix Script"
echo "==================================="
echo ""

# Step 1: Fix dependencies
echo "📦 Step 1: Fixing dependencies..."
npm install @react-navigation/bottom-tabs@^7.3.10 @react-navigation/native@^7.1.6
npm install @react-navigation/native-stack @react-native-screens react-native-safe-area-context

echo ""
echo "🔧 Step 2: Running audit fix..."
npm audit fix

echo ""
echo "📱 Step 3: Fixing Expo dependencies..."
npx expo install --fix

echo ""
echo "🗑️  Step 4: Cleaning and reinstalling..."
rm -rf node_modules package-lock.json
npm install

echo ""
echo "🏥 Step 5: Running Expo doctor..."
npx expo doctor

echo ""
echo "📂 Step 6: Creating missing directories..."
mkdir -p src/utils
mkdir -p src/engines/core
mkdir -p src/engines/drawing
mkdir -p src/engines/learning
mkdir -p src/engines/user
mkdir -p src/engines/community

echo ""
echo "🚀 Step 7: Starting with debug mode..."
echo ""
echo "IMPORTANT: Watch the Metro console for these error patterns:"
echo "  - 'Cannot read property X of undefined'"
echo "  - 'Hook called outside of component'"
echo "  - 'Context value is undefined'"
echo "  - 'Navigation state error'"
echo ""
echo "Starting Expo with full debugging enabled..."
echo ""

# Clear cache and start
npx expo start --dev-client --clear