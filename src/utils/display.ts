import boxen from 'boxen';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { logger } from './logger.js';

export class Display {
  static readonly colors = {
    primary: '#4285F4',    // Google Blue
    secondary: '#34A853',  // Google Green
    warning: '#FBBC05',    // Google Yellow
    error: '#EA4335',      // Google Red
    info: '#4285F4',       // Google Blue
    success: '#34A853',    // Google Green
  };

  static showBanner(): void {
    console.log('\n');
    console.log(
      gradient(['#4285F4', '#34A853', '#FBBC05', '#EA4335'])(
        figlet.textSync('DeployZzz', {
          font: 'Standard',
          horizontalLayout: 'full'
        })
      )
    );
    console.log('\n');
  }

  static showCommandTitle(title: string): void {
    console.log(
      boxen(gradient(['#4285F4', '#34A853'])(title), {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: '#4285F4'
      })
    );
  }

  static showSection(title: string): void {
    console.log(
      '\n' +
      chalk.hex('#4285F4')('━'.repeat(20)) +
      ' ' +
      chalk.bold.hex('#4285F4')(title) +
      ' ' +
      chalk.hex('#4285F4')('━'.repeat(20)) +
      '\n'
    );
  }

  static showSuccess(message: string): void {
    logger.info(
      boxen(chalk.green('✓ ') + message, {
        padding: 1,
        margin: { top: 0, bottom: 1, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: '#34A853'
      })
    );
  }

  static showError(message: string): void {
    logger.error(
      boxen(chalk.red('✗ ') + message, {
        padding: 1,
        margin: { top: 0, bottom: 1, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: '#EA4335'
      })
    );
  }

  static showWarning(message: string): void {
    logger.warn(
      boxen(chalk.yellow('⚠ ') + message, {
        padding: 1,
        margin: { top: 0, bottom: 1, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: '#FBBC05'
      })
    );
  }

  static showInfo(message: string): void {
    logger.info(
      boxen(chalk.blue('ℹ ') + message, {
        padding: 1,
        margin: { top: 0, bottom: 1, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: '#4285F4'
      })
    );
  }

  static showList(title: string, items: string[]): void {
    if (items.length === 0) {
      this.showInfo('No items found');
      return;
    }

    this.showSection(title);
    items.forEach((item, index) => {
      console.log(
        chalk.hex('#4285F4')(`${index + 1}.`) +
        ' ' +
        chalk.white(item)
      );
    });
    console.log('\n');
  }

  static showTable(headers: string[], rows: string[][]): void {
    if (rows.length === 0) {
      this.showInfo('No data found');
      return;
    }

    // Calculer la largeur maximale pour chaque colonne
    const colWidths = headers.map((_, colIndex) => {
      const maxWidth = Math.max(
        headers[colIndex].length,
        ...rows.map(row => row[colIndex]?.length || 0)
      );
      return maxWidth + 2; // Ajouter un peu d'espace
    });

    // Créer la ligne de séparation
    const separator = '┼' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┼';

    // Afficher l'en-tête
    console.log('┌' + colWidths.map(w => '─'.repeat(w)).join('┬') + '┐');
    console.log(
      '│' +
      headers.map((header, i) => 
        chalk.hex('#4285F4')(header.padEnd(colWidths[i]))
      ).join('│') +
      '│'
    );
    console.log(separator);

    // Afficher les lignes
    rows.forEach(row => {
      console.log(
        '│' +
        row.map((cell, i) => 
          chalk.white(cell.padEnd(colWidths[i]))
        ).join('│') +
        '│'
      );
    });

    // Afficher la ligne de fin
    console.log('└' + colWidths.map(w => '─'.repeat(w)).join('┴') + '┘');
    console.log('\n');
  }

  static showProgress(message: string): void {
    console.log(
      chalk.hex('#4285F4')('→') +
      ' ' +
      chalk.white(message)
    );
  }

  static showConfirmation(message: string): void {
    console.log(
      boxen(
        chalk.hex('#FBBC05')('? ') + 
        chalk.white(message), {
        padding: 1,
        margin: { top: 0, bottom: 1, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: '#FBBC05'
      })
    );
  }
} 