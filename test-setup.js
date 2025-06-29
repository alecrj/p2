#!/usr/bin/env node

/**
 * Pikaso MVP Setup Verification Script
 * Run this to check if all components are properly integrated
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✅ ${description}`, 'green');
  } else {
    log(`❌ ${description} - Missing at ${filePath}`, 'red');
  }
  return exists;
}

function checkDependency(packageName) {
  try {
    require.resolve(packageName);
    log(`✅ ${packageName} installed`, 'green');
    return true;
  } catch (e) {
    log(`❌ ${packageName} not installed`, 'red');
    return false;
  }
}

async function runChecks() {
  log('\n🔍 PIKASO MVP SETUP VERIFICATION\n', 'blue');

  // Check core engine files
  log('📁 Checking Core Engine Files:', 'yellow');
  const engineChecks = [
    ['src/engines/core/ErrorHandler.ts', 'ErrorHandler'],
    ['src/engines/core/ErrorBoundary.tsx', 'ErrorBoundary'],
    ['src/engines/drawing/ProfessionalCanvas.ts', 'ProfessionalCanvas'],
    ['src/engines/learning/SkillTreeManager.ts', 'SkillTreeManager'],
  ];

  let enginesPassed = true;
  for (const [file, name] of engineChecks) {
    if (!checkFile(file, name)) {
      enginesPassed = false;
    }
  }

  // Check context providers
  log('\n📁 Checking Context Providers:', 'yellow');
  const contextChecks = [
    ['src/contexts/DrawingContext.tsx', 'DrawingContext'],
    ['src/contexts/LearningContext.tsx', 'LearningContext'],
    ['src/contexts/ThemeContext.tsx', 'ThemeContext'],
    ['src/contexts/UserProgressContext.tsx', 'UserProgressContext'],
  ];

  let contextsPassed = true;
  for (const [file, name] of contextChecks) {
    if (!checkFile(file, name)) {
      contextsPassed = false;
    }
  }

  // Check screen components
  log('\n📁 Checking Screen Components:', 'yellow');
  const screenChecks = [
    ['app/(tabs)/draw.tsx', 'Draw Screen'],
    ['app/(tabs)/learn.tsx', 'Learn Screen'],
    ['app/(tabs)/home.tsx', 'Home Screen'],
    ['app/(tabs)/gallery.tsx', 'Gallery Screen'],
    ['app/(tabs)/profile.tsx', 'Profile Screen'],
  ];

  let screensPassed = true;
  for (const [file, name] of screenChecks) {
    if (!checkFile(file, name)) {
      screensPassed = false;
    }
  }

  // Check dependencies
  log('\n📦 Checking Dependencies:', 'yellow');
  const dependencies = [
    'react-native-reanimated',
    'react-native-gesture-handler',
    'expo-haptics',
    'lucide-react-native',
    '@react-native-async-storage/async-storage',
  ];

  let depsPassed = true;
  for (const dep of dependencies) {
    if (!checkDependency(dep)) {
      depsPassed = false;
    }
  }

  // Check TypeScript compilation
  log('\n🔧 Checking TypeScript Compilation:', 'yellow');
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    log('✅ TypeScript compilation successful', 'green');
  } catch (error) {
    log('❌ TypeScript compilation failed', 'red');
    log('Run "npx tsc --noEmit" to see errors', 'yellow');
  }

  // Summary
  log('\n📊 SUMMARY:', 'blue');
  const allPassed = enginesPassed && contextsPassed && screensPassed && depsPassed;
  
  if (allPassed) {
    log('✅ All checks passed! Your Pikaso MVP is ready to run! 🎉', 'green');
    log('\nNext steps:', 'yellow');
    log('1. Run "npm start" to launch the app', 'white');
    log('2. Test drawing functionality', 'white');
    log('3. Try completing a lesson', 'white');
  } else {
    log('❌ Some checks failed. Please fix the issues above.', 'red');
    log('\nQuick fixes:', 'yellow');
    log('1. Ensure all files are in the correct locations', 'white');
    log('2. Run "npm install" to install missing dependencies', 'white');
    log('3. Check file paths match your project structure', 'white');
  }

  // Create missing directories
  const dirs = [
    'src/engines/core',
    'src/engines/drawing',
    'src/engines/learning',
    'src/engines/user',
    'src/engines/community',
    'src/contexts',
    'src/components',
    'src/types',
  ];

  log('\n📁 Creating missing directories:', 'yellow');
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✅ Created ${dir}`, 'green');
    }
  }
}

// Run the checks
runChecks().catch(error => {
  log(`\n❌ Error running checks: ${error.message}`, 'red');
  process.exit(1);
});

// Export for use in other scripts
module.exports = { checkFile, checkDependency, log };