import { logger } from '../utils/logger.js';
import { GCPStorageService } from '../services/gcp-storage.service.js';

/**
 * Interface for bucket creation options
 */
interface StorageOptions {
  projectId: string;
  location?: string;
  storageClass?: string;
  isPublic?: boolean;
}

/**
 * Workflow class for handling GCP Storage operations
 * This class orchestrates the business logic between commands and services
 */
export class StorageWorkflow {
  /**
   * Create a new storage bucket
   * @param options - The bucket creation options
   * @param bucketName - The name of the bucket to create
   * @returns Promise<boolean> - True if bucket was created successfully
   */
  public static async createBucket(options: StorageOptions, bucketName: string): Promise<boolean> {
    try {
      logger.info(`Creating bucket ${bucketName} in project ${options.projectId}`);
      const success = await GCPStorageService.createBucket(bucketName, options);
      
      if (success && options.isPublic) {
        logger.info(`Making bucket ${bucketName} public`);
        await GCPStorageService.makeBucketPublic(bucketName, options.projectId);
      }
      
      return success;
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
      logger.info(`Listing buckets in project ${projectId}`);
      return await GCPStorageService.listBuckets(projectId);
    } catch (error) {
      logger.error('Failed to list buckets:', error);
      return [];
    }
  }

  /**
   * Make a bucket publicly accessible
   * @param bucketName - Name of the bucket
   * @param projectId - The GCP project ID
   * @returns Promise<boolean> - True if operation was successful
   */
  public static async makeBucketPublic(bucketName: string, projectId: string): Promise<boolean> {
    try {
      logger.info(`Making bucket ${bucketName} public`);
      return await GCPStorageService.makeBucketPublic(bucketName, projectId);
    } catch (error) {
      logger.error('Failed to make bucket public:', error);
      return false;
    }
  }

  /**
   * Make a bucket private
   * @param bucketName - Name of the bucket
   * @param projectId - The GCP project ID
   * @returns Promise<boolean> - True if operation was successful
   */
  public static async makeBucketPrivate(bucketName: string, projectId: string): Promise<boolean> {
    try {
      logger.info(`Making bucket ${bucketName} private`);
      return await GCPStorageService.makeBucketPrivate(bucketName, projectId);
    } catch (error) {
      logger.error('Failed to make bucket private:', error);
      return false;
    }
  }

  /**
   * Check if a bucket is public
   * @param projectId - The GCP project ID
   * @param bucketName - The name of the bucket
   * @returns Promise<boolean> - True if bucket is public
   */
  public static async isBucketPublic(projectId: string, bucketName: string): Promise<boolean> {
    try {
      logger.info(`Checking if bucket ${bucketName} is public in project ${projectId}`);
      return await GCPStorageService.isBucketPublic(projectId, bucketName);
    } catch (error) {
      logger.error('Failed to check bucket public status:', error);
      return false;
    }
  }
} 