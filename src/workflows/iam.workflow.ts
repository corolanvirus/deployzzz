import { logger } from '../utils/logger.js';
import { GCPIAMServiceImpl } from '../services/gcp-iam.service.js';

/**
 * Workflow class for handling IAM operations
 * This class orchestrates the business logic between commands and services
 */
export class IAMWorkflow {
  /**
   * Apply all admin roles to a user
   * @param projectId - The GCP project ID
   * @param userEmail - The user's email address
   * @returns Promise<boolean> - True if all roles were applied successfully
   */
  public static async applyAllAdminRoles(projectId: string, userEmail: string): Promise<boolean> {
    try {
      logger.info(`Applying all admin roles to user ${userEmail} in project ${projectId}`);
      return await GCPIAMServiceImpl.applyAllAdminRoles(projectId, userEmail);
    } catch (error) {
      logger.error('Failed to apply admin roles:', error);
      return false;
    }
  }

  /**
   * Add a role to a user
   * @param projectId - The GCP project ID
   * @param userEmail - The user's email address
   * @param role - The role to add
   * @returns Promise<boolean> - True if role was added successfully
   */
  public static async addRoleToUser(projectId: string, userEmail: string, role: string): Promise<boolean> {
    try {
      logger.info(`Adding role ${role} to user ${userEmail} in project ${projectId}`);
      return await GCPIAMServiceImpl.addRoleToUser(projectId, userEmail, role);
    } catch (error) {
      logger.error('Failed to add role:', error);
      return false;
    }
  }

  /**
   * Remove a role from a user
   * @param projectId - The GCP project ID
   * @param userEmail - The user's email address
   * @param role - The role to remove
   * @returns Promise<boolean> - True if role was removed successfully
   */
  public static async removeRoleFromUser(projectId: string, userEmail: string, role: string): Promise<boolean> {
    try {
      logger.info(`Removing role ${role} from user ${userEmail} in project ${projectId}`);
      return await GCPIAMServiceImpl.removeRoleFromUser(projectId, userEmail, role);
    } catch (error) {
      logger.error('Failed to remove role:', error);
      return false;
    }
  }

  /**
   * List all roles for a user
   * @param projectId - The GCP project ID
   * @param userEmail - The user's email address
   * @returns Promise<string[]> - List of roles
   */
  public static async listUserRoles(projectId: string, userEmail: string): Promise<string[]> {
    try {
      logger.info(`Listing roles for user ${userEmail} in project ${projectId}`);
      return await GCPIAMServiceImpl.listUserRoles(projectId, userEmail);
    } catch (error) {
      logger.error('Failed to list user roles:', error);
      return [];
    }
  }

  /**
   * Get list of common roles
   * @returns Array of role objects with name and description
   */
  public static getCommonRoles() {
    return GCPIAMServiceImpl.getCommonRoles();
  }
} 