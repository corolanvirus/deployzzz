import { Command } from 'commander';
import { AuthWorkflow } from '../workflows/auth.workflow.js';
import { Display } from '../utils/display.js';
import inquirer from 'inquirer';
import ora from 'ora';

const auth = new Command();

auth
  .name('auth')
  .description('Manage GCP authentication');

auth
  .command('check')
  .description('Check if user is authenticated')
  .action(async () => {
    try {
      Display.showCommandTitle('Check Authentication Status');
      const spinner = ora('Checking authentication status...').start();
      const isAuthenticated = await AuthWorkflow.isAuthenticated();
      spinner.stop();

      if (isAuthenticated) {
        Display.showSuccess('You are authenticated with GCP');
      } else {
        Display.showError('You are not authenticated with GCP');
        Display.showInfo('Run "deployzzz auth login" to authenticate');
      }
    } catch (error) {
      Display.showError(`Error checking authentication: ${error}`);
      process.exit(1);
    }
  });

auth
  .command('login')
  .description('Login to GCP')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .action(async (options) => {
    try {
      Display.showCommandTitle('GCP Authentication');
      let projectId = options.projectId;

      if (!projectId) {
        const projects = await AuthWorkflow.listProjects();
        if (projects.length === 0) {
          Display.showError('No projects found');
          process.exit(1);
        }

        Display.showSection('Available Projects');
        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'projectId',
          message: 'Select project:',
          choices: projects
        }]);
        projectId = answer.projectId;
      }

      const spinner = ora('Authenticating with GCP...').start();
      const success = await AuthWorkflow.authenticate(projectId);
      spinner.stop();

      if (success) {
        Display.showSuccess('Successfully authenticated with GCP');
        Display.showTable(
          ['Property', 'Value'],
          [
            ['Project ID', projectId],
            ['Status', 'Authenticated']
          ]
        );
      } else {
        Display.showError('Failed to authenticate with GCP');
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error during authentication: ${error}`);
      process.exit(1);
    }
  });

auth
  .command('list-accounts')
  .description('List all connected accounts')
  .action(async () => {
    try {
      Display.showCommandTitle('Connected Accounts');
      const spinner = ora('Fetching accounts...').start();
      const accounts = await AuthWorkflow.listAccounts();
      spinner.stop();

      if (accounts.length === 0) {
        Display.showInfo('No accounts connected');
        Display.showInfo('Run "deployzzz auth login" to connect an account');
      } else {
        Display.showList('Connected Accounts', accounts);
      }
    } catch (error) {
      Display.showError(`Error listing accounts: ${error}`);
      process.exit(1);
    }
  });

auth
  .command('list-projects')
  .description('List all accessible projects')
  .action(async () => {
    try {
      Display.showCommandTitle('Accessible Projects');
      const spinner = ora('Fetching projects...').start();
      const projects = await AuthWorkflow.listProjects();
      spinner.stop();

      if (projects.length === 0) {
        Display.showInfo('No projects found');
        Display.showInfo('You may need to create a new project or request access to existing ones');
      } else {
        Display.showList('Available Projects', projects);
      }
    } catch (error) {
      Display.showError(`Error listing projects: ${error}`);
      process.exit(1);
    }
  });

auth
  .command('create-project')
  .description('Create a new GCP project')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Create New Project');
      let projectId = options.projectId;

      if (!projectId) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'projectId',
          message: 'Enter project ID:',
          validate: (input: string) => {
            if (!/^[a-z][-a-z0-9]{4,28}[a-z0-9]$/.test(input)) {
              return 'Project ID must be between 6 and 30 characters, start with a letter, and contain only lowercase letters, numbers, and hyphens';
            }
            return true;
          }
        }]);
        projectId = answer.projectId;
      }

      Display.showWarning('Creating a new project may incur costs');
      const confirm = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: 'Are you sure you want to continue?',
        default: false
      }]);

      if (!confirm.proceed) {
        Display.showInfo('Operation cancelled');
        process.exit(0);
      }

      const spinner = ora('Creating project...').start();
      const success = await AuthWorkflow.createProject(projectId);
      spinner.stop();

      if (success) {
        Display.showSuccess(`Successfully created project "${projectId}"`);
        Display.showTable(
          ['Property', 'Value'],
          [
            ['Project ID', projectId],
            ['Status', 'Created']
          ]
        );
      } else {
        Display.showError('Failed to create project');
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error creating project: ${error}`);
      process.exit(1);
    }
  });

export default auth; 