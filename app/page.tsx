import Link from 'next/link';
import { 
  ChevronRight, 
  Users, 
  Clock, 
  BarChart3, 
  Briefcase, 
  Calendar, 
  GraduationCap 
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      name: 'Employee Management',
      description: 'Streamline your workforce with comprehensive employee profiles and role management.',
      icon: Users,
      href: '/dashboard/employees',
      color: 'bg-blue-500',
    },
    {
      name: 'Time Tracking',
      description: 'Track work hours, manage timesheets, and monitor productivity with ease.',
      icon: Clock,
      href: '/dashboard/time-tracking',
      color: 'bg-green-500',
    },
    {
      name: 'Project Management',
      description: 'Organize projects, assign tasks, and collaborate effectively with your team.',
      icon: Briefcase,
      href: '/dashboard/projects',
      color: 'bg-purple-500',
    },
    {
      name: 'Analytics & Reports',
      description: 'Get insights into productivity, performance, and business metrics.',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-orange-500',
    },
    {
      name: 'Intern Portal',
      description: 'Dedicated space for interns with mentoring, tasks, and learning resources.',
      icon: GraduationCap,
      href: '/intern-portal',
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="bg-nextgen-dark-blue min-h-screen">
      {/* Hero Section */}
      <main className="relative overflow-hidden">
        <div className="pb-80 pt-16 sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
          <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
            <div className="sm:max-w-lg">
              <h1 className="text-2xl font-bold tracking-tight text-nextgen-white sm:text-4xl">
                Transform Your
                <span className="text-nextgen-teal">
                  {' '}Workplace
                </span>
              </h1>
              <p className="mt-4 text-lg text-nextgen-light-gray">
                Streamline operations, boost productivity, and create a thriving work environment with our comprehensive Employee & Time Management Platform.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-nextgen bg-nextgen-teal px-8 py-3 text-base font-medium text-nextgen-dark-gray shadow-nextgen hover:bg-nextgen-teal-hover focus:outline-none focus:ring-2 focus:ring-nextgen-teal focus:ring-offset-2 focus:ring-offset-nextgen-dark-blue transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/dashboard/employees"
                  className="inline-flex items-center justify-center rounded-nextgen border border-nextgen-light-gray bg-nextgen-medium-gray px-8 py-3 text-base font-medium text-nextgen-light-gray shadow-nextgen hover:bg-nextgen-hover-gray focus:outline-none focus:ring-2 focus:ring-nextgen-teal focus:ring-offset-2 focus:ring-offset-nextgen-dark-blue transition-all duration-200"
                >
                  Explore Features
                </Link>
              </div>
            </div>
            <div>
              <div className="mt-10">
                <div
                  aria-hidden="true"
                  className="pointer-events-none lg:absolute lg:inset-y-0 lg:mx-auto lg:w-full lg:max-w-7xl"
                >
                  <div className="absolute transform sm:left-1/2 sm:top-0 sm:translate-x-8 lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-8">
                    <div className="flex items-center space-x-6 lg:space-x-8">
                      <div className="grid flex-shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                        <div className="h-64 w-44 overflow-hidden rounded-nextgen bg-gradient-to-br from-nextgen-teal to-nextgen-light-blue p-6 shadow-nextgen-lg transform rotate-3">
                          <div className="h-full w-full bg-nextgen-white/20 rounded-nextgen backdrop-blur-sm flex items-center justify-center">
                            <Users className="h-16 w-16 text-white" />
                          </div>
                        </div>
                        <div className="h-64 w-44 overflow-hidden rounded-nextgen bg-gradient-to-br from-nextgen-success to-nextgen-teal p-6 shadow-nextgen-lg transform -rotate-2">
                          <div className="h-full w-full bg-nextgen-white/20 rounded-nextgen backdrop-blur-sm flex items-center justify-center">
                            <Clock className="h-16 w-16 text-nextgen-white" />
                          </div>
                        </div>
                      </div>
                      <div className="grid flex-shrink-0 grid-cols-1 gap-y-6 lg:gap-y-8">
                        <div className="h-64 w-44 overflow-hidden rounded-nextgen bg-gradient-to-br from-nextgen-warning to-nextgen-error p-6 shadow-nextgen-lg transform rotate-1">
                          <div className="h-full w-full bg-nextgen-white/20 rounded-nextgen backdrop-blur-sm flex items-center justify-center">
                            <BarChart3 className="h-16 w-16 text-nextgen-white" />
                          </div>
                        </div>
                        <div className="h-64 w-44 overflow-hidden rounded-nextgen bg-gradient-to-br from-nextgen-light-blue to-nextgen-teal p-6 shadow-nextgen-lg transform -rotate-1">
                          <div className="h-full w-full bg-nextgen-white/20 rounded-nextgen backdrop-blur-sm flex items-center justify-center">
                            <Briefcase className="h-16 w-16 text-nextgen-white" />
                          </div>
                        </div>
                        <div className="h-64 w-44 overflow-hidden rounded-nextgen bg-gradient-to-br from-nextgen-teal to-nextgen-light-blue p-6 shadow-nextgen-lg transform rotate-2">
                          <div className="h-full w-full bg-nextgen-white/20 rounded-nextgen backdrop-blur-sm flex items-center justify-center">
                            <Calendar className="h-16 w-16 text-nextgen-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <div className="py-24 bg-nextgen-light-blue">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-nextgen-white sm:text-4xl">
              Everything you need to manage your workforce
            </h2>
            <p className="mt-4 text-lg text-nextgen-light-gray">
              Powerful tools designed to simplify complex workplace management tasks
            </p>
          </div>
          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.name}
                href={feature.href}
                className="group relative rounded-nextgen bg-nextgen-dark-blue p-8 shadow-nextgen ring-1 ring-nextgen-light-gray hover:shadow-nextgen-lg hover:ring-nextgen-teal transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="inline-flex rounded-nextgen p-3 bg-nextgen-teal group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-nextgen-dark-gray" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-nextgen-white group-hover:text-nextgen-teal transition-colors duration-200">
                  {feature.name}
                </h3>
                <p className="mt-2 text-nextgen-light-gray">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-nextgen-teal group-hover:text-nextgen-teal-hover">
                  <span className="text-sm font-medium">Learn more</span>
                  <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-nextgen-teal">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-nextgen-dark-gray">Why Choose Our Platform</h2>
            <p className="mt-4 text-nextgen-dark-gray/70">Built for modern teams with enterprise-grade features</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-nextgen-dark-gray">🚀</div>
              <div className="mt-2 text-nextgen-dark-gray/70">Fast Setup</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-nextgen-dark-gray">🔒</div>
              <div className="mt-2 text-nextgen-dark-gray/70">Secure</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-nextgen-dark-gray">📱</div>
              <div className="mt-2 text-nextgen-dark-gray/70">Responsive</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-nextgen-dark-gray">⚡</div>
              <div className="mt-2 text-nextgen-dark-gray/70">Real-time</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-nextgen-dark-blue to-nextgen-light-blue">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-nextgen-white sm:text-4xl">
              Ready to transform your workplace?
            </h2>
            <p className="mt-4 text-xl text-nextgen-light-gray">
              Start your journey today and see the difference proper management can make.
            </p>
            <div className="mt-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-nextgen bg-nextgen-teal px-8 py-3 text-base font-medium text-nextgen-dark-gray shadow-nextgen hover:bg-nextgen-teal-hover focus:outline-none focus:ring-2 focus:ring-nextgen-teal focus:ring-offset-2 focus:ring-offset-nextgen-dark-blue transition-all duration-200 transform hover:scale-105"
              >
                Start Free Trial
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
