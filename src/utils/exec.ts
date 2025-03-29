import { execSync } from 'child_process';
import { logger } from './logger.js';
import { isProcessInterruption } from './process.js';
/**
 * Executes a command and logs the output.
 * @param command - The command to execute.
 * @throws {Error} If the command fails.
 */
export async function execCommand(command: string): Promise<void> {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    if (isProcessInterruption(error)) {
      process.exit(0);
    }
    logger.error(`Command failed: ${command}`, error);
    throw error;
  }
} 