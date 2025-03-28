import { execSync } from 'child_process';
import { logger } from '../utils/logger.js';

export class GCPAuthServiceImpl {
  /**
   * Check if user is already authenticated
   */
  public static async isAuthenticated(): Promise<boolean> {
    try {
      const result = execSync('gcloud auth list --filter=status:ACTIVE --format="json"', { stdio: 'pipe' });
      const accounts = JSON.parse(result.toString());
      return accounts.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Authenticate with GCP
   * @returns Promise<boolean> - True if authentication was successful
   */
  public static async authenticate(): Promise<boolean> {
    try {
      // Force browser opening for authentication
      execSync('gcloud auth login --launch-browser', { 
        stdio: 'inherit'
      });

      // Check if authentication was successful
      const result = execSync('gcloud auth list --filter=status:ACTIVE --format="json"', { 
        stdio: 'pipe' 
      });
      
      return JSON.parse(result.toString()).length > 0;
    } catch (error) {
      logger.error('Failed to authenticate:', error);
      return false;
    }
  }

  /**
   * Get current active account
   */
  public static async getCurrentAccount(): Promise<string | null> {
    try {
      const result = execSync('gcloud config get-value account', { stdio: 'pipe' });
      const account = result.toString().trim();
      return account || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * List connected accounts
   * @param excludeCurrentAccount - If true, excludes the current active account from the list
   * @returns Promise<string[]> - List of account emails
   */
  public static async listAccounts(excludeCurrentAccount: boolean = false): Promise<string[]> {
    try {
      const result = execSync('gcloud auth list --format="json"', { stdio: 'pipe' });
      const accounts = JSON.parse(result.toString()).map((account: any) => account.account);

      if (excludeCurrentAccount) {
        const currentAccount = await this.getCurrentAccount();
        return accounts.filter((account: string) => account !== currentAccount);
      }

      return accounts;
    } catch (error) {
      logger.error('Failed to list accounts:', error);
      return [];
    }
  }

  /**
   * Switch to a different GCP account
   * @param accountEmail - The email of the account to switch to
   * @returns Promise<boolean> - True if the account was switched successfully, false otherwise
   */
  public static async switchAccount(accountEmail: string): Promise<boolean> {
    try {
      execSync(`gcloud config set account ${accountEmail}`, { stdio: 'pipe' });
      return true;
    } catch (error) {
      logger.error('Failed to switch account:', error);
      return false;
    }
  }

  public static async logout(): Promise<boolean> {
    try {
      execSync('gcloud auth revoke --all --quiet', { 
        stdio: 'inherit'
      });
      return true;
    } catch (error) {
      logger.error('Failed to logout:', error);
      return false;
    }
  }

  public static async addAccount(): Promise<boolean> {
    try {
      execSync('gcloud auth login --launch-browser', { 
        stdio: 'inherit'
      });
      return true;
    } catch (error) {
      logger.error('Failed to add account:', error);
      return false;
    }
  }

  /**
   * List all connected accounts with their status
   */
  public static async listAllAccounts(): Promise<string[]> {
    try {
      const result = execSync('gcloud auth list --format="json"', { stdio: 'pipe' });
      const accounts = JSON.parse(result.toString());
      return accounts.map((account: any) => account.account);
    } catch (error) {
      logger.error('Failed to list accounts:', error);
      return [];
    }
  }
} 