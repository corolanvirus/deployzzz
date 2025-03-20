import { logger } from '../utils/logger.js';
import { GCPAuthServiceImpl } from '../services/gcp-auth.service.js';

/**
 * Workflow class for handling GCP Authentication operations
 * This class orchestrates the business logic between commands and services
 */
export class AuthWorkflow {
  /**
   * Check if user is authenticated
   * @returns Promise<boolean> - True if user is authenticated
   */
  public static async isAuthenticated(): Promise<boolean> {
    try {
      logger.info('Checking authentication status');
      return await GCPAuthServiceImpl.isAuthenticated();
    } catch (error) {
      logger.error('Failed to check authentication status:', error);
      return false;
    }
  }

  /**
   * Authenticate with GCP
   * @param projectId - The GCP project ID
   * @returns Promise<boolean> - True if authentication was successful
   */
  public static async authenticate(projectId: string): Promise<boolean> {
    try {
      logger.info(`Authenticating with project ${projectId}`);
      return await GCPAuthServiceImpl.authenticate(projectId);
    } catch (error) {
      logger.error('Failed to authenticate:', error);
      return false;
    }
  }

  /**
   * List all connected accounts
   * @returns Promise<string[]> - List of connected account emails
   */
  public static async listAccounts(): Promise<string[]> {
    try {
      logger.info('Listing connected accounts');
      return await GCPAuthServiceImpl.listAccounts();
    } catch (error) {
      logger.error('Failed to list accounts:', error);
      return [];
    }
  }

  /**
   * List all accessible projects
   * @returns Promise<string[]> - List of project IDs
   */
  public static async listProjects(): Promise<string[]> {
    try {
      logger.info('Listing accessible projects');
      return await GCPAuthServiceImpl.listProjects();
    } catch (error) {
      logger.error('Failed to list projects:', error);
      return [];
    }
  }

  /**
   * Create a new project
   * @param projectId - The GCP project ID to create
   * @returns Promise<boolean> - True if project was created successfully
   */
  public static async createProject(projectId: string): Promise<boolean> {
    try {
      logger.info(`Creating new project ${projectId}`);
      return await GCPAuthServiceImpl.createProject(projectId);
    } catch (error) {
      logger.error('Failed to create project:', error);
      return false;
    }
  }
} 