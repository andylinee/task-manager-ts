import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { taskService } from '../services/TaskService';
import {
    TaskStatus,
    getTaskStatusLabel,
    isValidTaskStatus,
    Task,
    CreateTaskInput,
    UpdateTaskInput
} from '../types/Task';


/**
 * Create and set up CLI program
 */
export function createCLI(): Command {
    const program = new Command();

    program
        .name('task-manager')
        .description('TypeScript Task Management Tool')
        .version('1.0.0')

    // Intructions to create task
    program
        .command('add')
        .alias('a')
        .description('Create a task')
        .option('-t, --title <title>', 'Task Title')
        .option('-d, --description <description>', 'Task Description')
        .option('--due-date <date>', 'Due Date (YYYY-MM-DD)')
        .action(async (options) => {
            await handleAddTask(options);
        });

    // Intructions to list task
    program
        .command('list')
        .alias('ls')
        .description('List all tasks')
        .option('-s, --status <status>', 'Filter by Status (todo|in_progress|completed')
        .option('--overdue', 'Show Overdue Task Only')
        .action(async (options) => {
            await handleListTasks(options);
        });

    // Intructions to update task
    program
        .command('update')
        .alias('u')
        .description('Update tasks')
        .argument('<id>', 'Task ID')
        .option('-t, --title <title>', 'New Task Title')
        .option('-d, --description <description>', 'New Task Description')
        .option('-s, --status <status>', 'New Status (todo|in_progress|completed')
        .option('--due-date <date>', 'New Due Date (YYYY-MM-DD)')
        .action(async (id, options) => {
            await handleUpdateTask(id, options);
        });

    // Intructions to delete task
    program
        .command('delete')
        .alias('del')
        .description('Delete a task')
        .argument('<id>', 'Task ID')
        .option('-y, --yes', 'Skip the confirm reminder')
        .action(async (id, options) => {
            await handleDeleteTask(id, options);
        });

    // Intructions to show stats
    program
        .command('stats')
        .description('Show task stats')
        .action(async (options) => {
            await handleShowStats();
        });

    // Intructions to interactive mode
    program
        .command('interactive')
        .alias('i')
        .description('Enter the interactive mode')
        .action(async (options) => {
            await handleInteractiveMode();
        });

    return program;
}


/**
 * Handle Add Task
 */
async function handleAddTask(options: any): Promise<void> {
    try {
        let taskData: CreateTaskInput;

        if (options.title) {
            // Use CLI arguments
            taskData = {
                title: options.title,
                description: options.description,
                dueDate: options.dueDate ? new Date(options.dueDate) : undefined
            };
        } else {
            // Use interactive input
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'Task title: ',
                    validate: (input) => input.trim() ? true : 'Title cannot be empty'
                },
                {
                    type: 'input',
                    name: 'description',
                    message: 'Task description (optional): ',
                },
                {
                    type: 'input',
                    name: 'dueDate',
                    message: 'Due Date (YYYY-MM-DD, optional): ',
                    validate: (input) => {
                        if (!input) return true;
                        const date = new Date(input);
                        return !isNaN(date.getTime()) ? true : 'Please input valid date format';
                    }
                }
            ]);

            taskData = {
                title: answers.title,
                description: answers.description || undefined,
                dueDate: answers.dueDate ? new Date(answers.dueDate) : undefined
            };
        }

        const result = await taskService.createTask(taskData);

        if (result.success && result.data) {
            console.log(chalk.green('✅ Task created successfully!'));
            displayTask(result.data);
        } else {
            console.log(chalk.red('❌ Failed to create task: '), result.message);
        }
    } catch (error) {
        console.log(chalk.red('❌ Error: '), error);
    }
}

/**
 * Handle list tasks
 */
async function handleListTasks(options: any): Promise<void> {
    try {
        const filterOptions: any = {};

        if (options.status && isValidTaskStatus(options.status)) {
            filterOptions.status = options.status as TaskStatus;
        }

        if (options.overdue) {
            filterOptions.dueBefore = new Date();
        }

        const result = await taskService.getAllTasks(filterOptions);

        if (result.success && result.data) {
            if (result.data.length == 0) {
                console.log(chalk.yellow('📝 Found no task'));
                return;
            }

            console.log(chalk.blue(`\n📋 FOund ${result.data.length} tasks:\n`));
            result.data.forEach(task => displayTask(task));
        } else {
            console.log(chalk.red('❌ Failed to get task:'), result.message);
        }
    } catch (error) {
        console.log(chalk.red('❌ Error:'), error);
    }
}

