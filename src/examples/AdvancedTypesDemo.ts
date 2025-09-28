import { Task, TaskStatus } from '../types/Task';
import {
    TaskSummary,
    TaskStatusCount,
    CreateTaskData,
    AdvancedTaskService,
    isCompleteTask,
    hasValidDueDate,
    TaskEventListener,
    TaskEventMap
} from '../types/AdvancedTypes';


/**
 * Examples and Tests of Advanced Types
 */
export class AdvancedTypesDemo {
    private advancedService = new AdvancedTaskService();

    /**
     * Demo the usage of Pick Type and Omit Type
     */
    demonstratePickAndOmit(): void {
        console.log('=== Demo Pick Type and Omit Type ===');

        // When creating tasks, we use Omit to exclude default fileds
        const createData: CreateTaskData = {
            title: "Learn advanced TypeScript",
            description: "Master Utility Types, Mapped Types and Conditional Types",
            status: TaskStatus.TODO,
            dueDate: new Date('2025-09-30')
        };
        console.log('Created data (exclude default fileds):', createData);

        // Simulate a complete task object
        const fullTask: Task = {
            id: 'task_123',
            ...createData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Use Pick type to extract summaried info
        const summary: TaskSummary = {
            id: fullTask.id,
            title: fullTask.title,
            status: fullTask.status
        };
        console.log('Task summary (onlt certain fields):', summary);
    }

    /**
     * Demo the usage of Record Type
     */
    demonstrateRecordType(): void {
        console.log('\n=== Demo Record Type ===');

        const tasks: Task[] = [
            {
                id: '1',
                title: 'Task 1',
                status: TaskStatus.TODO,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '2',
                title: 'Task 2',
                status: TaskStatus.IN_PROGRESS,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '3',
                title: 'Task 3',
                status: TaskStatus.COMPLETED,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Use Record Type to count the number of tasks for each status
        const statusCounts: TaskStatusCount = this.advancedService.getStatusCounts(tasks);
        console.log('Status Count:', statusCounts);

        // Record can also be used to allocate object
        const statusLabels: Record<TaskStatus, string> = {
            [TaskStatus.TODO]: '待辦',
            [TaskStatus.IN_PROGRESS]: '進行中',
            [TaskStatus.COMPLETED]: '已完成'
        };
        console.log('Status Label:', statusLabels);
    }

    /**
     * Demo the usage of Conditional Type
     */
    demonstrateConditionalTypes(): void {
        console.log('\n=== Demo Conditional Type ===');

        // Return different processing methods based on the type
        type ProcessType<T> = T extends string
            ? 'processing-text'
            : T extends number
            ? 'processing-number'
            : T extends Date
            ? 'processing-date'
            : 'processing-unknown';

        // TypeScript can infer types automatically
        type StringProcess = ProcessType<string>;   // 'processing-text'
        type NumberProcess = ProcessType<number>;   // 'processing-number'
        type DateProcess = ProcessType<Date>;       // 'processing-date'

        console.log('String Process Type:', 'processing-text' as StringProcess);
        console.log('Number Process Type:', 'processing-number' as NumberProcess);
        console.log('Date Process Type:', 'processing-date' as DateProcess);
    }

    /**
     * Demo the usage of Type Guard
     */
    demonstrateTypeGuards(): void {
        console.log('\n=== Demo Type Guard ===');

        const partialTask = {
            title: "Incomplete Task",
            status: TaskStatus.TODO
            // lack of required fields
        };

        const completeTask: Task = {
            id: 'task_456',
            title: "Complete Task",
            status: TaskStatus.TODO,
            createdAt: new Date(),
            updatedAt: new Date(),
            dueDate: new Date('2024-12-31')
        };

        // Check by Type Guard
        if (isCompleteTask(partialTask)) {
            // Here TypeScript knows partialTask is complete Task type
            console.log('Complete Task ID:', partialTask.id);
        } else {
            console.log('Task data is incomplete');
        }

        if (isCompleteTask(completeTask)) {
            console.log('Complete Task ID:', completeTask.id);

            // Further check whether it has valid due date
            if (hasValidDueDate(completeTask)) {
                // TypeScript now knows dueDate definitely exists and is the valid Date
                console.log('Due date:', completeTask.dueDate.toISOString());
            }
        }
    }

    /**
     * Demo the Type Safety of Events System
     */
    demonstrateTypeSafeEvents(): void {
        console.log('\n=== Demo Type Safe Events ===');

        // Type Safe Task Listener
        const taskCreatedListener: TaskEventListener<'task:created'> = (event) => {
            // TypeScript knows event.task is Task
            console.log('Task is created:', event.task.title);
        };

        const statusChangedListener: TaskEventListener<'task:status:changed'> = (event) => {
            // TypeScript knows the types of all properties
            console.log(`Task status from ${event.oldStatus} to ${event.newStatus}`);
            console.log('Task:', event.task.title);
        };

        // Simulation of Event Trigger
        const sampleTask: Task = {
            id: 'demo_task',
            title: 'Demo',
            status: TaskStatus.IN_PROGRESS,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        taskCreatedListener({ task: sampleTask });
        statusChangedListener({
            task: sampleTask,
            oldStatus: TaskStatus.TODO,
            newStatus: TaskStatus.IN_PROGRESS
        });
    }

    /**
     * Demo the Real Application of Mapped Type 
     */
    demonstrateMappedTypes(): void {
        console.log('\n=== Demo Mapped Type ===');

        // Create a version to convert all Date Types into String Types
        const taskData: Task = {
            id: 'mapped_task',
            title: 'Demo Mapped Type',
            status: TaskStatus.TODO,
            createdAt: new Date(),
            updatedAt: new Date(),
            dueDate: new Date('2024-12-31')
        };

        // Simulation of the process of serialzation (Date -> string)
        const serializedTask = {
            id: taskData.id,
            title: taskData.title,
            status: taskData.status,
            createdAt: taskData.createdAt.toISOString(),
            updatedAt: taskData.updatedAt.toISOString(),
            dueDate: taskData.dueDate?.toISOString()
        };

        console.log('Initial Task:', taskData);
        console.log('Serialization Task:', serializedTask);
    }

    /**
     * Run all demos
     */
    runAllDemos(): void {
        console.log('🚀 Starting Advanced TypeScript Type Demo\n');

        this.demonstratePickAndOmit();
        this.demonstrateRecordType();
        this.demonstrateConditionalTypes();
        this.demonstrateTypeGuards();
        this.demonstrateTypeSafeEvents();
        this.demonstrateMappedTypes();

        console.log('\n✅ All demos done!');
    }
}

/**
 * If run this file directly, run the demo function
 */
if (require.main === module) {
    const demo = new AdvancedTypesDemo();
    demo.runAllDemos();
}

