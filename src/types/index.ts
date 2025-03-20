export interface GCPConfig {
  projectId: string;
  authenticated: boolean;
  timestamp: string;
}

export interface AuthAnswers {
  projectId: string;
}

export interface GCPAuthService {
  authenticate(config: GCPConfig): Promise<void>;
} 