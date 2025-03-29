import { execSync } from 'child_process';
import { logger } from '../utils/logger.js';

export class GCPBillingServiceImpl {
  /**
   * List all billing accounts
   */
  public static async listBillingAccounts(): Promise<string[]> {
    try {
      const result = execSync('gcloud billing accounts list --format="json"', { stdio: 'pipe' });
      const accounts = JSON.parse(result.toString());
      return accounts.map((account: any) => account.name);
    } catch (error) {
      logger.error('Failed to list billing accounts:', error);
      return [];
    }
  }

  /**
   * Link a billing account to a project
   * @param projectId - The GCP project ID
   * @param billingAccountId - The billing account ID
   * @returns Promise<boolean> - True if the billing account was linked successfully, false otherwise
   */
  public static async linkBillingAccount(projectId: string, billingAccountId: string): Promise<boolean> {
    try {
      execSync(
        `gcloud billing projects link ${projectId} --billing-account=${billingAccountId}`,
        { stdio: 'inherit' }
      );
      logger.info('Billing account linked successfully!');
      return true;
    } catch (error) {
      logger.error('Failed to link billing account:', error);
      return false;
    }
  }

  /**
   * Check if billing is enabled for a project
   * @param projectId - The GCP project ID
   * @returns Promise<boolean> - True if billing is enabled, false otherwise
   */
  public static async isBillingEnabled(projectId: string): Promise<boolean> {
    try {
      const result = execSync(`gcloud billing projects describe ${projectId} --format="json"`, { stdio: 'pipe' });
      const billingInfo = JSON.parse(result.toString());
      return billingInfo.billingEnabled;
    } catch (error) {
      logger.error('Failed to check billing status:', error);
      return false;
    }
  }
} 