import { Command } from 'commander';
import { StorageWorkflow } from '../workflows/storage.workflow.js';
import { AuthWorkflow } from '../workflows/auth.workflow.js';
import { logger } from '../utils/logger.js';
import { Display } from '../utils/display.js';
import inquirer from 'inquirer';
import ora from 'ora';

interface StorageAnswers {
  projectId?: string;
  bucketName?: string;
  location?: string;
  storageClass?: string;
  isPublic?: boolean;
}

const storage = new Command();
const locations = ['us-central1', 'us-east1', 'us-west1', 'europe-west1', 'asia-east1'];
const storageClasses = ['STANDARD', 'NEARLINE', 'COLDLINE', 'ARCHIVE'];

storage
  .name('storage')
  .description('Manage GCP Storage buckets');

storage
  .command('create-bucket')
  .description('Create a new storage bucket')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-n, --bucket-name <bucketName>', 'Name of the bucket')
  .option('-l, --location <location>', 'Bucket location')
  .option('-s, --storage-class <storageClass>', 'Storage class')
  .option('--public', 'Make bucket public')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Create New Bucket');
      const answers: StorageAnswers = {};

      if (!options.projectId) {
        const projects = await AuthWorkflow.listProjects();
        if (projects.length === 0) {
          Display.showError('No projects found');
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

      if (!options.bucketName) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'bucketName',
          message: 'Enter bucket name:',
          validate: (input: string) => {
            if (!/^[a-z0-9][-a-z0-9.]+[a-z0-9]$/.test(input)) {
              return 'Bucket name must contain only lowercase letters, numbers, dots, and hyphens';
            }
            return true;
          }
        }]);
        answers.bucketName = answer.bucketName;
      }

      if (!options.location) {
        Display.showSection('Available Locations');
        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'location',
          message: 'Select bucket location:',
          choices: locations
        }]);
        answers.location = answer.location;
      }

      if (!options.storageClass) {
        Display.showSection('Storage Classes');
        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'storageClass',
          message: 'Select storage class:',
          choices: storageClasses.map(sc => ({
            name: `${sc} - ${getStorageClassDescription(sc)}`,
            value: sc
          }))
        }]);
        answers.storageClass = answer.storageClass;
      }

      if (options.public === undefined) {
        Display.showWarning('Making a bucket public can expose sensitive data');
        const answer = await inquirer.prompt([{
          type: 'confirm',
          name: 'isPublic',
          message: 'Make bucket public?',
          default: false
        }]);
        answers.isPublic = answer.isPublic;
      }

      const spinner = ora('Creating bucket...').start();
      const success = await StorageWorkflow.createBucket({
        projectId: options.projectId || answers.projectId!,
        location: options.location || answers.location,
        storageClass: options.storageClass || answers.storageClass,
        isPublic: options.public || answers.isPublic
      }, options.bucketName || answers.bucketName!);

      if (success) {
        spinner.stop();
        Display.showSuccess(`Successfully created bucket "${options.bucketName || answers.bucketName}"`);
        
        // Afficher le récapitulatif
        Display.showSection('Bucket Details');
        Display.showTable(
          ['Property', 'Value'],
          [
            ['Name', options.bucketName || answers.bucketName!],
            ['Project', options.projectId || answers.projectId!],
            ['Location', options.location || answers.location!],
            ['Storage Class', options.storageClass || answers.storageClass!],
            ['Public Access', (options.public || answers.isPublic) ? 'Enabled' : 'Disabled']
          ]
        );
      } else {
        spinner.stop();
        Display.showError('Failed to create bucket');
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error creating bucket: ${error}`);
      process.exit(1);
    }
  });

storage
  .command('list')
  .description('List all buckets in a project')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .action(async (options) => {
    try {
      Display.showCommandTitle('List Buckets');
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
          message: 'Select a project:',
          choices: projects
        }]);
        projectId = answer.projectId;
      }

      const spinner = ora('Fetching buckets...').start();
      const buckets = await StorageWorkflow.listBuckets(projectId);
      spinner.stop();

      Display.showSection(`Buckets in project "${projectId}"`);
      if (buckets.length === 0) {
        Display.showInfo('No buckets found in this project');
      } else {
        Display.showList('Available Buckets', buckets);
      }
    } catch (error) {
      Display.showError(`Error listing buckets: ${error}`);
      process.exit(1);
    }
  });

storage
  .command('make-public')
  .description('Make a bucket public')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-n, --bucket-name <bucketName>', 'Name of the bucket')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Make Bucket Public');
      let projectId = options.projectId;
      let bucketName = options.bucketName;

      if (!projectId) {
        const projects = await AuthWorkflow.listProjects();
        if (projects.length === 0) {
          Display.showError('No projects found');
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

      if (!bucketName) {
        const buckets = await StorageWorkflow.listBuckets(projectId);
        if (buckets.length === 0) {
          Display.showError('No buckets found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'bucketName',
            message: 'Select a bucket:',
            choices: buckets
          }
        ]);
        bucketName = answer.bucketName;
      }

      Display.showWarning(`You are about to make bucket "${bucketName}" publicly accessible`);
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

      const spinner = ora('Making bucket public...').start();
      const success = await StorageWorkflow.makeBucketPublic(bucketName, projectId);
      spinner.stop();

      if (success) {
        Display.showSuccess(`Successfully made bucket "${bucketName}" public`);
      } else {
        Display.showError(`Failed to make bucket "${bucketName}" public`);
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error making bucket public: ${error}`);
      process.exit(1);
    }
  });

