'use client';

import { useUser } from '@clerk/nextjs';
import ProjectTable from './ProjectTable';

export default function ProjectsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8">Please sign in to access this page.</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your organization's projects, timelines, and team assignments.
          </p>
        </div>

        <ProjectTable />
      </div>
    </div>
  );
}
