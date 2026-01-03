'use client';

import { UserSettings, GoogleTask, GoogleTaskList, TaskFilter, TaskPlacement } from '@/types';
import { Button } from '@/components/ui/button';
import { TaskPanel } from '@/components/tasks/task-panel';
import { AutofitSettingsPanel } from '@/components/panels/autofit-settings-panel';
import { useTranslations } from '@/hooks/use-translations';
import type { Locale } from '@/i18n/config';
import { Dispatch, SetStateAction } from 'react';

interface RightPanelProps {
  activeTab: 'tasks' | 'autofit';
  onTabChange: (tab: 'tasks' | 'autofit') => void;

  // Task panel props
  taskLists: GoogleTaskList[];
  placements: TaskPlacement[];
  loading: boolean;
  filter: TaskFilter;
  onFilterChange: Dispatch<SetStateAction<TaskFilter>>;
  filteredTasks: GoogleTask[];
  onAddTask?: (task: GoogleTask) => void;
  onToggleStar?: (taskId: string) => void;
  isMobile?: boolean;
  locale?: Locale;
  taskColor?: string;
  listColors?: Record<string, string>;

  // Auto-fit settings props
  settings: UserSettings;
  onSaveSettings: (updates: Partial<UserSettings>) => Promise<void>;
  userId?: string;
}

export function RightPanel({
  activeTab,
  onTabChange,
  taskLists,
  placements,
  loading,
  filter,
  onFilterChange,
  filteredTasks,
  onAddTask,
  onToggleStar,
  isMobile = false,
  locale = 'en',
  taskColor,
  listColors,
  settings,
  onSaveSettings,
  userId,
}: RightPanelProps) {
  const t = useTranslations(locale);

  return (
    <div className="h-full flex flex-col">
      {/* Tab buttons */}
      <div className="flex border-b bg-background">
        <Button
          variant={activeTab === 'tasks' ? 'default' : 'ghost'}
          onClick={() => onTabChange('tasks')}
          className="flex-1 rounded-none border-b-2"
          style={{
            borderBottomColor: activeTab === 'tasks' ? 'hsl(var(--primary))' : 'transparent',
          }}
        >
          {t('tabs.tasks')}
        </Button>
        <Button
          variant={activeTab === 'autofit' ? 'default' : 'ghost'}
          onClick={() => onTabChange('autofit')}
          className="flex-1 rounded-none border-b-2"
          style={{
            borderBottomColor: activeTab === 'autofit' ? 'hsl(var(--primary))' : 'transparent',
          }}
        >
          {t('tabs.autofit')}
        </Button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'tasks' ? (
          <TaskPanel
            taskLists={taskLists}
            placements={placements}
            loading={loading}
            filter={filter}
            onFilterChange={onFilterChange}
            filteredTasks={filteredTasks}
            onAddTask={onAddTask}
            onToggleStar={onToggleStar}
            isMobile={isMobile}
            locale={locale}
            taskColor={taskColor}
            listColors={listColors}
          />
        ) : (
          <AutofitSettingsPanel
            settings={settings}
            onSave={onSaveSettings}
            locale={locale}
            userId={userId}
          />
        )}
      </div>
    </div>
  );
}
