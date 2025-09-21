/**
 * Enum of task status
 */
export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed'
}

/**
 * Interface of task
 */
export interface Task {
    id: string;                 // unique identifier
    title: string;              // task's title
    description?: string;       // optional task's description
    status: TaskStatus;         // task's status
    createdAt: Date;            // created time
    updatedAt: Date;            // updated time
    dueDate?: Date;             // optional due date
}

/**
 * Interface of the input for creating new task
 */
export interface CreateTaskInput {
    title: string;
    description?: string;
    dueDate?: Date;
}

/**
 * Interface of the input for updating task
 */
export interface UpdateTaskInput {
    title?: string;
    description?: string;
    status?: TaskStatus;
    dueDate?: Date;
}

/**
 * Used to query and filter tasks
 */
export interface TaskFilterOptions {
    status?: TaskStatus;
    hasDescription?: boolean;
    dueBefore?: Date;
    dueAfter?: Date;
}

/**
 * Generic interface of API response
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

// Type Alias
export type TaskId = string;
export type TaskList = Task[];

/**
 * Helper function: check if the task status is valid
 */
export function isValidTaskStatus(status: string): status is TaskStatus {
    return Object.values(TaskStatus).includes(status as TaskStatus);
}

/**
 * Helper function: get the zh_tw display name of task's status
 */
export function getTaskStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
        [TaskStatus.TODO]: '待辦',
        [TaskStatus.IN_PROGRESS]: '進行中',
        [TaskStatus.COMPLETED]: '已完成'
    };
    return labels[status];
}
