import { Command } from 'commander';
import { PermissionsWorkflow } from '../workflows/permissions.workflow.js';
import { AuthWorkflow } from '../workflows/auth.workflow.js';
import { logger } from '../utils/logger.js';
import inquirer from 'inquirer';
import ora from 'ora';

const permissions = new Command();

permissions
  .name('permissions')
  .description('Manage GCP Permissions');

permissions
  .command('list')
  .description('List permissions for a project')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .action(async (options) => {
    try {
      let projectId = options.projectId;

      if (!projectId) {
        const projects = await AuthWorkflow.listProjects();
        if (projects.length === 0) {
          logger.error('No projects found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'projectId',
            message: 'Select a project:',
            choices: projects
          }
        ]);
        projectId = answer.projectId;
      }

      const spinner = ora('Fetching permissions...').start();
      const perms = await PermissionsWorkflow.listPermissions(projectId);
      spinner.stop();

      if (perms.length === 0) {
        logger.info('No permissions found');
      } else {
        logger.info('Permissions:');
        perms.forEach(perm => logger.info(`- ${perm}`));
      }
    } catch (error) {
      logger.error('Error listing permissions:', error);
      process.exit(1);
    }
  });

permissions
  .command('check')
  .description('Check specific permissions')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-r, --permissions <permissions>', 'Comma-separated list of permissions to check')
  .action(async (options) => {
    try {
      let projectId = options.projectId;
      let permissionsList = options.permissions ? options.permissions.split(',') : null;

      if (!projectId) {
        const projects = await AuthWorkflow.listProjects();
        if (projects.length === 0) {
          logger.error('No projects found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'projectId',
            message: 'Select a project:',
            choices: projects
          }
        ]);
        projectId = answer.projectId;
      }

      if (!permissionsList) {
        const allPerms = await PermissionsWorkflow.listPermissions(projectId);
        if (allPerms.length === 0) {
          logger.error('No permissions available to check');
          process.exit(1);
        }

        const answer = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'permissions',
            message: 'Select permissions to check:',
            choices: allPerms,
            validate: (input: string[]) => {
              if (input.length === 0) {
                return 'Please select at least one permission';
              }
              return true;
            }
          }
        ]);
        permissionsList = answer.permissions;
      }

      const spinner = ora('Checking permissions...').start();
      const results = await PermissionsWorkflow.checkPermissions(projectId, permissionsList);
      spinner.stop();

      logger.info('Permission check results:');
      Object.entries(results).forEach(([perm, hasPermission]) => {
        if (hasPermission) {
          logger.info(`✅ ${perm}: Granted`);
        } else {
          logger.warn(`❌ ${perm}: Denied`);
        }
      });
    } catch (error) {
      logger.error('Error checking permissions:', error);
      process.exit(1);
    }
  });

export default permissions; 