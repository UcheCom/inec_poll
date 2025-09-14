# INEC Nigeria Polls

A modern web application for creating and managing election polls with real-time voting capabilities. Built specifically for Nigerian elections with support for various election types including Presidential, Gubernatorial, Senatorial, House of Representatives, and State Assembly elections.

## 🚀 Project Overview

This application allows users to:
- **Create Polls**: Set up election polls with multiple candidates and party affiliations
- **Vote Securely**: Cast votes with authentication and duplicate prevention
- **View Results**: Real-time poll results with vote counts and percentages
- **Manage Elections**: Support for different election types and geographic scopes
- **Share Polls**: Unique URLs and QR codes for easy poll sharing

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **UI Components**: Custom components with shadcn/ui patterns
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account
- Git installed

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd inec_poll
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Supabase Configuration

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Set up the Database**:
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - This creates the necessary tables: `profiles`, `polls`, `poll_options`, and `votes`

3. **Configure Row Level Security (RLS)**:
   - Enable RLS on all tables
   - Set up policies for authenticated users

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_key
```

**Important**: Never commit the `.env.local` file to version control.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Usage Examples

### Creating a Poll

1. **Register/Login**: Create an account or sign in
2. **Navigate to Create Poll**: Click "Create New Poll" button
3. **Fill Poll Details**:
   - Enter poll title (e.g., "2023 Presidential Election Poll")
   - Add description (optional)
   - Select election type (Presidential, Gubernatorial, etc.)
   - Choose state (for state-specific elections)
   - Set end date (optional)
4. **Add Candidates**:
   - Enter candidate names
   - Add party affiliations
   - Include candidate images (optional)
   - Add/remove candidates as needed
5. **Submit**: Click "Create Poll" to publish

### Voting on a Poll

1. **Browse Polls**: View available polls on the main dashboard
2. **Select Poll**: Click on a poll to view details
3. **Cast Vote**:
   - Choose your preferred candidate
   - Click "Submit Vote"
   - View real-time results after voting
4. **View Results**: See vote counts and percentages for all candidates

### Poll Management

- **Edit Polls**: Poll creators can edit their polls
- **View Analytics**: Real-time vote counts and participation
- **Share Polls**: Use the unique poll URL to share with voters

## 🧪 Testing the Application

### Local Testing

1. **Start the Application**:
   ```bash
   npm run dev
   ```

2. **Test User Registration**:
   - Navigate to `/auth/register`
   - Create a test account
   - Verify email confirmation (if enabled)

3. **Test Poll Creation**:
   - Login with your test account
   - Create a sample poll with multiple candidates
   - Verify poll appears on dashboard

4. **Test Voting**:
   - Open poll in incognito/private browser
   - Register a second test account
   - Cast votes and verify results update

### Database Testing

1. **Check Supabase Dashboard**:
   - Verify tables are created correctly
   - Monitor real-time data changes
   - Check RLS policies are working

2. **Test Edge Cases**:
   - Try voting twice (should be prevented)
   - Test with expired polls
   - Verify authentication requirements

## 📁 Project Structure

```
inec_poll/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── polls/             # Poll management pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── CreatePollForm.tsx
│   ├── PollVotingComponent.tsx
│   └── ProtectedPollsPage.tsx
├── lib/                   # Utility functions and actions
│   ├── actions/           # Server actions
│   └── supabaseClient.ts  # Supabase configuration
├── src/                   # Additional source files
│   ├── context/           # React contexts
│   ├── hooks/             # Custom hooks
│   └── types/             # TypeScript type definitions
└── supabase-schema.sql    # Database schema
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect Repository**:
   - Push code to GitHub
   - Connect repository to Vercel

2. **Configure Environment Variables**:
   - Add Supabase credentials in Vercel dashboard
   - Set production environment variables

3. **Deploy**:
   - Vercel will automatically deploy on push
   - Monitor deployment in Vercel dashboard

### Other Deployment Options

- **Netlify**: Similar to Vercel, supports Next.js
- **Railway**: Good for full-stack applications
- **Self-hosted**: Use Docker with any VPS provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review the setup instructions
3. Verify environment variables are correct
4. Check Supabase project configuration

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
