import { logger } from '../utils/logger.js';
import { GCPProjectServiceImpl } from '../services/gcp-project.service.js';

/**
 * Workflow class for handling GCP Project operations
 * This class orchestrates the business logic between commands and services
 */
export class ProjectWorkflow {
  /**
   * List all projects
   * @returns Promise<string[]> - List of project IDs
   */
  public static async listProjects(): Promise<string[]> {
    try {
      logger.info('Listing all projects');
      return await GCPProjectServiceImpl.listProjects();
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
      logger.info(`Getting details for project ${projectId}`);
      return await GCPProjectServiceImpl.getProject(projectId);
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
      logger.info(`Creating new project ${projectId}`);
      return await GCPProjectServiceImpl.createProject(projectId, name);
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
      logger.info(`Deleting project ${projectId}`);
      return await GCPProjectServiceImpl.deleteProject(projectId);
    } catch (error) {
      logger.error('Failed to delete project:', error);
      return false;
    }
  }

  /**
   * Set project number
   * @param projectId - The GCP project ID
   * @param projectNumber - The project number to set
   * @returns Promise<boolean> - True if project number was set successfully
   */
  public static async setProjectNumber(projectId: string, projectNumber: string): Promise<boolean> {
    try {
      logger.info(`Setting project number for ${projectId}`);
      return await GCPProjectServiceImpl.setProjectNumber(projectId, projectNumber);
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
      logger.info('Listing all organizations');
      return await GCPProjectServiceImpl.listOrganizations();
    } catch (error) {
      logger.error('Failed to list organizations:', error);
      return [];
    }
  }
} 