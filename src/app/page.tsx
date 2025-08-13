import Link from "next/link";
import Image from "next/image";
import { auth } from "~/server/auth";
import {
  AIIcon,
  DashboardIcon,
  PhotoIcon,
  SparkleIcon,
  TrendingUpIcon,
  LogInIcon,
  PlusIcon,
} from "~/components/icons";

export default async function Home() {
  const session = await auth();

  return (
    <main className="bg-gradient-hero min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32">
        <div className="container mx-auto max-w-7xl">
          {/* Floating Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="animate-float absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl"></div>
            <div
              className="animate-float absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-green-400/10 blur-3xl"
              style={{ animationDelay: "2s" }}
            ></div>
            <div className="animate-pulse-soft absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-purple-400/5 blur-3xl"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="animate-fade-in-up">
              <div className="mb-8 inline-flex items-center space-x-2 rounded-full border border-gray-200/50 bg-white/80 px-6 py-3 backdrop-blur-sm">
                <SparkleIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  AI-Powered Job Tracking
                </span>
              </div>

              <h1 className="mb-6 text-5xl leading-tight font-bold text-gray-900 md:text-7xl">
                Transform Your
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  Job Search
                </span>
              </h1>

              <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-600 md:text-2xl">
                Upload job posting screenshots and let AI automatically extract
                company details, position requirements, and application
                deadlines. Track everything in one beautiful dashboard.
              </p>
            </div>

            {session?.user ? (
              <div className="animate-slide-in-left space-y-8">
                {/* Welcome Section */}
                <div className="glass-card mx-auto mb-12 max-w-2xl rounded-3xl p-8">
                  <div className="mb-6 flex items-center justify-center space-x-4">
                    {session.user.image && (
                      <Image
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-2xl shadow-lg ring-4 ring-white"
                      />
                    )}
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Welcome back, {session.user.name?.split(" ")[0]}!
                      </h2>
                      <p className="text-gray-600">
                        Ready to accelerate your job search?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mx-auto flex max-w-4xl flex-col justify-center gap-6 sm:flex-row">
                  <Link
                    href="/dashboard"
                    className="btn-primary group inline-flex items-center space-x-3"
                  >
                    <DashboardIcon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                    <span>View Dashboard</span>
                  </Link>
                  <Link
                    href="/upload"
                    className="btn-accent group inline-flex items-center space-x-3"
                  >
                    <PhotoIcon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                    <span>Upload Screenshot</span>
                  </Link>
                  <Link
                    href="/jobs"
                    className="btn-secondary group inline-flex items-center space-x-3"
                  >
                    <PlusIcon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                    <span>Add Job Manually</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="animate-slide-in-right space-y-8">
                <p className="mb-8 text-lg text-gray-600">
                  Join thousands of job seekers who&apos;ve streamlined their
                  application process
                </p>
                <Link
                  href="/api/auth/signin"
                  className="btn-primary group inline-flex items-center space-x-3 px-12 py-4 text-lg"
                >
                  <LogInIcon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  <span>Start Tracking Jobs</span>
                </Link>
                <p className="text-sm text-gray-500">
                  Sign in with Google • Free to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 px-4 py-24 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Three simple steps to revolutionize your job application tracking
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="feature-card group animate-slide-in-left text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 transition-transform duration-300 group-hover:scale-110">
                <PhotoIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                Upload Screenshots
              </h3>
              <p className="leading-relaxed text-gray-600">
                Simply drag and drop job posting screenshots from any website.
                Our system supports all major job boards and company career
                pages.
              </p>
            </div>

            <div
              className="feature-card group animate-fade-in-up text-center"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 transition-transform duration-300 group-hover:scale-110">
                <AIIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                AI Extraction
              </h3>
              <p className="leading-relaxed text-gray-600">
                Advanced AI automatically identifies company names, job titles,
                requirements, salary ranges, and application deadlines with 95+
                accuracy.
              </p>
            </div>

            <div
              className="feature-card group animate-slide-in-right text-center"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 transition-transform duration-300 group-hover:scale-110">
                <TrendingUpIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                Track Progress
              </h3>
              <p className="leading-relaxed text-gray-600">
                Monitor your applications through every stage—from initial
                application to final offer. Get insights and reminders to never
                miss opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-3xl p-12 text-center">
            <h3 className="mb-8 text-3xl font-bold text-gray-900">
              Trusted by Job Seekers Worldwide
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="animate-fade-in-up">
                <div className="mb-2 text-4xl font-bold text-blue-600">
                  10K+
                </div>
                <div className="text-gray-600">Screenshots Processed</div>
              </div>
              <div
                className="animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="mb-2 text-4xl font-bold text-green-600">
                  95%
                </div>
                <div className="text-gray-600">Accuracy Rate</div>
              </div>
              <div
                className="animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="mb-2 text-4xl font-bold text-purple-600">
                  2K+
                </div>
                <div className="text-gray-600">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!session?.user && (
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 px-4 py-24">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-xl text-blue-100">
              Join thousands of job seekers who&apos;ve already streamlined
              their application process
            </p>
            <Link
              href="/api/auth/signin"
              className="inline-flex transform items-center space-x-3 rounded-2xl bg-white px-12 py-4 font-bold text-blue-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <LogInIcon className="h-6 w-6" />
              <span>Start Tracking Today</span>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
