/**
 * S3 Backup Automation for Configuration Files
 *
 * Automatically backs up configuration CSV to S3 with versioning,
 * encryption, and lifecycle management.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Initialize S3 client (lazy loaded)
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }

  return s3Client;
}

export interface BackupMetadata {
  timestamp: string;
  size: number;
  checksum: string;
  configCount: number;
}

export interface BackupResult {
  success: boolean;
  key: string;
  bucket: string;
  size: number;
  checksum: string;
  url?: string;
  error?: string;
}

/**
 * Calculate MD5 checksum of a file
 * @param filePath - Path to the file
 * @returns MD5 hex digest
 */
function calculateChecksum(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Upload configuration file to S3
 * @param filePath - Local file path to upload
 * @param metadata - Optional metadata to attach
 * @returns Upload result with S3 details
 */
export async function uploadConfigToS3(
  filePath: string,
  metadata?: Record<string, string>,
): Promise<BackupResult> {
  try {
    const bucketName = process.env.S3_BACKUP_BUCKET;

    if (!bucketName) {
      return {
        success: false,
        key: '',
        bucket: '',
        size: 0,
        checksum: '',
        error: 'S3_BACKUP_BUCKET environment variable not configured',
      };
    }

    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        key: '',
        bucket: bucketName,
        size: 0,
        checksum: '',
        error: `File not found: ${filePath}`,
      };
    }

    const client = getS3Client();
    const fileContent = fs.readFileSync(filePath);
    const fileStats = fs.statSync(filePath);
    const checksum = calculateChecksum(filePath);

    // Generate S3 key with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = path.basename(filePath);
    const s3Key = `backups/${timestamp}/${fileName}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'text/csv',
      ServerSideEncryption: 'AES256', // Enable encryption at rest
      Metadata: {
        checksum,
        timestamp: new Date().toISOString(),
        source: 'lab-essentials-config-manager',
        ...metadata,
      },
      Tagging: 'Environment=Production&Type=ConfigBackup&AutomatedBackup=true',
    });

    await client.send(command);

    return {
      success: true,
      key: s3Key,
      bucket: bucketName,
      size: fileStats.size,
      checksum,
      url: `s3://${bucketName}/${s3Key}`,
    };
  } catch (error) {
    return {
      success: false,
      key: '',
      bucket: process.env.S3_BACKUP_BUCKET || '',
      size: 0,
      checksum: '',
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error during S3 upload',
    };
  }
}

/**
 * Perform nightly backup of configuration file
 * @returns Backup result
 */
export async function performNightlyBackup(): Promise<BackupResult> {
  const configPath = path.join(process.cwd(), 'data/config_store/config.csv');

  console.log('🌙 Starting nightly configuration backup...');

  const result = await uploadConfigToS3(configPath, {
    backup_type: 'nightly',
    backup_schedule: 'automated',
  });

  if (result.success) {
    console.log(`✅ Backup successful: ${result.url}`);
    console.log(`   Size: ${result.size} bytes`);
    console.log(`   Checksum: ${result.checksum}`);

    // Also create local backup for redundancy
    const localBackupDir = path.join(
      process.cwd(),
      'data/config_store/backups',
    );
    if (!fs.existsSync(localBackupDir)) {
      fs.mkdirSync(localBackupDir, { recursive: true });
    }

    const localBackupPath = path.join(
      localBackupDir,
      `config-${new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]}.csv`,
    );

    fs.copyFileSync(configPath, localBackupPath);
    console.log(`   Local backup: ${localBackupPath}`);
  } else {
    console.error(`❌ Backup failed: ${result.error}`);
  }

  return result;
}

/**
 * Download a backup from S3
 * @param s3Key - S3 object key
 * @param destPath - Local destination path
 * @returns Success status
 */
export async function downloadBackupFromS3(
  s3Key: string,
  destPath: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const bucketName = process.env.S3_BACKUP_BUCKET;

    if (!bucketName) {
      return {
        success: false,
        error: 'S3_BACKUP_BUCKET not configured',
      };
    }

    const client = getS3Client();

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    const response = await client.send(command);

    if (!response.Body) {
      return {
        success: false,
        error: 'Empty response from S3',
      };
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const fileContent = Buffer.concat(chunks);

    // Ensure destination directory exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(destPath, fileContent);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error during S3 download',
    };
  }
}

/**
 * List all backups in S3
 * @param maxResults - Maximum number of results to return
 * @returns Array of backup keys with metadata
 */
export async function listS3Backups(maxResults = 100): Promise<
  Array<{
    key: string;
    lastModified: Date;
    size: number;
    url: string;
  }>
> {
  try {
    const bucketName = process.env.S3_BACKUP_BUCKET;

    if (!bucketName) {
      console.warn('S3_BACKUP_BUCKET not configured');
      return [];
    }

    const client = getS3Client();

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: 'backups/',
      MaxKeys: maxResults,
    });

    const response = await client.send(command);

    if (!response.Contents) {
      return [];
    }

    return response.Contents.filter((obj) => obj.Key)
      .map((obj) => ({
        key: obj.Key!,
        lastModified: obj.LastModified || new Date(),
        size: obj.Size || 0,
        url: `s3://${bucketName}/${obj.Key}`,
      }))
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  } catch (error) {
    console.error('Error listing S3 backups:', error);
    return [];
  }
}

/**
 * Restore configuration from an S3 backup
 * @param s3Key - The S3 key to restore from
 * @returns Success status
 */
export async function restoreFromS3Backup(
  s3Key: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const configPath = path.join(process.cwd(), 'data/config_store/config.csv');

    // Backup current config before restoring
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(
      process.cwd(),
      'data/config_store/backups',
      `config-pre-restore-${timestamp}.csv`,
    );

    fs.copyFileSync(configPath, backupPath);
    console.log(`📋 Created pre-restore backup: ${backupPath}`);

    // Download from S3 and replace current config
    const result = await downloadBackupFromS3(s3Key, configPath);

    if (result.success) {
      console.log(`✅ Successfully restored from ${s3Key}`);
      return { success: true };
    } else {
      // Restore the backup if download failed
      fs.copyFileSync(backupPath, configPath);
      console.error(`❌ Restore failed, reverted to previous state`);
      return result;
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown error during restore',
    };
  }
}

/**
 * Verify backup integrity
 * @param localPath - Path to local file
 * @param s3Key - S3 key to compare against
 * @returns Verification result
 */
export async function verifyBackupIntegrity(
  localPath: string,
  s3Key: string,
): Promise<{
  valid: boolean;
  localChecksum?: string;
  s3Checksum?: string;
  error?: string;
}> {
  try {
    const bucketName = process.env.S3_BACKUP_BUCKET;

    if (!bucketName) {
      return { valid: false, error: 'S3_BACKUP_BUCKET not configured' };
    }

    const localChecksum = calculateChecksum(localPath);

    const client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    const response = await client.send(command);
    const s3Checksum = response.Metadata?.checksum;

    if (!s3Checksum) {
      return {
        valid: false,
        localChecksum,
        error: 'S3 object missing checksum metadata',
      };
    }

    return {
      valid: localChecksum === s3Checksum,
      localChecksum,
      s3Checksum,
    };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error during verification',
    };
  }
}
