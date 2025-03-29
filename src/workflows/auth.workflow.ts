import { logger } from '../utils/logger.js';
import { GCPAuthServiceImpl } from '../services/gcp-auth.service.js';
import { GCPProjectServiceImpl } from '../services/gcp-project.service.js';

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
      return await GCPAuthServiceImpl.isAuthenticated();
    } catch (error) {
      logger.error('Failed to check authentication status:', error);
      return false;
    }
  }

  /**
   * Authenticate with GCP
   * @returns Promise<boolean> - True if authentication was successful
   */
  public static async authenticate(): Promise<boolean> {
    try {
      logger.info('Authenticating with GCP');
      return await GCPAuthServiceImpl.authenticate();
    } catch (error) {
      logger.error('Failed to authenticate:', error);
      return false;
    }
  }

  /**
   * List all connected accounts
   * @returns Promise<string[]> - List of connected account emails
   */
  public static async listAccounts(excludeCurrentAccount: boolean = false): Promise<string[]> {
    try {
      logger.info('Listing connected accounts');
      return await GCPAuthServiceImpl.listAccounts(excludeCurrentAccount);
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
      return await GCPProjectServiceImpl.listProjects();
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
   * Switch to a different account
   * @param accountEmail - The email of the account to switch to
   * @returns Promise<boolean> - True if the account switch was successful
   */
  public static async switchAccount(accountEmail: string): Promise<boolean> {
    try {
      logger.info('Switching account');
      return await GCPAuthServiceImpl.switchAccount(accountEmail);
    } catch (error) {
      logger.error('Failed to switch account:', error);
      return false;
    }
  }

  /**
   * Log out from the current account
   * @returns Promise<boolean> - True if the logout was successful
   */
  public static async logout(): Promise<boolean> {
    try {
      logger.info('Logging out');
      return await GCPAuthServiceImpl.logout();
    } catch (error) {
      logger.error('Failed to logout:', error);
      return false;
    }
  }

  /**
   * Add a new account
   * @returns Promise<boolean> - True if the account was added successfully
   */
  public static async addAccount(): Promise<boolean> {
    try {
      logger.info('Adding new account');
      return await GCPAuthServiceImpl.addAccount();
    } catch (error) {
      logger.error('Failed to add account:', error);
      return false;
    }
  }

  /**
   * Get current active account
   * @returns Promise<string | null> - The current active account email or null if not found
   */
  public static async getCurrentAccount(): Promise<string | null> {
    try {
      logger.info('Getting current account');
      return await GCPAuthServiceImpl.getCurrentAccount();
    } catch (error) {
      logger.error('Failed to get current account:', error);
      return null;
    }
  }
} 