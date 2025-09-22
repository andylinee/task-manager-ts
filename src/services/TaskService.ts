import {
    Task,
    TaskStatus,
    CreateTaskInput,
    UpdateTaskInput,
    TaskFilterOptions,
    ApiResponse,
    TaskId
} from '../types/Task';
import { loadTasks, saveTasks } from '../utils/fileUtils';

/**
 * Task management service class
 * This class encapsulates all task-related business logic
 */
export class TaskService {
    private tasks: Task[] = [];
    private isLoaded: boolean = false;

    /**
     * Initiating service, loads existing tasks
     */
    async initialize(): Promise<void> {
        if (!this.isLoaded) {
            this.tasks = await loadTasks();
            this.isLoaded = true;
        }
    }

    /**
     * Create new task
     * @param input data for creating task
     * @returns Promise<ApiResponse<Task>>
     */
    async createTask(input: CreateTaskInput): Promise<ApiResponse<Task>> {
        try {
            await this.initialize();

            // Validate input
            if (!input.title.trim()) {
                return {
                    success: false,
                    message: 'Task title. cannot be empty',
                    error: 'INVALID_TITLE'
                };
            }

            // Create unique ID
            const id = this.generateTaskId();
            const now = new Date();

            const newTask: Task = {
                id,
                title: input.title.trim(),
                description: input.description?.trim(),
                status: TaskStatus.TODO,
                createdAt: now,
                updatedAt: now,
                dueDate: input.dueDate
            };

            this.tasks.push(newTask);

            const saved = await saveTasks(this.tasks);
            if (!saved) {
                throw new Error('Failed to save task');
            }

            return {
                success: true,
                message: 'Successfully create task',
                data: newTask
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error when creating task',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get all tasks
     * @param filterOptions filter options
     * @returns Promise<ApiResponse<Task[]>>
     */
    async getAllTasks(filterOptions?: TaskFilterOptions): Promise<ApiResponse<Task[]>> {
        try {
            await this.initialize();

            let filteredTasks = [...this.tasks];

            // Apply filtered options
            if (filterOptions) {
                filteredTasks = this.applyFilters(filteredTasks, filterOptions);
            }

            // Sort by created time in desc
            filteredTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            return {
                success: true,
                message: `Found ${filteredTasks.length} tasks`,
                data: filteredTasks
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error when getting all tasks',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get Task by ID
     * @param id Task's ID
     * @returns Promise<ApiResponse<Task>>
     */
    async getTaskById(id: TaskId): Promise<ApiResponse<Task>> {
        try {
            await this.initialize();

            const task = this.tasks.find(t => t.id == id);

            if (!task) {
                return {
                    success: false,
                    message: 'Cannot find specified task',
                    error: 'TASK_NOT_FOUND'
                }
            };

            return {
                success: true,
                message: 'Successfully got the task',
                data: task
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error when getting task by ID',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Update task
     * @param id Task's ID
     * @param updateData data to update
     * @returns Promise<ApiResponse<Task>>
     */
    async updateTask(id: TaskId, updateData: UpdateTaskInput): Promise<ApiResponse<Task>> {
        try {
            await this.initialize();

            const taskIndex = this.tasks.findIndex(t => t.id == id);

            if (taskIndex == -1) {
                return {
                    success: false,
                    message: 'Cannot find specified task',
                    error: 'INVALID_TITLE'
                };
            }

            // Validate title (if needed)
            if (updateData.title != undefined && !updateData.title.trim()) {
                return {
                    success: false,
                    message: 'Task title cannot be empty',
                    error: 'INVALID_TITLE'
                };
            }

            const currentTask = this.tasks[taskIndex];
            const updatedTask: Task = {
                ...currentTask,
                ...updateData,
                title: updateData.title?.trim() ?? currentTask.title,
                description: updateData.description?.trim() ?? currentTask.description,
                updatedAt: new Date()
            };

            this.tasks[taskIndex] = updatedTask;

            const saved = await saveTasks(this.tasks);
            if (!saved) {
                throw new Error('Failed to save task');
            }

            return {
                success: true,
                message: 'Successfully udpate task',
                data: updatedTask
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error when updating task',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Delete task
     * @param id Task's ID
     * @returns Promise<ApiResponse<boolean>>
     */
    async deleteTask(id: TaskId): Promise<ApiResponse<boolean>> {
        try {
            await this.initialize();

            const taskIndex = this.tasks.findIndex(t => t.id == id);

            if (taskIndex == -1) {
                return {
                    success: false,
                    message: 'Cannot find specified task',
                    error: 'TASK_NOT_FOUND'
                };
            }

            const deletedTask = this.tasks[taskIndex];
            this.tasks.splice(taskIndex, 1);

            const saved = await saveTasks(this.tasks);
            if (!saved) {
                throw new Error('Failed to save task')
            }

            return {
                success: true,
                message: `Task "${deletedTask.title}" has been deleted`,
                data: true
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error when deleting task',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Update task's status
     * @param id Task's ID
     * @param status new status
     * @returns Promise<ApiResponse<Task>>
     */
    async updateTaskStatus(id: TaskId, status: TaskStatus): Promise<ApiResponse<Task>> {
        return this.udpateTask(id, { status });
    }

    /**
     * Get statistical info of task
     * @returns Promise<ApiResponse<TaskStats>> 
     */
    async getTaskStats(): Promise<ApiResponse<TaskStats>> {
        try {
            await this.initialize();

            const stats: TaskStats = {
                total: this.tasks.length,
                todo: this.tasks.filter(t => t.status == TaskStatus.TODO).length,
                inProgress: this.tasks.filter(t => t.status == TaskStatus.IN_PROGRESS).length,
                completed: this.tasks.filter(t => t.status == TaskStatus.COMPLETED).length,
                overdue: this.tasks.filter(t => this.isTaskOverdue(t)).length
            };

            return {
                success: true,
                message: 'Successfully get task stats',
                data: stats
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error when getting task stats',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }


    // === Private Helper Functions ===

    /**
     * Create unique task ID
     * @returns string
     */
    private generateTaskId(): string {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 5);
        return `task_${timestamp}_${randomStr}`;
    }

    /**
     * Apply filtering criteria
     * @param tasks task arrays
     * @param filters filtering criteria
     * @returns Task[]
     */
    private applyFilters(tasks: Task[], filters: TaskFilterOptions): Task[] {
        return tasks.filter(task => {
            // Filtering status
            if (filters.status && task.status != filters.status) {
                return false;
            }

            // Filtering description
            if (filters.hasDescription != undefined) {
                const hasDesc = Boolean(task.description?.trim());
                if (hasDesc != filters.hasDescription) {
                    return false;
                }
            }

            // Filtering due date
            if (filters.dueBefore && task.dueDate && task.dueDate > filters.dueBefore) {
                return false;
            }

            if (filters.dueAfter && task.dueDate && task.dueDate < filters.dueAfter) {
                return false;
            }

            return true;
        });
    }

    /**
     * Check if task is overdue
     * @param task 
     * @returns boolean
     */
    private isTaskOverdue(task: Task): boolean {
        if (!task.dueDate || task.status == TaskStatus.COMPLETED) {
            return false;
        }
        return task.dueDate < new Date();
    }
}

/**
 * Interface of task stats
 */
export interface TaskStats {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    overdue: number;
}

// export singleton instance
export const taskService = new TaskService();
