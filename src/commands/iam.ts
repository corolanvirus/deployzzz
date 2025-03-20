import { Command } from 'commander';
import { IAMWorkflow } from '../workflows/iam.workflow.js';
import { AuthWorkflow } from '../workflows/auth.workflow.js';
import { Display } from '../utils/display.js';
import inquirer from 'inquirer';
import ora from 'ora';

const iam = new Command();
const commonRoles = [
  'roles/owner',
  'roles/editor',
  'roles/viewer',
  'roles/browser',
  'roles/storage.admin',
  'roles/storage.objectViewer',
  'roles/compute.admin',
  'roles/cloudfunctions.admin'
];

iam
  .name('iam')
  .description('Manage GCP IAM roles and permissions');

iam
  .command('add-role')
  .description('Add an IAM role to a user for a project')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-e, --email <email>', 'User email')
  .option('-r, --role <role>', 'IAM role')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Add IAM Role');
      let projectId = options.projectId;
      let email = options.email;
      let role = options.role;

      if (!projectId) {
        const projects = await AuthWorkflow.listProjects();
        if (projects.length === 0) {
          Display.showError('No projects found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'projectId',
          message: 'Select project:',
          choices: projects
        }]);
        projectId = answer.projectId;
      }

      if (!email) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'email',
          message: 'Enter user email:',
          validate: (input: string) => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
              return 'Please enter a valid email address';
            }
            return true;
          }
        }]);
        email = answer.email;
      }

      if (!role) {
        Display.showSection('Common IAM Roles');
        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'role',
          message: 'Select role:',
          choices: [
            ...commonRoles.map(r => ({
              name: `${r} - ${getRoleDescription(r)}`,
              value: r
            })),
            new inquirer.Separator(),
            {
              name: 'Enter custom role',
              value: 'custom'
            }
          ]
        }]);

        if (answer.role === 'custom') {
          const customAnswer = await inquirer.prompt([{
            type: 'input',
            name: 'customRole',
            message: 'Enter custom role (format: roles/...):',
            validate: (input: string) => {
              if (!input.startsWith('roles/')) {
                return 'Role must start with "roles/"';
              }
              return true;
            }
          }]);
          role = customAnswer.customRole;
        } else {
          role = answer.role;
        }
      }

      Display.showWarning(`You are about to add role "${role}" to user "${email}" in project "${projectId}"`);
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

      const spinner = ora('Adding role...').start();
      const success = await IAMWorkflow.addRoleToUser(projectId, email, role);
      spinner.stop();

      if (success) {
        Display.showSuccess(`Successfully added role "${role}" to user "${email}"`);
        Display.showTable(
          ['Property', 'Value'],
          [
            ['Project', projectId],
            ['User', email],
            ['Role', role]
          ]
        );
      } else {
        Display.showError('Failed to add role');
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error adding role: ${error}`);
      process.exit(1);
    }
  });

iam
  .command('remove-role')
  .description('Remove an IAM role from a user for a project')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-e, --email <email>', 'User email')
  .option('-r, --role <role>', 'IAM role')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Remove IAM Role');
      let projectId = options.projectId;
      let email = options.email;
      let role = options.role;

      if (!projectId) {
        const projects = await AuthWorkflow.listProjects();
        if (projects.length === 0) {
          Display.showError('No projects found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'projectId',
          message: 'Select project:',
          choices: projects
        }]);
        projectId = answer.projectId;
      }

      if (!email) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'email',
          message: 'Enter user email:',
          validate: (input: string) => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
              return 'Please enter a valid email address';
            }
            return true;
          }
        }]);
        email = answer.email;
      }

      if (!role) {
        const roles = await IAMWorkflow.listUserRoles(projectId, email);
        if (roles.length === 0) {
          Display.showError('User has no roles in this project');
          process.exit(1);
        }

        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'role',
          message: 'Select role to remove:',
          choices: roles
        }]);
        role = answer.role;
      }

      Display.showWarning(`You are about to remove role "${role}" from user "${email}" in project "${projectId}"`);
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

      const spinner = ora('Removing role...').start();
      const success = await IAMWorkflow.removeRoleFromUser(projectId, email, role);
      spinner.stop();

      if (success) {
        Display.showSuccess(`Successfully removed role "${role}" from user "${email}"`);
      } else {
        Display.showError('Failed to remove role');
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error removing role: ${error}`);
      process.exit(1);
    }
  });

iam
  .command('list-roles')
  .description('List IAM roles for a user in a project')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-e, --email <email>', 'User email')
  .action(async (options) => {
    try {
      Display.showCommandTitle('List IAM Roles');
      let projectId = options.projectId;
      let email = options.email;

      if (!projectId) {
        const projects = await AuthWorkflow.listProjects();
        if (projects.length === 0) {
          Display.showError('No projects found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'projectId',
          message: 'Select project:',
          choices: projects
        }]);
        projectId = answer.projectId;
      }

      if (!email) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'email',
          message: 'Enter user email:',
          validate: (input: string) => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
              return 'Please enter a valid email address';
            }
            return true;
          }
        }]);
        email = answer.email;
      }

      const spinner = ora('Fetching roles...').start();
      const roles = await IAMWorkflow.listUserRoles(projectId, email);
      spinner.stop();

      Display.showSection(`IAM Roles for "${email}" in project "${projectId}"`);
      if (roles.length === 0) {
        Display.showInfo('User has no roles in this project');
      } else {
        Display.showList('Assigned Roles', roles);
      }
    } catch (error) {
      Display.showError(`Error listing roles: ${error}`);
      process.exit(1);
    }
  });

iam
  .command('apply-admin')
  .description('Apply all admin roles to a user')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-e, --email <email>', 'User email')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Apply Admin Roles');
      let projectId = options.projectId;
      let email = options.email;

      if (!projectId) {
        const projects = await AuthWorkflow.listProjects();
        if (projects.length === 0) {
          Display.showError('No projects found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'projectId',
          message: 'Select project:',
          choices: projects
        }]);
        projectId = answer.projectId;
      }

      if (!email) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'email',
          message: 'Enter user email:',
          validate: (input: string) => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
              return 'Please enter a valid email address';
            }
            return true;
          }
        }]);
        email = answer.email;
      }

      Display.showWarning('This will grant full administrative access to the user');
      Display.showSection('Roles to be Added');
      Display.showList('Admin Roles', [
        'roles/owner',
        'roles/storage.admin',
        'roles/compute.admin',
        'roles/cloudfunctions.admin'
      ]);

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

      const spinner = ora('Applying admin roles...').start();
      const success = await IAMWorkflow.applyAllAdminRoles(projectId, email);
      spinner.stop();

      if (success) {
        Display.showSuccess(`Successfully applied admin roles to user "${email}"`);
      } else {
        Display.showError('Failed to apply admin roles');
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error applying admin roles: ${error}`);
      process.exit(1);
    }
  });

function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    'roles/owner': 'Full access to all resources',
    'roles/editor': 'Edit access to all resources',
    'roles/viewer': 'View access to all resources',
    'roles/browser': 'Read-only access to browse resources',
    'roles/storage.admin': 'Full access to storage resources',
    'roles/storage.objectViewer': 'View access to storage objects',
    'roles/compute.admin': 'Full access to compute resources',
    'roles/cloudfunctions.admin': 'Full access to Cloud Functions'
  };
  return descriptions[role] || '';
}

export default iam; 