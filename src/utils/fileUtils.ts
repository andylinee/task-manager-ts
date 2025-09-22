import * as fs from 'fs';
import * as path from 'path';
import { Task } from '../types/Task';

/**
 * const for operating files
 */
const DATA_DIR = path.join(__dirname, '../../data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

/**
 * Ensure the data directory exists
 */
function ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

/**
 * Ensure the tasks' file exist
 */
function ensureTasksFile(): void {
    ensureDataDirectory();

    if (!fs.existsSync(TASKS_FILE)) {
        fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
}

/**
 * Load all tasks from the file
 * @returns Promise<Task[]> task array
 */
export async function loadTasks(): Promise<Task[]> {
    try {
        ensureTasksFile();

        const data = await fs.promises.readFile(TASKS_FILE, 'utf8');
        const tasksData = JSON.parse(data);

        // transform string date into Date object
        return tasksData.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));
    } catch (error) {
        console.error('Error when loading tasks file: ', error);
        return [];
    }
}

/**
 * Save task array to file
 * @param tasks task array to be saved
 * @returns Promise<boolean> save successfully or not
 */
export async function saveTasks(tasks: Task[]): Promise<boolean> {
    try {
        ensureTasksFile();

        const data = JSON.stringify(tasks, null, 2);
        await fs.promises.writeFile(TASKS_FILE, data, 'utf8');

        return true;
    } catch (error) {
        console.error('Error when saving task file: ', error);
        return false;
    }
}

/**
 * Backup existing task file
 * @returns Promise<boolean> backup successfully or not
 */
export async function backupTasks(): Promise<boolean> {
    try {
        if (!fs.existsSync(TASKS_FILE)) {
            return true;    // Don't need to backup if there's no file
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(DATA_DIR, 'tasks_backup_${timestamp}.json');

        await fs.promises.copyFile(TASKS_FILE, backupFile);
        console.log('Task has already been backed up to: ${backupFile}');

        return true;
    } catch (error) {
        console.error('Error when backing up task file: ', error);
        return false;
    }
}

/**
 * Check if the file exists and readable
 * @returns Promise<boolean> file's status is normal or not
 */
export async function checkFileHealth(): Promise<boolean> {
    try {
        ensureTasksFile();

        // Check the file is readable or not
        await fs.promises.access(TASKS_FILE, fs.constants.R_OK | fs.constants.W_OK);

        // Try to parse JSON
        const data = await fs.promises.readFile(TASKS_FILE, 'utf8');
        JSON.parse(data);

        return true;
    } catch (error) {
        console.error('Error when checking file health: ', error);
        return false;
    }
}

/**
 * Get file info
 * @returns Promise<FileInfo> | null> file info
 */
export interface FileInfo {
    exists: boolean;
    size: number;
    lastModified: Date;
    taskCount: number;
}

export async function getFileInfo(): Promise<FileInfo | null> {
    try {
        ensureTasksFile();

        const stats = await fs.promises.stat(TASKS_FILE);
        const tasks = await loadTasks();

        return {
            exists: true,
            size: stats.size,
            lastModified: stats.mtime,
            taskCount: tasks.length
        };
    } catch (error) {
        console.error('Error when getting file info: ', error);
        return null;
    }
}
