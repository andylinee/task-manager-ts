import { Task, TaskStatus } from './Task';

// === Utility Types ===

/**
 * 1. Partial<T> - Turn all properties into optional
 * For update operations, since not every field needs to be updated.
 */
export type PartialTask = Partial<Task>;

/**
 * 2. Required<T> - Turn all properties into required
 * For form validation, to ensure all required data is present.
 */
export type RequiredTaskInput = Required<Pick<Task, 'title' | 'status'>>;

/**
 * 3. Pick<T, K> - Choose specified properties
 * For API response, only return required fields
 */
export type TaskSummary = Pick<Task, 'id' | 'title' | 'status'>;
export type TaskTimestamps = Pick<Task, 'createdAt' | 'updatedAt'>;

/**
 * 4. Omit<T, K> - Exclude specified properties
 * For creating new task, excludes auto-generated fileds
 */
export type CreateTaskData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 5. Record<K, T> - Create an object type
 * For status statistics and allocation
 */
export type TaskStatusCount = Record<TaskStatus, number>;
export type TaskStatusLabels = Record<TaskStatus, string>;
export type TaskPriorityConfig = Record<'high' | 'medium' | 'low', {
    color: string;
    icon: string;
    sortOrder: number;
}>;

/**
 * 6. Exclude<T, U> - Exclude specified type from a union type
 * For restriction of operatinos for certain status
 */
export type ActiveTaskStatus = Exclude<TaskStatus, TaskStatus.COMPLETED>;
export type CompletableStatus = Exclude<TaskStatus, TaskStatus.TODO>;

/**
 * 7. Extract<T, U> - Extract specified types from a union type
 * For filtering operations
 */
export type InProgressOrCompleted = Extract<TaskStatus, TaskStatus.IN_PROGRESS | TaskStatus.COMPLETED>;

/**
 * 8. NonNullable<T> - Exclude null and undefined
 * For ensure not null
 */
export type ValidTaskId = NonNullable<Task['id']>;
export type ValidDueDate = NonNullable<Task['dueDate']>;

/**
 * 9. ReturnType<T> - Get the return type of the function
 * For inferring the return type of a complex function
 */
type AsyncTaskResult<T> = Promise<{ success: boolean; data: T }>;
export type TaskServiceResult<T> = ReturnType<() => AsyncTaskResult<T>>;

/**
 * 10. Parameters<T> - Get the parameter type of the function
 * For type inference and function composition
 */
type TaskFilterFunction = (task: Task, filter: string) => boolean;
export type FilterParameters = Parameters<TaskFilterFunction>;
