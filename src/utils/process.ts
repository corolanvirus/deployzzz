import { Display } from './display.js';

export const handleProcessInterruption = () => {
  process.on('SIGINT', () => {
    Display.showInfo('\n✖ Process interrupted by user');
    process.exit(0);
  });
}; 

/**
 * Check if the error is a process interruption
 * @param error - The error to check
 * @returns True if the error is a process interruption, false otherwise
 */
export const isProcessInterruption = (error: any) => {
  return error instanceof Error && error.message.includes('SIGINT');
};