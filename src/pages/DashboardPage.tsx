import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth.types';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-6 lg:p-8">
      {user.role === UserRole.CREATOR ? <CreatorDashboard user={user} /> : <SubscriberDashboard user={user} />}
    </div>
  );
}

function CreatorDashboard({ user }: { user: any }) {
  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with {user.newsletterName || 'your newsletter'} today.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Subscribers"
          value="0"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          trend="+0 this week"
        />
        <MetricCard
          title="Published Content"
          value="0"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          trend="0 drafts"
        />
        <MetricCard
          title="Open Rate"
          value="0%"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          trend="No data yet"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionButton
            to="/dashboard/content"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            title="Create New Newsletter"
            description="Write and publish new content"
          />
          <QuickActionButton
            to="/dashboard/subscribers"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            title="Manage Subscribers"
            description="View and manage your audience"
          />
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-6">
        <h2 className="text-xl font-semibold text-indigo-900 mb-4">Getting Started</h2>
        <ul className="space-y-3">
          <OnboardingStep completed={false} text="Create your first newsletter" />
          <OnboardingStep completed={false} text="Customize your newsletter settings" />
          <OnboardingStep completed={false} text="Share your newsletter link" />
        </ul>
      </div>
    </div>
  );
}

function SubscriberDashboard({ user }: { user: any }) {
  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Discover and read the latest content from your subscriptions.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Subscriptions"
          value="0"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          }
          trend="Active subscriptions"
        />
        <MetricCard
          title="Unread Content"
          value="0"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          trend="New this week"
        />
        <MetricCard
          title="Reading Time"
          value="0 min"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend="This month"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionButton
            to="/dashboard/feed"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            }
            title="Browse Content"
            description="Explore available newsletters"
          />
          <QuickActionButton
            to="/dashboard/profile"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            title="Manage Profile"
            description="Update your preferences"
          />
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-6">
        <h2 className="text-xl font-semibold text-indigo-900 mb-4">Getting Started</h2>
        <ul className="space-y-3">
          <OnboardingStep completed={false} text="Browse available newsletters" />
          <OnboardingStep completed={false} text="Subscribe to your favorite creators" />
          <OnboardingStep completed={false} text="Customize your reading preferences" />
        </ul>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend }: { title: string; value: string; icon: JSX.Element; trend: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="text-indigo-600">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{trend}</p>
    </div>
  );
}

function QuickActionButton({ to, icon, title, description }: { to: string; icon: JSX.Element; title: string; description: string }) {
  return (
    <Link
      to={to}
      className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </Link>
  );
}

function OnboardingStep({ completed, text }: { completed: boolean; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${completed ? 'bg-green-500' : 'bg-gray-300'}`}>
        {completed && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm ${completed ? 'text-gray-900 line-through' : 'text-gray-700'}`}>{text}</span>
    </li>
  );
}
