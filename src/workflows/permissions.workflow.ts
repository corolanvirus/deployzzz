import { logger } from '../utils/logger.js';
import { GCPPermissionsServiceImpl } from '../services/gcp-permissions.service.js';

/**
 * Workflow class for handling GCP Permissions operations
 * This class orchestrates the business logic between commands and services
 */
export class PermissionsWorkflow {
  /**
   * List all permissions for a project
   * @param projectId - The GCP project ID
   * @returns Promise<string[]> - List of permissions
   */
  public static async listPermissions(projectId: string): Promise<string[]> {
    try {
      logger.info(`Listing permissions for project ${projectId}`);
      return await GCPPermissionsServiceImpl.listPermissions(projectId);
    } catch (error) {
      logger.error('Failed to list permissions:', error);
      return [];
    }
  }

  /**
   * Check if a user has a specific permission
   * @param projectId - The GCP project ID
   * @param userEmail - The user's email address
   * @param permission - The permission to check
   * @returns Promise<boolean> - True if user has the permission
   */
  public static async hasPermission(projectId: string, userEmail: string, permission: string): Promise<boolean> {
    try {
      logger.info(`Checking permission ${permission} for user ${userEmail} in project ${projectId}`);
      const permissions = await GCPPermissionsServiceImpl.listPermissions(projectId);
      return permissions.some((p: string) => p.includes(permission) && p.includes(userEmail));
    } catch (error) {
      logger.error('Failed to check permission:', error);
      return false;
    }
  }

  /**
   * List all permissions for a specific user
   * @param projectId - The GCP project ID
   * @param userEmail - The user's email address
   * @returns Promise<string[]> - List of permissions
   */
  public static async listUserPermissions(projectId: string, userEmail: string): Promise<string[]> {
    try {
      logger.info(`Listing permissions for user ${userEmail} in project ${projectId}`);
      const permissions = await GCPPermissionsServiceImpl.listPermissions(projectId);
      return permissions.filter((p: string) => p.includes(userEmail));
    } catch (error) {
      logger.error('Failed to list user permissions:', error);
      return [];
    }
  }

  /**
   * Check multiple permissions at once
   * @param projectId - The GCP project ID
   * @param permissions - Array of permissions to check
   * @returns Promise<Record<string, boolean>> - Object mapping permissions to their status
   */
  public static async checkPermissions(projectId: string, permissions: string[]): Promise<Record<string, boolean>> {
    try {
      logger.info(`Checking permissions for project ${projectId}: ${permissions.join(', ')}`);
      const availablePermissions = await GCPPermissionsServiceImpl.listPermissions(projectId);
      const results: Record<string, boolean> = {};
      
      for (const permission of permissions) {
        results[permission] = availablePermissions.includes(permission);
      }
      
      return results;
    } catch (error) {
      logger.error('Failed to check permissions:', error);
      return Object.fromEntries(permissions.map(p => [p, false]));
    }
  }
} 