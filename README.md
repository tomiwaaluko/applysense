# ApplySense

**AI-Powered Job Application Management**

ApplySense is a modern web application that revolutionizes how you track and manage your job applications. Simply upload screenshots of job postings, and let our AI automatically extract company details, position requirements, salary information, and application deadlines.

## Features

- **AI-Powered Screenshot Analysis**: Upload job posting screenshots and get automatic data extraction
- **Beautiful Dashboard**: Track application progress with intuitive visualizations
- **Smart Reminders**: Never miss application deadlines with intelligent notifications
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Secure Authentication**: Google OAuth integration for secure access
- **Cloud Storage**: Secure file storage with Supabase integration

## Tech Stack

This project is built with modern technologies for optimal performance and developer experience:

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[tRPC](https://trpc.io)** - End-to-end typesafe APIs
- **[NextAuth.js](https://next-auth.js.org)** - Authentication solution
- **[Prisma](https://prisma.io)** - Database ORM
- **[Supabase](https://supabase.com)** - Backend as a Service
- **[OpenAI GPT](https://openai.com)** - AI-powered text extraction
- **[Tesseract.js](https://tesseract.projectnaptha.com/)** - OCR processing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- OpenAI API key
- Google OAuth credentials

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/tomiwaaluko/applysense.git
   cd applysense
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables in `.env`:

   ```env
   # Database
   DATABASE_URL="your-database-url"
   DIRECT_URL="your-direct-database-url"

   # NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
   ```

4. **Set up the database**

   ```bash
   npm run db:push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign in** with your Google account
2. **Upload a screenshot** of a job posting from any website
3. **Watch AI extract** company details, job requirements, and deadlines automatically
4. **Track your applications** through the dashboard
5. **Get reminders** for upcoming application deadlines

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── dashboard/       # Dashboard page
│   ├── jobs/           # Jobs management page
│   ├── upload/         # File upload page
│   └── api/            # API routes
├── components/         # Reusable UI components
├── lib/               # Utility functions and configurations
├── server/            # Server-side code (tRPC, auth, database)
├── styles/            # Global styles
└── trpc/              # tRPC client configuration
```

## Deployment

This application can be deployed on various platforms:

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add your environment variables
3. Deploy automatically on every push

### Other Platforms

- **Netlify**: Follow the [Netlify deployment guide](https://docs.netlify.com/frameworks/next-js/)
- **Railway**: Deploy with their [Next.js template](https://railway.app/template/next-js)
- **Docker**: Use the included Docker configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with the [T3 Stack](https://create.t3.gg/) for modern full-stack development
- UI inspiration from modern job application platforms
- AI capabilities powered by OpenAI's GPT models
