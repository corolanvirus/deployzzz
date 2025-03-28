import chalk from 'chalk';

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(chalk.blue(message), ...args);
  },
  success: (message: string, ...args: any[]) => {
    console.log(chalk.green(message), ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(chalk.red(message), ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(chalk.yellow(message), ...args);
  }
}; 