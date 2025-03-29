import { execSync } from 'child_process';
import { logger } from '../utils/logger.js';

export class GCPPermissionsServiceImpl {
  /**
   * List user permissions for the current project
   * @param projectId - The GCP project ID
   * @returns Promise<string[]> - List of permissions
   */
  public static async listPermissions(projectId: string): Promise<string[]> {
    try {
      // Get current user email
      const userEmail = execSync('gcloud config get-value account', { stdio: 'pipe' }).toString().trim();
      
      // Get IAM policy for the project
      const iamPolicy = execSync(
        `gcloud projects get-iam-policy ${projectId} --format="json"`,
        { stdio: 'pipe' }
      );
      
      const policy = JSON.parse(iamPolicy.toString());
      
      // Find user's roles
      const userRoles = policy.bindings
        .filter((binding: any) => 
          binding.members.some((member: string) => 
            member === `user:${userEmail}`
          )
        )
        .map((binding: any) => binding.role);
      
      if (userRoles.length === 0) {
        logger.warn('No permissions found for the current user');
        return [];
      }
      
      logger.info('Your permissions:');
      userRoles.forEach((role: string) => {
        logger.info(`- ${role}`);
      });

      return userRoles;
      
    } catch (error) {
      logger.error('Failed to list permissions:', error);
      return [];
    }
  }
} 