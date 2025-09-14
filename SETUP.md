# Polling App Setup Guide

## Prerequisites

1. Node.js 18+ installed
2. A Supabase project created at [supabase.com](https://supabase.com)

## Installation

1. Install dependencies:
```bash
npm install
```

2. **IMPORTANT: Set up environment variables**
   
   Create a `.env.local` file in the root directory (`inec_poll/.env.local`) with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### How to get your Supabase credentials:

1. Go to your Supabase project dashboard
2. Click on "Settings" in the left sidebar
3. Click on "API" 
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Example `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjQ2OTI4MCwiZXhwIjoxOTYyMDQ1MjgwfQ.example_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ2NDY5MjgwLCJleHAiOjE5NjIwNDUyODB9.example_service_role_key
```

**⚠️ Important Notes:**
- The `.env.local` file should be in the `inec_poll` directory (same level as `package.json`)
- Never commit this file to version control
- Make sure there are no spaces around the `=` sign
- Restart your development server after creating the file

## Database Setup

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute the schema

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- ✅ Create polls with multiple candidates
- ✅ Support for different election types (Presidential, Gubernatorial, etc.)
- ✅ State-specific polls
- ✅ Vote on polls
- ✅ View real-time results
- ✅ Responsive design
- ✅ Authentication integration

## Usage

1. **Create a Poll**: Click "Create New Poll" on the homepage
2. **Fill in Details**: Enter poll title, description, election type, and candidates
3. **Share**: Use the poll URL to share with voters
4. **Vote**: Users can vote on active polls
5. **View Results**: See real-time vote counts and percentages

## Troubleshooting

- Make sure all environment variables are set correctly
- Ensure the database schema has been executed
- Check the browser console for any errors
- Verify Supabase project is active and accessible
