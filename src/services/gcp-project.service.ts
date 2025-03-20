import { execSync } from 'child_process';
import { logger } from '../utils/logger.js';

export class GCPProjectServiceImpl {
  /**
   * List all projects
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
   * Get project details
   * @param projectId - The GCP project ID
   * @returns Promise<any> - Project details
   */
  public static async getProject(projectId: string): Promise<any> {
    try {
      const result = execSync(`gcloud projects describe ${projectId} --format="json"`, { stdio: 'pipe' });
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error('Failed to get project details:', error);
      return null;
    }
  }

  /**
   * Create a new project
   * @param projectId - The GCP project ID
   * @param name - The project name
   * @returns Promise<boolean> - True if project was created successfully
   */
  public static async createProject(projectId: string, name: string): Promise<boolean> {
    try {
      execSync(`gcloud projects create ${projectId} --name="${name}"`, { stdio: 'inherit' });
      logger.info('Project created successfully!');
      return true;
    } catch (error) {
      logger.error('Failed to create project:', error);
      return false;
    }
  }

  /**
   * Delete a project
   * @param projectId - The GCP project ID
   * @returns Promise<boolean> - True if project was deleted successfully
   */
  public static async deleteProject(projectId: string): Promise<boolean> {
    try {
      execSync(`gcloud projects delete ${projectId} --quiet`, { stdio: 'inherit' });
      logger.info('Project deleted successfully!');
      return true;
    } catch (error) {
      logger.error('Failed to delete project:', error);
      return false;
    }
  }

  /**
   * Set project number
   * @param projectId - The GCP project ID
   * @param number - The project number to set
   * @returns Promise<boolean> - True if project number was set successfully
   */
  public static async setProjectNumber(projectId: string, number: string): Promise<boolean> {
    try {
      execSync(`gcloud projects update ${projectId} --project-number=${number}`, { stdio: 'inherit' });
      logger.info('Project number updated successfully!');
      return true;
    } catch (error) {
      logger.error('Failed to set project number:', error);
      return false;
    }
  }

  /**
   * List all organizations
   * @returns Promise<Array<{organizationId: string, displayName: string}>> - List of organizations
   */
  public static async listOrganizations(): Promise<Array<{organizationId: string, displayName: string}>> {
    try {
      const result = execSync('gcloud organizations list --format="json"', { stdio: 'pipe' });
      const organizations = JSON.parse(result.toString());
      return organizations.map((org: any) => ({
        organizationId: org.organizationId,
        displayName: org.displayName
      }));
    } catch (error) {
      logger.error('Failed to list organizations:', error);
      return [];
    }
  }
} 