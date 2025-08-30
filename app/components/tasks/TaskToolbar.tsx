'use client';

import { useState } from 'react';
import { 
  PlusIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ViewColumnsIcon,
  ChartBarIcon,
  DocumentIcon,
  CogIcon,
  ArrowPathIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface TaskToolbarProps {
  totalTasks: number;
  filteredTasks: number;
  onAddTask?: () => void;
  onToggleFilters?: () => void;
  onToggleStats?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onBulkAction?: (action: string) => void;
  viewMode?: 'kanban' | 'list' | 'calendar';
  onViewModeChange?: (mode: 'kanban' | 'list' | 'calendar') => void;
  selectedTasks?: string[];
  showFilters?: boolean;
  showStats?: boolean;
  isLoading?: boolean;
}

export default function TaskToolbar({
  totalTasks,
  filteredTasks,
  onAddTask,
  onToggleFilters,
  onToggleStats,
  onRefresh,
  onExport,
  onBulkAction,
  viewMode = 'kanban',
  onViewModeChange,
  selectedTasks = [],
  showFilters = false,
  showStats = false,
  isLoading = false
}: TaskToolbarProps) {
  const [showBulkActions, setShowBulkActions] = useState(false);

  const hasSelection = selectedTasks.length > 0;
  const isFiltered = filteredTasks !== totalTasks;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        {/* Left Section - Main Actions */}
        <div className="flex items-center gap-3">
          {/* Add Task Button */}
          {onAddTask && (
            <Button
              onClick={onAddTask}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <PlusIcon className="w-4 h-4" />
              Add Task
            </Button>
          )}

          {/* Bulk Actions (when tasks are selected) */}
          {hasSelection && onBulkAction && (
            <DropdownMenu open={showBulkActions} onOpenChange={setShowBulkActions}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArchiveBoxIcon className="w-4 h-4" />
                  Bulk Actions
                  <Badge variant="secondary" className="ml-1">
                    {selectedTasks.length}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onBulkAction('move-todo')}>
                  Move to To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkAction('move-progress')}>
                  Move to In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkAction('move-done')}>
                  Move to Done
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onBulkAction('priority-high')}>
                  Set High Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkAction('priority-medium')}>
                  Set Medium Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkAction('priority-low')}>
                  Set Low Priority
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onBulkAction('delete')}
                  className="text-red-600"
                >
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Task Count & Filter Status */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              {isFiltered ? (
                <>
                  Showing {filteredTasks} of {totalTasks} tasks
                  <Badge variant="outline" className="ml-2">
                    Filtered
                  </Badge>
                </>
              ) : (
                `${totalTasks} tasks`
              )}
            </span>
          </div>
        </div>

        {/* Right Section - View Controls */}
        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          {onViewModeChange && (
            <div className="flex items-center border border-gray-200 rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('kanban')}
                className="px-2"
              >
                <ViewColumnsIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="px-2"
              >
                <ArrowsUpDownIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('calendar')}
                className="px-2"
              >
                <ChartBarIcon className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Toggle Buttons */}
          <div className="flex items-center gap-1">
            {onToggleFilters && (
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                onClick={onToggleFilters}
                className="px-2"
                title="Toggle Filters"
              >
                <FunnelIcon className="w-4 h-4" />
              </Button>
            )}

            {onToggleStats && (
              <Button
                variant={showStats ? 'default' : 'outline'}
                size="sm"
                onClick={onToggleStats}
                className="px-2"
                title="Toggle Statistics"
              >
                <ChartBarIcon className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <CogIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRefresh && (
                <DropdownMenuItem 
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </DropdownMenuItem>
              )}
              
              {onExport && (
                <DropdownMenuItem 
                  onClick={onExport}
                  className="flex items-center gap-2"
                >
                  <DocumentIcon className="w-4 h-4" />
                  Export Tasks
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="flex items-center gap-2">
                <CogIcon className="w-4 h-4" />
                Board Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Selection Info Bar */}
      {hasSelection && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBulkAction?.('clear-selection')}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
