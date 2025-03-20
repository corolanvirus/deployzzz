import { Command } from 'commander';
import { BillingWorkflow } from '../workflows/billing.workflow.js';
import { AuthWorkflow } from '../workflows/auth.workflow.js';
import { logger } from '../utils/logger.js';
import inquirer from 'inquirer';
import ora from 'ora';

interface BillingAnswers {
  projectId?: string;
  billingAccountId?: string;
}

const billing = new Command();

billing
  .name('billing')
  .description('Manage GCP Billing accounts and settings');

billing
  .command('list-accounts')
  .description('List all billing accounts')
  .action(async () => {
    try {
      const spinner = ora('Fetching billing accounts...').start();
      const accounts = await BillingWorkflow.listBillingAccounts();
      spinner.stop();

      if (accounts.length === 0) {
        logger.info('No billing accounts found');
      } else {
        logger.info('Billing accounts:');
        accounts.forEach(account => {
          logger.info(`- ${account}`);
        });
      }
    } catch (error) {
      logger.error('Error listing billing accounts:', error);
      process.exit(1);
    }
  });

billing
  .command('link')
  .description('Link a billing account to a project')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-b, --billing-account <billingAccount>', 'Billing account ID')
  .action(async (options) => {
    try {
      const answers: BillingAnswers = {};

      if (!options.projectId) {
        const projects = await AuthWorkflow.listProjects();
        if (projects.length === 0) {
          logger.error('No projects found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'projectId',
          message: 'Select a project:',
          choices: projects
        }]);
        answers.projectId = answer.projectId;
      }

      if (!options.billingAccount) {
        const accounts = await BillingWorkflow.listBillingAccounts();
        if (accounts.length === 0) {
          logger.error('No billing accounts found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'billingAccount',
            message: 'Select billing account:',
            choices: accounts
          },
          {
            type: 'confirm',
            name: 'confirm',
            message: (answers: any) => `Are you sure you want to link billing account "${answers.billingAccount}" to project "${options.projectId || answers.projectId}"?`,
            default: false
          }
        ]);

        if (!answer.confirm) {
          logger.info('Operation cancelled');
          process.exit(0);
        }

        answers.billingAccountId = answer.billingAccount;
      }

      const spinner = ora('Linking billing account...').start();
      const success = await BillingWorkflow.linkBillingAccount(
        options.projectId || answers.projectId!,
        options.billingAccount || answers.billingAccountId!
      );

      if (success) {
        spinner.succeed(`Successfully linked billing account "${options.billingAccount || answers.billingAccountId}" to project "${options.projectId || answers.projectId}"`);
      } else {
        spinner.fail('Failed to link billing account');
        process.exit(1);
      }
    } catch (error) {
      logger.error('Error linking billing account:', error);
      process.exit(1);
    }
  });

billing
  .command('check')
  .description('Check if billing is enabled for a project')
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

        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'projectId',
          message: 'Select a project:',
          choices: projects
        }]);
        projectId = answer.projectId;
      }

      const spinner = ora('Checking billing status...').start();
      const isEnabled = await BillingWorkflow.isBillingEnabled(projectId);
      spinner.stop();

      if (isEnabled) {
        logger.info(`✅ Billing is enabled for project "${projectId}"`);
      } else {
        logger.warn(`❌ Billing is not enabled for project "${projectId}"`);
      }
    } catch (error) {
      logger.error('Error checking billing status:', error);
      process.exit(1);
    }
  });

export default billing; 