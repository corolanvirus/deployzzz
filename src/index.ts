#!/usr/bin/env node

import { Command } from 'commander';
import { Display } from './utils/display.js';

// Import all commands
import auth from './commands/auth.js';
import billing from './commands/billing.js';
import iam from './commands/iam.js';
import orgPolicy from './commands/org-policy.js';
import permissions from './commands/permissions.js';
import project from './commands/project.js';
import storage from './commands/storage.js';

// Main CLI setup
const program = new Command();

// Afficher la bannière
Display.showBanner();

// Configure the main program
program
  .name('deployzzz')
  .description('CLI tool for managing GCP resources')
  .version('1.0.0');

// Ajouter les commandes
program.addCommand(auth);
program.addCommand(project);
program.addCommand(storage);
program.addCommand(billing);
program.addCommand(iam);
program.addCommand(permissions);
program.addCommand(orgPolicy);

// Personnaliser l'aide
program.on('--help', () => {
  Display.showSection('Available Commands');
  Display.showTable(
    ['Command', 'Description'],
    [
      ['auth', 'Manage GCP authentication'],
      ['project', 'Manage GCP projects'],
      ['storage', 'Manage GCP storage buckets'],
      ['billing', 'Manage GCP billing'],
      ['iam', 'Manage GCP IAM roles and permissions'],
      ['permissions', 'Manage GCP permissions'],
      ['org-policy', 'Manage GCP organization policies']
    ]
  );

  Display.showSection('Examples');
  console.log('  $ deployzzz auth login');
  console.log('  $ deployzzz project create');
  console.log('  $ deployzzz storage list');
  console.log('\n');
});

// Gérer les erreurs
program.on('command:*', () => {
  Display.showError(`Invalid command: ${program.args.join(' ')}\nSee --help for a list of available commands.`);
  process.exit(1);
});

// Error handling
try {
  // Parse command line arguments
  program.parse(process.argv);

  // If no command is provided, show help
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
} catch (error: Error | unknown) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  } else {
    console.error('An unknown error occurred');
  }
  process.exit(1);
} 