#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

console.log('🔧 Polling App Environment Setup\n');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local file already exists!');
    console.log('If you want to recreate it, please delete the existing file first.\n');
    process.exit(0);
}

// Create .env.local template
const envTemplate = `# Supabase Configuration
# Get these values from your Supabase project settings (Settings > API)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Instructions:
# 1. Go to your Supabase project dashboard
# 2. Click on "Settings" in the left sidebar
# 3. Click on "API"
# 4. Copy the values and replace the placeholders above
# 5. Save this file and restart your development server
`;

try {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env.local file successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Open .env.local in your editor');
    console.log('2. Replace the placeholder values with your actual Supabase credentials');
    console.log('3. Save the file');
    console.log('4. Restart your development server (npm run dev)');
    console.log('\n🔗 Get your credentials from: https://supabase.com/dashboard/project/[your-project]/settings/api');
} catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
    process.exit(1);
}

