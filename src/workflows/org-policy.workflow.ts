import { logger } from '../utils/logger.js';
import { GCPOrgPolicyService } from '../services/gcp-org-policy.service.js';

/**
 * Workflow class for handling Organization Policy operations
 * This class orchestrates the business logic between commands and services
 */
export class OrgPolicyWorkflow {
  /**
   * List all organization policies for a project
   * @param projectId - The GCP project ID
   * @returns Promise<any[]> - List of organization policies
   */
  public static async listOrgPolicies(projectId: string): Promise<any[]> {
    try {
      logger.info(`Listing organization policies for project ${projectId}`);
      return await GCPOrgPolicyService.listOrgPolicies(projectId);
    } catch (error) {
      logger.error('Failed to list organization policies:', error);
      return [];
    }
  }

  /**
   * Get details of a specific policy
   * @param projectId - The GCP project ID
   * @param policyName - The name of the policy to get
   * @returns Promise<any> - Policy details
   */
  public static async getPolicy(projectId: string, policyName: string): Promise<any> {
    try {
      logger.info(`Fetching policy ${policyName} for project ${projectId}`);
      return await GCPOrgPolicyService.getPolicy(projectId, policyName);
    } catch (error) {
      logger.error('Failed to get policy:', error);
      return null;
    }
  }

  /**
   * Set enforcement status for a policy
   * @param projectId - The GCP project ID
   * @param policyName - The name of the policy
   * @param enabled - Whether to enable or disable the policy
   * @returns Promise<boolean> - True if policy was updated successfully
   */
  public static async setEnforcement(projectId: string, policyName: string, enabled: boolean): Promise<boolean> {
    try {
      logger.info(`Setting enforcement status for policy ${policyName} in project ${projectId}`);
      return await GCPOrgPolicyService.setEnforcement(projectId, policyName, enabled);
    } catch (error) {
      logger.error('Failed to set policy enforcement:', error);
      return false;
    }
  }

  /**
   * Add an exception to a policy
   * @param projectId - The GCP project ID
   * @param policyName - The name of the policy
   * @param resource - The resource to add as exception
   * @returns Promise<boolean> - True if exception was added successfully
   */
  public static async addException(projectId: string, policyName: string, resource: string): Promise<boolean> {
    try {
      logger.info(`Adding exception for policy ${policyName} in project ${projectId}`);
      return await GCPOrgPolicyService.addException(projectId, policyName, resource);
    } catch (error) {
      logger.error('Failed to add policy exception:', error);
      return false;
    }
  }
} 