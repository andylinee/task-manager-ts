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


// === Mapped Types ===

/**
 * 11. Basic Mapped Types - Label each property as optional
 */
export type OptionalTask = {
    [K in keyof Task]?: Task[K];
};

/**
 * 12. Conditional Mapped Types - Change property by the condition
 */
export type StringifyTask = {
    [K in keyof Task]: Task[K] extends Date ? string : Task[K];
};

/**
 * 13. Combination of template string types and mapped types
 */
export type TaskEventNames = {
    [K in keyof Task as `on${Capitalize<string & K>}Change`]: (newValue: Task[K]) => void;
};

/**
 * 14. Advanced Mapped Types - Create the interface of validators
 */
export type TaskValidators = {
    [K in keyof Task as Task[K] extends string ? K : never]: (value: string) => boolean;
};


// === Conditional Types ===

/**
 * 15. Basic Conditional Types
 */
export type TaskField<T> = T extends string ? 'text' :
    T extends number ? 'number' :
    T extends Date ? 'date' :
    T extends boolean ? 'checkbox' : 'unknown';

/**
 * 16. Distributive Conditional Types
 */
export type ExtractArrayType<T> = T extends (infer U)[] ? U : T;
export type TaskArrayType = ExtractArrayType<Task[]>; // inferred as Task

/**
 * 17. Conditional Types and infer keywords
 */
export type ExtractPromiseType<T> = T extends Promise<infer U> ? U : T;
export type TaskPromiseResult = ExtractPromiseType<Promise<Task>>; // inferred as Task

/**
 * 18. Complex Conditional Types - Deep Property Extraction
 */
export type DeepTaskProperty<T, K extends string> =
    K extends `${infer First}.${infer Rest}`
    ? First extends keyof T
    ? DeepTaskProperty<T[First], Rest>
    : never
    : K extends keyof T
    ? T[K]
    : never;
