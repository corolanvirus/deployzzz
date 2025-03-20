import { logger } from '../utils/logger.js';
import { GCPBillingServiceImpl } from '../services/gcp-billing.service.js';

/**
 * Workflow class for handling GCP Billing operations
 * This class orchestrates the business logic between commands and services
 */
export class BillingWorkflow {
  /**
   * Link a billing account to a project
   * @param projectId - The GCP project ID
   * @param billingAccountId - The billing account ID to link
   * @returns Promise<boolean> - True if billing account was linked successfully
   */
  public static async linkBillingAccount(projectId: string, billingAccountId: string): Promise<boolean> {
    try {
      logger.info(`Linking billing account ${billingAccountId} to project ${projectId}`);
      return await GCPBillingServiceImpl.linkBillingAccount(projectId, billingAccountId);
    } catch (error) {
      logger.error('Failed to link billing account:', error);
      return false;
    }
  }

  /**
   * Check if billing is enabled for a project
   * @param projectId - The GCP project ID
   * @returns Promise<boolean> - True if billing is enabled
   */
  public static async isBillingEnabled(projectId: string): Promise<boolean> {
    try {
      logger.info(`Checking billing status for project ${projectId}`);
      return await GCPBillingServiceImpl.isBillingEnabled(projectId);
    } catch (error) {
      logger.error('Failed to check billing status:', error);
      return false;
    }
  }

  /**
   * List all billing accounts
   * @returns Promise<string[]> - List of billing account IDs
   */
  public static async listBillingAccounts(): Promise<string[]> {
    try {
      logger.info('Fetching billing accounts');
      return await GCPBillingServiceImpl.listBillingAccounts();
    } catch (error) {
      logger.error('Failed to list billing accounts:', error);
      return [];
    }
  }
} 