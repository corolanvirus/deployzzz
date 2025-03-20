import { Command } from 'commander';
import { OrgPolicyWorkflow } from '../workflows/org-policy.workflow.js';
import { AuthWorkflow } from '../workflows/auth.workflow.js';
import { Display } from '../utils/display.js';
import inquirer from 'inquirer';
import ora from 'ora';

const orgPolicy = new Command();

orgPolicy
  .name('org-policy')
  .description('Manage GCP organization policies');

orgPolicy
  .command('list')
  .description('List all organization policies for a project')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .action(async (options) => {
    try {
      Display.showCommandTitle('List Organization Policies');
      let projectId = options.projectId;

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

      const spinner = ora('Fetching organization policies...').start();
      const policies = await OrgPolicyWorkflow.listOrgPolicies(projectId);
      spinner.stop();

      if (policies.length === 0) {
        Display.showInfo('No organization policies found');
      } else {
        Display.showSection(`Organization Policies for "${projectId}"`);
        Display.showTable(
          ['Policy Name', 'Enforcement', 'Has Exceptions'],
          policies.map(policy => [
            policy.name,
            policy.enforced ? 'Enforced' : 'Not Enforced',
            policy.exceptions?.length > 0 ? 'Yes' : 'No'
          ])
        );
      }
    } catch (error) {
      Display.showError(`Error listing organization policies: ${error}`);
      process.exit(1);
    }
  });

orgPolicy
  .command('get')
  .description('Get details of an organization policy')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-n, --policy-name <policyName>', 'Policy name')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Organization Policy Details');
      let projectId = options.projectId;
      let policyName = options.policyName;

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

      if (!policyName) {
        const policies = await OrgPolicyWorkflow.listOrgPolicies(projectId);
        if (policies.length === 0) {
          Display.showError('No policies found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'policyName',
          message: 'Select policy:',
          choices: policies.map(p => ({
            name: `${p.name} (${p.enforced ? 'Enforced' : 'Not Enforced'})`,
            value: p.name
          }))
        }]);
        policyName = answer.policyName;
      }

      const spinner = ora('Fetching policy details...').start();
      const policy = await OrgPolicyWorkflow.getPolicy(projectId, policyName);
      spinner.stop();

      if (policy) {
        Display.showSection(`Policy Details for "${policyName}"`);
        Display.showTable(
          ['Property', 'Value'],
          [
            ['Name', policy.name],
            ['Enforcement', policy.enforced ? 'Enforced' : 'Not Enforced'],
            ['Update Time', policy.updateTime || 'N/A'],
            ['Exceptions', policy.exceptions?.length.toString() || '0']
          ]
        );

        if (policy.exceptions && policy.exceptions.length > 0) {
          Display.showSection('Policy Exceptions');
          Display.showList('Resources', policy.exceptions);
        }
      } else {
        Display.showError(`Policy "${policyName}" not found`);
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error getting policy details: ${error}`);
      process.exit(1);
    }
  });

orgPolicy
  .command('set-enforcement')
  .description('Set enforcement for an organization policy')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-n, --policy-name <policyName>', 'Policy name')
  .option('-e, --enforce', 'Enable enforcement')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Set Policy Enforcement');
      let projectId = options.projectId;
      let policyName = options.policyName;
      let enforce = options.enforce;

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

      if (!policyName) {
        const policies = await OrgPolicyWorkflow.listOrgPolicies(projectId);
        if (policies.length === 0) {
          Display.showError('No policies found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'policyName',
          message: 'Select policy:',
          choices: policies.map(p => ({
            name: `${p.name} (${p.enforced ? 'Enforced' : 'Not Enforced'})`,
            value: p.name
          }))
        }]);
        policyName = answer.policyName;
      }

      if (enforce === undefined) {
        const answer = await inquirer.prompt([{
          type: 'confirm',
          name: 'enforce',
          message: 'Enable policy enforcement?',
          default: false
        }]);
        enforce = answer.enforce;
      }

      Display.showWarning(`You are about to ${enforce ? 'enable' : 'disable'} enforcement for policy "${policyName}"`);
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

      const spinner = ora('Updating policy enforcement...').start();
      const success = await OrgPolicyWorkflow.setEnforcement(projectId, policyName, enforce);
      spinner.stop();

      if (success) {
        Display.showSuccess(`Successfully ${enforce ? 'enabled' : 'disabled'} enforcement for policy "${policyName}"`);
      } else {
        Display.showError('Failed to update policy enforcement');
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error updating policy enforcement: ${error}`);
      process.exit(1);
    }
  });

orgPolicy
  .command('add-exception')
  .description('Add an exception to an organization policy')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-n, --policy-name <policyName>', 'Policy name')
  .option('-r, --resource <resource>', 'Resource path')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Add Policy Exception');
      let projectId = options.projectId;
      let policyName = options.policyName;
      let resource = options.resource;

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

      if (!policyName) {
        const policies = await OrgPolicyWorkflow.listOrgPolicies(projectId);
        if (policies.length === 0) {
          Display.showError('No policies found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'policyName',
          message: 'Select policy:',
          choices: policies.map(p => ({
            name: `${p.name} (${p.enforced ? 'Enforced' : 'Not Enforced'})`,
            value: p.name
          }))
        }]);
        policyName = answer.policyName;
      }

      if (!resource) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'resource',
          message: 'Enter resource path:',
          validate: (input: string) => {
            if (!input.startsWith('//')) {
              return 'Resource path must start with "//"';
            }
            return true;
          }
        }]);
        resource = answer.resource;
      }

      Display.showWarning(`You are about to add an exception for resource "${resource}" to policy "${policyName}"`);
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

      const spinner = ora('Adding policy exception...').start();
      const success = await OrgPolicyWorkflow.addException(projectId, policyName, resource);
      spinner.stop();

      if (success) {
        Display.showSuccess(`Successfully added exception for resource "${resource}" to policy "${policyName}"`);
      } else {
        Display.showError('Failed to add policy exception');
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error adding policy exception: ${error}`);
      process.exit(1);
    }
  });

export default orgPolicy; 