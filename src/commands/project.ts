import { Command } from 'commander';
import { ProjectWorkflow } from '../workflows/project.workflow.js';
import { AuthWorkflow } from '../workflows/auth.workflow.js';
import { Display } from '../utils/display.js';
import inquirer from 'inquirer';
import ora from 'ora';

const project = new Command();

project
  .name('project')
  .description('Manage GCP projects');

project
  .command('list')
  .description('List all accessible projects')
  .action(async () => {
    try {
      Display.showCommandTitle('List Projects');
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

project
  .command('create')
  .description('Create a new GCP project')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-n, --name <name>', 'Project display name')
  .option('-o, --organization <organizationId>', 'Organization ID')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Create New Project');
      const answers: any = {};

      if (!options.projectId) {
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
        answers.projectId = answer.projectId;
      }

      if (!options.name) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'name',
          message: 'Enter project display name:',
          validate: (input: string) => {
            if (input.length < 4 || input.length > 30) {
              return 'Project name must be between 4 and 30 characters';
            }
            return true;
          }
        }]);
        answers.name = answer.name;
      }

      if (!options.organization) {
        const orgs = await ProjectWorkflow.listOrganizations();
        if (orgs.length > 0) {
          Display.showSection('Available Organizations');
          const answer = await inquirer.prompt([{
            type: 'list',
            name: 'organizationId',
            message: 'Select organization:',
            choices: orgs.map((org: { displayName: string, organizationId: string }) => ({
              name: `${org.displayName} (${org.organizationId})`,
              value: org.organizationId
            }))
          }]);
          answers.organizationId = answer.organizationId;
        }
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
      const success = await ProjectWorkflow.createProject(
        options.projectId || answers.projectId,
        options.name || answers.name
      );
      spinner.stop();

      if (success) {
        Display.showSuccess(`Successfully created project "${options.projectId || answers.projectId}"`);
        Display.showTable(
          ['Property', 'Value'],
          [
            ['Project ID', options.projectId || answers.projectId],
            ['Display Name', options.name || answers.name],
            ['Organization', options.organization || answers.organizationId || 'None'],
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

project
  .command('delete')
  .description('Delete a GCP project')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Delete Project');
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
          message: 'Select project to delete:',
          choices: projects
        }]);
        projectId = answer.projectId;
      }

      Display.showWarning(`You are about to delete project "${projectId}". This action cannot be undone.`);
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

      const spinner = ora('Deleting project...').start();
      const success = await ProjectWorkflow.deleteProject(projectId);
      spinner.stop();

      if (success) {
        Display.showSuccess(`Successfully deleted project "${projectId}"`);
      } else {
        Display.showError(`Failed to delete project "${projectId}"`);
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error deleting project: ${error}`);
      process.exit(1);
    }
  });

project
  .command('info')
  .description('Get project information')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Project Information');
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

      const spinner = ora('Fetching project information...').start();
      const projectInfo = await ProjectWorkflow.getProject(projectId);
      spinner.stop();

      if (projectInfo) {
        Display.showSection(`Project Details for "${projectId}"`);
        Display.showTable(
          ['Property', 'Value'],
          [
            ['Project ID', projectInfo.projectId],
            ['Name', projectInfo.name],
            ['Organization', projectInfo.organizationId || 'None'],
            ['Created', projectInfo.createTime],
            ['State', projectInfo.state],
            ['Number of APIs Enabled', projectInfo.enabledApis?.length.toString() || '0']
          ]
        );

        if (projectInfo.enabledApis && projectInfo.enabledApis.length > 0) {
          Display.showSection('Enabled APIs');
          Display.showList('APIs', projectInfo.enabledApis);
        }
      } else {
        Display.showError(`Project "${projectId}" not found`);
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error fetching project information: ${error}`);
      process.exit(1);
    }
  });

export default project; 