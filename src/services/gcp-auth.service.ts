import { execSync } from 'child_process';
import { logger } from '../utils/logger.js';
import { GCPConfig } from '../types/index.js';

export class GCPAuthServiceImpl {
  /**
   * Check if user is already authenticated
   */
  public static async isAuthenticated(): Promise<boolean> {
    try {
      const result = execSync('gcloud auth list --filter=status:ACTIVE --format="json"', { stdio: 'pipe' });
      const accounts = JSON.parse(result.toString());
      return accounts.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Authenticate with GCP
   */
  public static async authenticate(projectId: string): Promise<boolean> {
    try {
      // Authenticate with GCP
      execSync('gcloud auth application-default login', { stdio: 'inherit' });
      
      // Set the project
      execSync(`gcloud config set project ${projectId}`, { stdio: 'inherit' });
      
      // Set quota project
      try {
        execSync(`gcloud auth application-default set-quota-project ${projectId}`, { stdio: 'inherit' });
      } catch (error) {
        logger.warn('Could not set quota project:', error);
      }

      logger.info('Authentication successful!');
      return true;
    } catch (error) {
      logger.error('Authentication failed:', error);
      return false;
    }
  }

  /**
   * List connected accounts
   */
  public static async listAccounts(): Promise<string[]> {
    try {
      const result = execSync('gcloud auth list --format="json"', { stdio: 'pipe' });
      const accounts = JSON.parse(result.toString());
      return accounts.map((account: any) => account.account);
    } catch (error) {
      logger.error('Failed to list accounts:', error);
      return [];
    }
  }

  /**
   * List accessible projects
   */
  public static async listProjects(): Promise<string[]> {
    try {
      const result = execSync('gcloud projects list --format="json"', { stdio: 'pipe' });
      const projects = JSON.parse(result.toString());
      return projects.map((project: any) => project.projectId);
    } catch (error) {
      logger.error('Failed to list projects:', error);
      return [];
    }
  }

  /**
   * Create a new project
   */
  public static async createProject(projectId: string): Promise<boolean> {
    try {
      execSync(`gcloud projects create ${projectId}`, { stdio: 'inherit' });
      logger.info('Project created successfully!');
      return true;
    } catch (error) {
      logger.error('Failed to create project:', error);
      return false;
    }
  }
} 