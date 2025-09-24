# 🚀 TypeScript Task Manager CLI

A fully-featured command-line task management tool built with TypeScript. This is my TypeScript learning project showcasing modern TypeScript development best practices.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![CLI](https://img.shields.io/badge/CLI-4D4D4D?style=for-the-badge&logo=windows-terminal&logoColor=white)

## ✨ Features

- 📝 **Task Management**: Create, edit, and delete tasks
- 🏷️ **Status Tracking**: Todo, In Progress, Completed
- ⏰ **Due Dates**: Set and track task deadlines
- 🎨 **Interactive CLI**: Beautiful command-line interface
- 📊 **Statistics**: Task completion rates and overdue alerts
- 💾 **Data Persistence**: JSON file storage

## 🛠️ Tech Stack

- **Language**: `TypeScript 5.2+`
- **Runtime**: `Node.js 16+`
- **CLI Framework**: `Commander.js`
- **Interactive Interface**: `Inquirer.js`
- **Styling**: `Chalk` (terminal colors)
- **Tools**: `ts-node`, `nodemon`

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Build Project

```bash
npm run build
```

### Run Application

```bash
# Show help
npm start -- --help

# Add a task
npm start -- add -t "My first task" -d "This is a task description"

# List all tasks
npm start -- list

# Enter interactive mode
npm start -- interactive

# Show statistics
npm start -- stats
```

### Global Installation (Optional)

```bash
npm run link
task-manager --help
```

## 📖 Usage Guide

### Basic Commands

| Command       | Description      | Example                     |
| ------------- | ---------------- | --------------------------- |
| `add`         | Add a new task   | `add -t "Learn TypeScript"` |
| `list`        | List tasks       | `list --status todo`        |
| `update`      | Update a task    | `update <id> -s completed`  |
| `delete`      | Delete a task    | `delete <id>`               |
| `stats`       | Show statistics  | `stats`                     |
| `interactive` | Interactive mode | `interactive`               |

### Task Status

- `todo` - To Do ⏳
- `in_progress` - In Progress 🔄  
- `completed` - Completed ✅

### Example Operations

```bash
# Add task with due date
npm start -- add -t "Complete project report" --due-date "2024-12-31"

# Filter tasks by status
npm start -- list -s completed

# Update task status
npm start -- update task_xyz123 -s in_progress

# Interactive task update
npm start -- update task_xyz123
```

## 🏗️ Project Structure

```
src/
├── index.ts              # Application entry point
├── types/
│   └── Task.ts          # Type definitions
├── services/
│   └── TaskService.ts   # Core business logic
├── utils/
│   └── fileUtils.ts     # File operation utilities
└── cli/
    └── commands.ts      # CLI command handlers

data/
└── tasks.json          # Task data file

dist/                   # Compiled JavaScript files
```

## 🎓 TypeScript Features Demonstrated

This project showcases the following TypeScript core concepts:

### Type System
```typescript
// Interface definition
interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: Date;
}

// Enums
enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}
```

### Generics
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
}
```

### Classes and Access Modifiers
```typescript
class TaskService {
  private tasks: Task[] = [];
  
  async createTask(input: CreateTaskInput): Promise<ApiResponse<Task>> {
    // Implementation logic
  }
}
```

### Advanced Features
- **Optional chaining**: `task.description?.trim()`
- **Nullish coalescing**: `title ?? currentTask.title`
- **Spread operator**: `{...currentTask, ...updateData}`
- **Type guards**: `status is TaskStatus`
- **Async/await**: Modern asynchronous programming

## 🧪 Development Scripts

```bash
npm run build     # Compile TypeScript
npm run dev       # Development mode
npm run watch     # Watch mode
npm run clean     # Clean compiled files
npm run rebuild   # Clean and rebuild
```
