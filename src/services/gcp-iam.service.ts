import { execSync } from 'child_process';
import { logger } from '../utils/logger.js';

export interface IAMRole {
  name: string;
  description: string;
}

export class GCPIAMServiceImpl {
  /**
   * List of common IAM roles
   */
  private static readonly commonRoles: IAMRole[] = [
    { name: 'roles/owner', description: 'Full access to all resources' },
    { name: 'roles/editor', description: 'Edit access to all resources' },
    { name: 'roles/viewer', description: 'View access to all resources' },
    { name: 'roles/storage.admin', description: 'Full access to Cloud Storage' },
    { name: 'roles/storage.objectViewer', description: 'View access to Cloud Storage objects' },
    { name: 'roles/storage.objectCreator', description: 'Create access to Cloud Storage objects' },
    { name: 'roles/run.admin', description: 'Full access to Cloud Run' },
    { name: 'roles/iam.serviceAccountUser', description: 'Access to service accounts' },
    { name: 'roles/resourcemanager.projectIamAdmin', description: 'Manage IAM policies' },
    { name: 'roles/billing.projectManager', description: 'Manage billing for the project' },
    { name: 'roles/clouddeploy.admin', description: 'Full access to Cloud Deploy' },
    { name: 'roles/cloudsql.admin', description: 'Full access to Cloud SQL' },
    { name: 'roles/composer.environmentAndStorageObjectAdmin', description: 'Full access to Cloud Composer' },
    { name: 'roles/compute.storageAdmin', description: 'Full access to Compute Engine storage' },
    { name: 'roles/iam.securityAdmin', description: 'Manage IAM security policies' },
    { name: 'roles/iam.serviceAccountKeyAdmin', description: 'Manage service account keys' },
    { name: 'roles/resourcemanager.organizationAdmin', description: 'Manage organization resources' },
    { name: 'roles/storage.folderAdmin', description: 'Manage storage folders' }
  ];

  /**
   * Add a role to a user
   * @param projectId - The GCP project ID
   * @param userEmail - The user email
   * @param role - The IAM role to add
   * @returns Promise<boolean> - True if the role was added successfully, false otherwise
   */
  public static async addRoleToUser(projectId: string, userEmail: string, role: string): Promise<boolean> {
    try {
      execSync(
        `gcloud projects add-iam-policy-binding ${projectId} --member="user:${userEmail}" --role="${role}"`,
        { stdio: 'inherit' }
      );
      logger.info(`Role ${role} added successfully to user ${userEmail}`);
      return true;
    } catch (error) {
      logger.error('Failed to add role:', error);
      return false;
    }
  }

  /**
   * Remove a role from a user
   * @param projectId - The GCP project ID
   * @param userEmail - The user email
   * @param role - The IAM role to remove
   * @returns Promise<boolean> - True if the role was removed successfully, false otherwise
   */
  public static async removeRoleFromUser(projectId: string, userEmail: string, role: string): Promise<boolean> {
    try {
      execSync(
        `gcloud projects remove-iam-policy-binding ${projectId} --member="user:${userEmail}" --role="${role}"`,
        { stdio: 'inherit' }
      );
      logger.info(`Role ${role} removed successfully from user ${userEmail}`);
      return true;
    } catch (error) {
      logger.error('Failed to remove role:', error);
      return false;
    }
  }

  /**
   * List roles for a user
   * @param projectId - The GCP project ID
   * @param userEmail - The user email
   * @returns Promise<string[]> - List of roles
   */
  public static async listUserRoles(projectId: string, userEmail: string): Promise<string[]> {
    try {
      const result = execSync(
        `gcloud projects get-iam-policy ${projectId} --format="json"`,
        { stdio: 'pipe' }
      );
      const policy = JSON.parse(result.toString());
      
      return policy.bindings
        .filter((binding: any) => 
          binding.members.some((member: string) => member === `user:${userEmail}`)
        )
        .map((binding: any) => binding.role);
    } catch (error) {
      logger.error('Failed to list user roles:', error);
      return [];
    }
  }

  /**
   * Get common roles
   * @returns IAMRole[] - List of common IAM roles
   */
  public static getCommonRoles(): IAMRole[] {
    return this.commonRoles;
  }

  /**
   * Apply all admin roles to a user
   * @param projectId - The GCP project ID
   * @param userEmail - The user email
   * @returns Promise<boolean> - True if all roles were applied successfully, false otherwise
   */
  public static async applyAllAdminRoles(projectId: string, userEmail: string): Promise<boolean> {
    try {
      const roles = this.commonRoles.map(role => role.name);
      let success = true;

      for (const role of roles) {
        try {
          execSync(
            `gcloud projects add-iam-policy-binding ${projectId} --member="user:${userEmail}" --role="${role}"`,
            { stdio: 'inherit' }
          );
          logger.info(`Role ${role} added successfully to user ${userEmail}`);
        } catch (error) {
          logger.warn(`Failed to add role ${role}:`, error);
          success = false;
        }
      }

      return success;
    } catch (error) {
      logger.error('Failed to apply admin roles:', error);
      return false;
    }
  }
} 