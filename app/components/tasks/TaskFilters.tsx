'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  FlagIcon,
  RectangleStackIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Badge } from '../ui/badge';

interface TaskFiltersProps {
  onFiltersChange: (filters: TaskFilters) => void;
  employees?: Array<{ id: string; name: string; email: string }>;
  projects?: Array<{ id: string; name: string }>;
  sprints?: Array<{ id: string; name: string; status: string }>;
}

interface TaskFilters {
  search?: string;
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
  projectId?: string;
  sprintId?: string;
  deadline?: {
    from?: string;
    to?: string;
    overdue?: boolean;
    dueToday?: boolean;
    dueThisWeek?: boolean;
  };
  tags?: string[];
  createdBy?: string;
  sortBy?: 'priority' | 'deadline' | 'created' | 'updated' | 'title';
  sortOrder?: 'asc' | 'desc';
}

const PRIORITY_OPTIONS = [
  { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800' }
];

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'DONE', label: 'Done', color: 'bg-green-100 text-green-800' }
];

const SORT_OPTIONS = [
  { value: 'priority', label: 'Priority' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'created', label: 'Created Date' },
  { value: 'updated', label: 'Last Updated' },
  { value: 'title', label: 'Title' }
];

export default function TaskFilters({ 
  onFiltersChange, 
  employees = [], 
  projects = [], 
  sprints = [] 
}: TaskFiltersProps) {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search: searchInput || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateFilters = (newFilters: Partial<TaskFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const toggleArrayFilter = (filterKey: keyof TaskFilters, value: string) => {
    const currentArray = (filters[filterKey] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ [filterKey]: newArray.length > 0 ? newArray : undefined });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchInput('');
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.assignedTo?.length) count++;
    if (filters.projectId) count++;
    if (filters.sprintId) count++;
    if (filters.deadline) count++;
    return count;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks by title, description, or tags..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateFilters({ 
            deadline: { ...filters.deadline, overdue: !filters.deadline?.overdue } 
          })}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filters.deadline?.overdue
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Overdue
        </button>
        
        <button
          onClick={() => updateFilters({ 
            deadline: { ...filters.deadline, dueToday: !filters.deadline?.dueToday } 
          })}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filters.deadline?.dueToday
              ? 'bg-orange-100 text-orange-700 border border-orange-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Due Today
        </button>
        
        <button
          onClick={() => updateFilters({ 
            deadline: { ...filters.deadline, dueThisWeek: !filters.deadline?.dueThisWeek } 
          })}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filters.deadline?.dueThisWeek
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Due This Week
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
        >
          <FunnelIcon className="w-4 h-4" />
          Advanced
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </button>

        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  onClick={() => toggleArrayFilter('status', status.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.status?.includes(status.value)
                      ? status.color + ' border'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((priority) => (
                <button
                  key={priority.value}
                  onClick={() => toggleArrayFilter('priority', priority.value)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.priority?.includes(priority.value)
                      ? priority.color + ' border'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FlagIcon className="w-3 h-3" />
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee Filter */}
          {employees.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                {employees.map((employee) => (
                  <label
                    key={employee.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.assignedTo?.includes(employee.id) || false}
                      onChange={() => toggleArrayFilter('assignedTo', employee.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{employee.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Project & Sprint Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Filter */}
            {projects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <select
                  value={filters.projectId || ''}
                  onChange={(e) => updateFilters({ projectId: e.target.value || undefined })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sprint Filter */}
            {sprints.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sprint</label>
                <select
                  value={filters.sprintId || ''}
                  onChange={(e) => updateFilters({ sprintId: e.target.value || undefined })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sprints</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} ({sprint.status})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy || 'priority'}
                onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => updateFilters({ sortOrder: e.target.value as any })}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: "{filters.search}"
                <button
                  onClick={() => {
                    setSearchInput('');
                    updateFilters({ search: undefined });
                  }}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {filters.status?.map(status => (
              <Badge key={status} variant="outline" className="flex items-center gap-1">
                Status: {STATUS_OPTIONS.find(s => s.value === status)?.label}
                <button onClick={() => toggleArrayFilter('status', status)}>
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            
            {filters.priority?.map(priority => (
              <Badge key={priority} variant="outline" className="flex items-center gap-1">
                Priority: {PRIORITY_OPTIONS.find(p => p.value === priority)?.label}
                <button onClick={() => toggleArrayFilter('priority', priority)}>
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