/**
 * Handle update task
 */
async function handleUpdateTask(id: string, options: any): Promise<void> {
    try {
        const updateData: UpdateTaskInput = {};

        if (options.title) updateData.title = options.title;
        if (options.description) updateData.description = options.description;
        if (options.status && isValidTaskStatus(options.status)) {
            updateData.status = options.status as TaskStatus;
        }
        if (options.dueDate) updateData.dueDate = new Date(options.dueDate);

        // If there's no option provided, use interactive mode
        if (Object.keys(updateData).length == 0) {
            const taskResult = await taskService.getTaskById(id);
            if (!taskResult.success || !taskResult.data) {
                console.log(chalk.red('❌ Cannot find specified task'));
                return;
            }

            const currentTask = taskResult.data;
            console.log(chalk.blue('Current task info:'));
            displayTask(currentTask);

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'New title (keep if empty):',
                    default: currentTask.title
                },
                {
                    type: 'input',
                    name: 'description',
                    message: 'New description (keep if empty):',
                    default: currentTask.description || ''
                },
                {
                    type: 'list',
                    name: 'status',
                    message: 'New status',
                    choices: [
                        { name: 'todo', value: TaskStatus.TODO },
                        { name: 'in_progress', value: TaskStatus.IN_PROGRESS },
                        { name: 'completed', value: TaskStatus.COMPLETED }
                    ],
                    default: currentTask.status
                }
            ]);

            updateData.title = answers.title != currentTask.title ? answers.title : undefined;
            updateData.description = answers.description != (currentTask.description || '') ? answers.description : undefined;
            updateData.status = answers.status != currentTask.status ? answers.status : undefined;
        }

        const result = await taskService.updateTask(id, updateData);

        if (result.success && result.data) {
            console.log(chalk.green('✅ Update task successfully!'));
            displayTask(result.data);
        } else {
            console.log(chalk.red('❌ Failed to update'), result.message);
        }
    } catch (error) {
        console.log(chalk.red('❌ Error'), error);
    }
}

/**
 * Handle delete task
 */
async function handleDeleteTask(id: string, options: any): Promise<void> {
    try {
        // Get task info first
        const taskResult = await taskService.getTaskById(id);
        if (!taskResult.success || !taskResult.data) {
            console.log(chalk.red('❌ Cannot find specified task'));
            return;
        }

        const task = taskResult.data;

        // Show task to be deleted
        console.log(chalk.yellow('⚠️ Task below is going to be deleted:'));
        displayTask(task);

        // Confirm delete (unless use -y option)
        if (!options.yes) {
            const answer = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Are you sure you want to delete this task?',
                    default: false
                }
            ]);

            if (!answer.confirm) {
                console.log(chalk.blue('Cancel delete'));
                return;
            }
        }

        const result = await taskService.deleteTask(id);

        if (result.success) {
            console.log(chalk.green('✅ Task has been deleted!'));
        } else {
            console.log(chalk.red('❌ Failed to delete:'), result.message);
        }
    } catch (error) {
        console.log(chalk.red('❌ Error:'), error);
    }
}

/**
 * Handle show stats
 */
async function handleShowStats(): Promise<void> {
    try {
        const result = await taskService.getTaskStats();

        if (result.success && result.data) {
            const stats = result.data;

            console.log(chalk.blue('\n📊 Task Stats Info:'));
            console.log(chalk.white('-'.repeat(30)));
            console.log(`📝 Total tasks: ${chalk.yellow(stats.total)}`);
            console.log(`⏳ Todo: ${chalk.gray(stats.todo)}`);
            console.log(`🔄 In progress: ${chalk.blue(stats.inProgress)}`);
            console.log(`✅ Completed: ${chalk.green(stats.completed)}`);
            console.log(`⚠️ Overdue: ${chalk.red(stats.overdue)}`);

            if (stats.total > 0) {
                const completionRate = Math.round((stats.completed / stats.total) * 100);
                console.log(`🎯 Completion Rate: ${chalk.yellow(completionRate + '%')}`);
            }
        } else {
            console.log(chalk.red('❌ Failed to get stats info:'), result.message);
        }
    } catch (error) {
        console.log(chalk.red('❌ Error:'), error);
    }
}

/**
 * Handle interactive mode
 */
