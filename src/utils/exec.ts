import { execSync } from 'child_process';
import { logger } from './logger.js';

export async function execCommand(command: string): Promise<void> {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    logger.error(`Command failed: ${command}`, error);
    throw error;
  }
} 