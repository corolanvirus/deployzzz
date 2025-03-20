import { execSync } from 'child_process';
import { logger } from '../utils/logger.js';
import { execCommand } from '../utils/exec.js';

/**
 * Interface for bucket creation options
 */
interface BucketOptions {
  projectId: string;
  location?: string;
  storageClass?: string;
  isPublic?: boolean;
}

/**
 * Service class for handling GCP Storage operations
 * This class provides low-level access to GCP storage commands
 */
export class GCPStorageService {
  /**
   * Create a new GCS bucket
   * @param name - Name of the bucket to create
   * @param options - Configuration options for the bucket
   * @returns Promise<boolean> - True if bucket was created successfully
   */
  public static async createBucket(name: string, options: BucketOptions): Promise<boolean> {
    try {
      let command = `gcloud storage buckets create gs://${name} --project=${options.projectId}`;
      
      if (options.location) {
        command += ` --location=${options.location}`;
      }
      
      if (options.storageClass) {
        command += ` --storage-class=${options.storageClass}`;
      }
      
      await execCommand(command);
      logger.info(`Bucket ${name} created successfully`);
      return true;
    } catch (error) {
      logger.error('Failed to create bucket:', error);
      return false;
    }
  }

  /**
   * List all buckets in a project
   * @param projectId - The GCP project ID
   * @returns Promise<string[]> - List of bucket names
   */
  public static async listBuckets(projectId: string): Promise<string[]> {
    try {
      const result = execSync(
        `gcloud storage buckets list --project=${projectId} --format="value(name)"`,
        { stdio: 'pipe' }
      );
      return result.toString().trim().split('\n').filter(Boolean);
    } catch (error) {
      logger.error('Failed to list buckets:', error);
      return [];
    }
  }

  /**
   * Make a bucket publicly accessible
   * @param name - Name of the bucket
   * @param projectId - The GCP project ID
   * @returns Promise<boolean> - True if operation was successful
   */
  public static async makeBucketPublic(name: string, projectId: string): Promise<boolean> {
    try {
      // First, enable uniform bucket-level access
      await execCommand(
        `gcloud storage buckets update gs://${name} --uniform-bucket-level-access --project=${projectId}`
      );

      // Then, make the bucket public
      await execCommand(
        `gcloud storage buckets add-iam-policy-binding gs://${name} --member="allUsers" --role="roles/storage.objectViewer" --project=${projectId}`
      );

      logger.info(`Bucket ${name} is now public`);
      return true;
    } catch (error) {
      logger.error('Failed to make bucket public:', error);
      return false;
    }
  }

  /**
   * Make a bucket private
   * @param name - Name of the bucket
   * @param projectId - The GCP project ID
   * @returns Promise<boolean> - True if operation was successful
   */
  public static async makeBucketPrivate(name: string, projectId: string): Promise<boolean> {
    try {
      await execCommand(
        `gcloud storage buckets remove-iam-policy-binding gs://${name} --member="allUsers" --role="roles/storage.objectViewer" --project=${projectId}`
      );
      logger.info(`Bucket ${name} is now private`);
      return true;
    } catch (error) {
      logger.error('Failed to make bucket private:', error);
      return false;
    }
  }

  /**
   * Check if a bucket is public
   * @param projectId - The GCP project ID
   * @param name - Name of the bucket
   * @returns Promise<boolean> - True if bucket is public
   */
  public static async isBucketPublic(projectId: string, name: string): Promise<boolean> {
    try {
      const result = execSync(
        `gcloud storage buckets get-iam-policy gs://${name} --project=${projectId} --format="json"`,
        { stdio: 'pipe' }
      );
      const policy = JSON.parse(result.toString());
      return policy.bindings.some((binding: any) => 
        binding.members.includes('allUsers') && 
        binding.role === 'roles/storage.objectViewer'
      );
    } catch (error) {
      logger.error('Failed to check bucket public status:', error);
      return false;
    }
  }
} 