async function handleInteractiveMode(): Promise<void> {
    console.log(chalk.blue('🚀 Welcome to use interactive mode!'));

    while (true) {
        try {
            const answer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Please choose the action:',
                    choices: [
                        { name: '📝 Add task', value: 'add' },
                        { name: '📋 List tasks', value: 'list' },
                        { name: '✏️  Update task', value: 'update' },
                        { name: '🗑️  Delete task', value: 'delete' },
                        { name: '📊 Task stats', value: 'stats' },
                        { name: '🚪 Exit', value: 'exit' }
                    ]
                }
            ]);

            if (answer.action == 'exit') {
                console.log(chalk.blue('👋 Goodbye!'));
                break;
            }

            switch (answer.action) {
                case 'add':
                    await handleAddTask({});
                    break;
                case 'list':
                    await handleListTasks({});
                    break;
                case 'update':
                    await handleInteractiveUpdate();
                    break;
                case 'delete':
                    await handleInteractiveDelete();
                    break;
                case 'stats':
                    await handleShowStats();
                    break;
            }

            console.log();
        } catch (error) {
            console.log(chalk.red('❌ Error:'), error);
        }
    }
}

/**
 * Handle Update in Interactive Mode
 */
async function handleInteractiveUpdate(): Promise<void> {
    const tasksResult = await taskService.getAllTasks();
    if (!tasksResult.success || !tasksResult.data || tasksResult.data.length == 0) {
        console.log(chalk.yellow('📝 No task can be updated'));
        return;
    }

    const taskChoices = tasksResult.data.map(task => ({
        name: `${getTaskStatusIcon(task.status)} ${task.title}`,
        value: task.id
    }));

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'taskId',
            message: 'Please choose the taks to be updated:',
            choices: taskChoices
        }
    ]);

    await handleUpdateTask(answer.taskId, {});
}

/**
 * Handle Delete in Interactive Mode
 */
async function handleInteractiveDelete(): Promise<void> {
    const tasksResult = await taskService.getAllTasks();
    if (!tasksResult.success || !tasksResult.data || tasksResult.data.length == 0) {
        console.log(chalk.yellow('📝 No task can be deleted'));
        return;
    }

    const taskChoices = tasksResult.data.map(task => ({
        name: `${getTaskStatusIcon(task.status)} ${task.title}`,
        value: task.id
    }));

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'taskId',
            message: 'Please choose the taks to be deleted:',
            choices: taskChoices
        }
    ]);

    await handleDeleteTask(answer.taskId, {});
}

/**
 * Display task info
 */
function displayTask(task: Task): void {
    const statusIcon = getTaskStatusIcon(task.status);
    const statusLabel = getTaskStatusLabel(task.status);

    console.log(chalk.white('-'.repeat(50)));
    console.log(`${statusIcon} ${chalk.bold(task.title)}`);
    console.log(`📋 ID: ${chalk.dim(task.id)}`);
    console.log(`🏷️  Status: ${getStatusColor(task.status)(statusLabel)}`);

    if (task.description) {
        console.log(`📝 Description: ${task.description}`)
    }

    console.log(`📅 Create: ${formatDate(task.createdAt)}`);

    if (task.updatedAt.getTime() != task.createdAt.getTime()) {
        console.log(`🔄 Update: ${formatDate(task.updatedAt)}`);
    }

    if (task.dueDate) {
        const isOverdue = task.dueDate < new Date() && task.status != TaskStatus.COMPLETED;
        const dueDateColor = isOverdue ? chalk.red : chalk.yellow;
        console.log(`⏰ Due: ${dueDateColor(formatDate(task.dueDate))}`);
        if (isOverdue) {
            console.log(chalk.red('⚠️ Task is overdue!'));
        }
    }
}

/**
 * Get task status icon
 */
function getTaskStatusIcon(status: TaskStatus): string {
    const icons = {
        [TaskStatus.TODO]: '⏳',
        [TaskStatus.IN_PROGRESS]: '🔄',
        [TaskStatus.COMPLETED]: '✅'
    };
    return icons[status];
}

/**
 * Get status color
 */
function getStatusColor(status: TaskStatus) {
    const colors = {
        [TaskStatus.TODO]: chalk.gray,
        [TaskStatus.IN_PROGRESS]: chalk.blue,
        [TaskStatus.COMPLETED]: chalk.green
    };
    return colors[status];
}

/**
 * Format displaying date
 */
function formatDate(date: Date): string {
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
