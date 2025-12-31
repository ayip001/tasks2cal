import { GoogleTask, TaskFilter, WorkingHourFilter } from '@/types';

/**
 * Shared filter logic used by both the task panel and working hour filters
 * Searches in task title, notes, and list title
 * Supports multiple search terms and negative terms (starting with -)
 */
export function applyTaskFilter(
  tasks: GoogleTask[],
  filter: TaskFilter | WorkingHourFilter
): GoogleTask[] {
  return tasks.filter((task) => {
    // List filter (only in TaskFilter)
    if ('listIds' in filter && filter.listIds !== undefined) {
      if (filter.listIds.length === 0) {
        return false;
      }
      if (!filter.listIds.includes(task.listId)) {
        return false;
      }
    }

    // Due date filter
    if (filter.hasDueDate !== undefined) {
      const hasDue = !!task.due;
      if (filter.hasDueDate !== hasDue) {
        return false;
      }
    }

    // Hide container tasks filter
    if (filter.hideContainerTasks && task.hasSubtasks) {
      return false;
    }

    // Starred only filter
    if (filter.starredOnly && !task.isStarred) {
      return false;
    }

    // Search text filter - searches in title, notes, and list title
    if (filter.searchText) {
      const searchTerms = filter.searchText.toLowerCase().split(/\s+/).filter((t) => t.length > 0);

      for (const term of searchTerms) {
        if (term.startsWith('-') && term.length > 1) {
          // Negative term - exclude tasks that match
          const negativeTerm = term.substring(1);
          const titleMatch = task.title.toLowerCase().includes(negativeTerm);
          const notesMatch = task.notes?.toLowerCase().includes(negativeTerm) || false;
          const listTitleMatch = task.listTitle.toLowerCase().includes(negativeTerm);
          if (titleMatch || notesMatch || listTitleMatch) {
            return false;
          }
        } else {
          // Positive term - task must match at least one field
          const titleMatch = task.title.toLowerCase().includes(term);
          const notesMatch = task.notes?.toLowerCase().includes(term) || false;
          const listTitleMatch = task.listTitle.toLowerCase().includes(term);
          if (!titleMatch && !notesMatch && !listTitleMatch) {
            return false;
          }
        }
      }
    }

    return true;
  });
}