storage
  .command('make-private')
  .description('Make a bucket private')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-n, --bucket-name <bucketName>', 'Name of the bucket')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Make Bucket Private');
      let projectId = options.projectId;
      let bucketName = options.bucketName;

      if (!projectId) {
        const projects = await AuthWorkflow.listProjects();
        if (projects.length === 0) {
          Display.showError('No projects found');
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

      if (!bucketName) {
        const buckets = await StorageWorkflow.listBuckets(projectId);
        if (buckets.length === 0) {
          Display.showError('No buckets found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'bucketName',
            message: 'Select a bucket:',
            choices: buckets
          }
        ]);
        bucketName = answer.bucketName;
      }

      const spinner = ora('Making bucket private...').start();
      const success = await StorageWorkflow.makeBucketPrivate(bucketName, projectId);
      spinner.stop();

      if (success) {
        Display.showSuccess(`Successfully made bucket "${bucketName}" private`);
      } else {
        Display.showError(`Failed to make bucket "${bucketName}" private`);
        process.exit(1);
      }
    } catch (error) {
      Display.showError(`Error making bucket private: ${error}`);
      process.exit(1);
    }
  });

storage
  .command('check-public')
  .description('Check if a bucket is public')
  .option('-p, --project-id <projectId>', 'GCP project ID')
  .option('-b, --bucket-name <bucketName>', 'Name of the bucket')
  .action(async (options) => {
    try {
      Display.showCommandTitle('Check Bucket Access');
      let projectId = options.projectId;
      let bucketName = options.bucketName;

      if (!projectId) {
        const projects = await AuthWorkflow.listProjects();
        if (projects.length === 0) {
          Display.showError('No projects found');
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

      if (!bucketName) {
        const buckets = await StorageWorkflow.listBuckets(projectId);
        if (buckets.length === 0) {
          Display.showError('No buckets found');
          process.exit(1);
        }

        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'bucketName',
          message: 'Select a bucket:',
          choices: buckets
        }]);
        bucketName = answer.bucketName;
      }

      const spinner = ora('Checking bucket status...').start();
      const isPublic = await StorageWorkflow.isBucketPublic(projectId, bucketName);
      spinner.stop();

      Display.showSection(`Access Status for "${bucketName}"`);
      if (isPublic) {
        Display.showWarning(`Bucket "${bucketName}" is publicly accessible`);
      } else {
        Display.showSuccess(`Bucket "${bucketName}" is private`);
      }
    } catch (error) {
      Display.showError(`Error checking bucket status: ${error}`);
      process.exit(1);
    }
  });

function getStorageClassDescription(storageClass: string): string {
  const descriptions: Record<string, string> = {
    'STANDARD': 'Hot data, frequent access',
    'NEARLINE': 'Access less than once per month',
    'COLDLINE': 'Access less than once per quarter',
    'ARCHIVE': 'Access less than once per year'
  };
  return descriptions[storageClass] || '';
}

export default storage; 