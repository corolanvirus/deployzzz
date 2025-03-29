import { execSync } from 'child_process';
import { logger } from '../utils/logger.js';
import { execCommand } from '../utils/exec.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Service class for handling GCP organization policy operations
 * This class provides low-level access to GCP org policy commands
 */
export class GCPOrgPolicyService {
  /**
   * Get the organization ID
   * @returns Promise<string> The organization ID
   * @throws Error if unable to get the organization ID
   */
  public static async getOrgId(): Promise<string> {
    try {
      const result = execSync('gcloud organizations list --format="value(ID)"', { stdio: 'pipe' });
      return result.toString().trim();
    } catch (error) {
      logger.error('Failed to get organization ID:', error);
      throw error;
    }
  }

  /**
   * Check and display organization policy status
   */
  public static async checkOrgPolicy(projectId: string): Promise<void> {
    try {
      // Get the organization ID
      const orgId = await this.getOrgId();
      
      // Check the public access prevention policy
      logger.info('Checking public access prevention policy...');
      const policy = await this.getPolicy(
        projectId,
        'constraints/storage.publicAccessPrevention'
      );
      
      logger.info('Current policy status :');
      logger.info(JSON.stringify(policy, null, 2));
      
      // Display options to modify the policy
      logger.info('\nOptions to modify the policy :');
      logger.info('1. Disable the restriction :');
      logger.info(`   gcloud resource-manager org-policies disable-enforce constraints/storage.publicAccessPrevention --organization=${orgId}`);
      logger.info('\n2. Add an exception for a specific bucket :');
      logger.info(`   gcloud resource-manager org-policies set-policy constraints/storage.publicAccessPrevention --organization=${orgId} --policy-file=policy.json`);
      logger.info('\nExample content for policy.json :');
      logger.info(`{
        "constraint": "constraints/storage.publicAccessPrevention",
        "listPolicy": {
          "allowedValues": ["projects/${orgId}/buckets/MON_BUCKET"]
        }
      }`);
      
    } catch (error) {
      logger.error('Error checking the policy :', error);
      throw error;
    }
  }

  /**
   * List all organization policies
   */
  public static async listOrgPolicies(projectId: string): Promise<any[]> {
    try {
      const result = execSync(
        `gcloud resource-manager org-policies list --project=${projectId} --format="json"`,
        { stdio: 'pipe' }
      );
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error('Failed to list organization policies:', error);
      return [];
    }
  }

  /**
   * Get a specific organization policy
   * @param projectId - The GCP project ID
   * @param policyName - The name of the policy to retrieve
   * @returns Promise<any> The policy object
   * @throws Error if unable to get the policy
   */
  public static async getPolicy(projectId: string, policyName: string): Promise<any> {
    try {
      const result = execSync(
        `gcloud resource-manager org-policies describe ${policyName} --project=${projectId} --format="json"`,
        { stdio: 'pipe' }
      );
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error(`Failed to get organization policy ${policyName}:`, error);
      throw error;
    }
  }

  /**
   * Set the enforcement status of an organization policy
   * @param projectId - The GCP project ID
   * @param policyName - The name of the policy to modify
   * @param enforce - Whether to enforce the policy
   * @returns Promise<boolean> True if successful
   */
  public static async setEnforcement(projectId: string, policyName: string, enforce: boolean): Promise<boolean> {
    try {
      const command = enforce
        ? `gcloud resource-manager org-policies enable-enforce ${policyName} --project=${projectId}`
        : `gcloud resource-manager org-policies disable-enforce ${policyName} --project=${projectId}`;
      
      await execCommand(command);
      logger.info(`Successfully ${enforce ? 'enabled' : 'disabled'} ${policyName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to set organization policy ${policyName}:`, error);
      return false;
    }
  }

  /**
   * Add an exception to an organization policy
   * @param projectId - The GCP project ID
   * @param policyName - The name of the policy
   * @param resource - The resource to add as an exception
   * @returns Promise<boolean> True if successful
   */
  public static async addException(projectId: string, policyName: string, resource: string): Promise<boolean> {
    try {
      const command = `gcloud resource-manager org-policies allow ${policyName} --project=${projectId} --values=${resource}`;
      await execCommand(command);
      logger.info(`Successfully added exception for ${resource} to ${policyName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to add exception to organization policy ${policyName}:`, error);
      return false;
    }
  }
} 