import { createCLI } from './cli/commands';
import chalk from 'chalk';

/**
 * Main entrypoint
 */
async function main(): Promise<void> {
    try {
        // Show welcome message
        console.log(chalk.blue.bold('\n🚀 TypeScript Task Management Tool\n'));

        // Create CLI program
        const program = createCLI();

        // Parse CLI arguments
        await program.parseAsync(process.argv);

    } catch (error) {
        console.error(chalk.red('❌ Error when executing program:'), error);
        process.exit(1);
    }
}

/**
 * Handle uncaught exception
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('Unhandled Promise Rejection:'), reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error(chalk.red('Uncaught Exception:'), error);
    process.exit(1);
});

// If this file is executed directly (not imported)
if (require.main === module) {
    main().catch((error) => {
        console.error(chalk.red('Failed to run the program:'), error);
        process.exit(1);
    });
}
