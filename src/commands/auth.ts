import { Command } from 'commander';
import { AuthWorkflow } from '../workflows/auth.workflow.js';
import { Display } from '../utils/display.js';
import inquirer from 'inquirer';
import ora from 'ora';
import { handleProcessInterruption, isProcessInterruption } from '../utils/process.js';

const auth = new Command();

auth
  .name('auth')
  .description('Manage GCP authentication');

auth
  .command('check')
  .description('Check and manage authentication status')
  .action(async () => {
    try {
      Display.showCommandTitle('Authentication Status');
      const spinner = ora('Checking authentication status...').start();
      
      const isAuthenticated = await AuthWorkflow.isAuthenticated();
      const currentAccount = await AuthWorkflow.getCurrentAccount();
      const otherAccounts = await AuthWorkflow.listAccounts(true);
      
      spinner.stop();

      if (isAuthenticated && currentAccount) {
        // Display current status concisely
        Display.showTable(
          ['Current Account', 'Status'],
          [[currentAccount, '🟢 Active']]
        );

        // Propose interactive actions
        const choices = [
          { name: 'Add account', value: 'add' },
          ...(otherAccounts.length > 0 ? [{ name: 'Switch account', value: 'switch' }] : []),
          { name: 'Logout', value: 'logout' },
          { name: 'Exit', value: 'exit' }
        ];

        if (otherAccounts.length > 0) {
          Display.showSection('Other Connected Accounts');
          otherAccounts.forEach(account => console.log(`  ${account}`));
          console.log('\n');
        }

        const { action } = await inquirer.prompt([{
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices
        }]);

        switch (action) {
          case 'add':
            const addSpinner = ora('Opening browser for authentication...').start();
            await AuthWorkflow.addAccount();
            addSpinner.stop();
            Display.showSuccess('New account added successfully');
            // Refresh the view with updated state
            await auth.parseAsync(['check']);
            break;

          case 'switch':
            if (otherAccounts.length === 0) {
              Display.showInfo('No other accounts available to switch to');
              break;
            }
            const { newAccount } = await inquirer.prompt([{
              type: 'list',
              name: 'newAccount',
              message: 'Select account to switch to:',
              choices: otherAccounts
            }]);
            const switchSpinner = ora('Switching account...').start();
            await AuthWorkflow.switchAccount(newAccount);
            switchSpinner.stop();
            Display.showSuccess(`Switched to account: ${newAccount}`);
            break;

          case 'logout':
            const { confirmLogout } = await inquirer.prompt([{
              type: 'confirm',
              name: 'confirmLogout',
              message: 'Are you sure you want to logout?',
              default: false
            }]);
            
            if (confirmLogout) {
              const logoutSpinner = ora('Logging out...').start();
              await AuthWorkflow.logout();
              logoutSpinner.stop();
              Display.showSuccess('Successfully logged out');
            }
            break;

          case 'exit':
            break;
        }
      } else {
        Display.showError('You are not authenticated with GCP');
        const { shouldLogin } = await inquirer.prompt([{
          type: 'confirm',
          name: 'shouldLogin',
          message: 'Would you like to login now?',
          default: true
        }]);

        if (shouldLogin) {
          const spinner = ora('Authenticating with GCP...').start();
          const success = await AuthWorkflow.authenticate();
          spinner.stop();

          if (success) {
            Display.showSuccess('Successfully authenticated with GCP');
            // Refresh the view with updated state
            await auth.parseAsync(['check']);
          } else {
            Display.showError('Failed to authenticate with GCP');
            process.exit(1);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('SIGINT')) {
        console.log('\nOperation cancelled');
        process.exit(0);
      }
      Display.showError(`Error: ${error}`);
      process.exit(1);
    }
  });

auth
  .command('login')
  .description('Login to GCP')
  .action(async () => {
    try {
      Display.showCommandTitle('GCP Authentication');
      const spinner = ora('Authenticating with GCP...').start();
      const success = await AuthWorkflow.authenticate();
      spinner.stop();

      if (success) {
        Display.showSuccess('Successfully authenticated with GCP');
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
      const currentAccount = await AuthWorkflow.getCurrentAccount();
      const allAccounts = await AuthWorkflow.listAccounts(false);
      spinner.stop();

      if (allAccounts.length === 0) {
        Display.showInfo('No accounts connected');
        Display.showInfo('Run "deployzzz auth login" to connect an account');
      } else {
        Display.showTable(
          ['Account', 'Status'],
          allAccounts.map(account => [
            account,
            account === currentAccount ? '🟢 Active' : '⚪️ Connected'
          ])
        );
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
      let name = options.name;
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
      if (!name) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'name',
          message: 'Enter project name:',
        }]);
        name = answer.name;
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
      const success = await AuthWorkflow.createProject(projectId, name)
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

auth
  .command('switch')
  .description('Switch to another GCP account')
  .action(async () => {
    try {
      Display.showCommandTitle('Switch Account');
      const spinner = ora('Fetching accounts...').start();
      const currentAccount = await AuthWorkflow.getCurrentAccount();
      const otherAccounts = await AuthWorkflow.listAccounts(true);
      spinner.stop();

      if (otherAccounts.length === 0) {
        Display.showInfo('No other accounts available to switch to');
        Display.showInfo('Use "deployzzz auth login" to add another account');
        return;
      }

      const { newAccount } = await inquirer.prompt([{
        type: 'list',
        name: 'newAccount',
        message: 'Select account to switch to:',
        choices: otherAccounts
      }]);

      const switchSpinner = ora('Switching account...').start();
      const success = await AuthWorkflow.switchAccount(newAccount);
      switchSpinner.stop();

      if (success) {
        Display.showSuccess(`Successfully switched to account: ${newAccount}`);
        Display.showTable(
          ['Previous Account', 'Current Account'],
          [[currentAccount || 'None', newAccount]]
        );
      } else {
        Display.showError('Failed to switch account');
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error switching account: ${error}`);
      process.exit(1);
    }
  });

auth
  .command('logout')
  .description('Logout from GCP')
  .action(async () => {
    try {
      Display.showCommandTitle('GCP Logout');
      
      const { confirmLogout } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirmLogout',
        message: 'Are you sure you want to logout? This will revoke all connected accounts.',
        default: false
      }]);

      if (!confirmLogout) {
        Display.showInfo('Logout cancelled');
        return;
      }

      const spinner = ora('Logging out...').start();
      const success = await AuthWorkflow.logout();
      spinner.stop();

      if (success) {
        Display.showSuccess('Successfully logged out from all accounts');
      } else {
        Display.showError('Failed to logout');
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error during logout: ${error}`);
      process.exit(1);
    }
  });

export default auth; 