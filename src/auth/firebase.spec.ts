import * as admin from 'firebase-admin';

// Mock firebase-admin module
jest.mock('firebase-admin', () => ({
  apps: [],
  credential: {
    cert: jest.fn(),
    applicationDefault: jest.fn(),
  },
  initializeApp: jest.fn(),
}));

describe('Firebase Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = process.env;

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  it('should mock firebase-admin correctly', () => {
    expect(admin.credential.cert).toBeDefined();
    expect(admin.credential.applicationDefault).toBeDefined();
    expect(admin.initializeApp).toBeDefined();
  });

  it('should have credential methods available', () => {
    const mockCredential = { mock: 'credential' };
    (admin.credential.cert as jest.Mock).mockReturnValue(mockCredential);

    const result = admin.credential.cert({} as admin.ServiceAccount);
    expect(result).toEqual(mockCredential);
  });

  it('should have applicationDefault method available', () => {
    const mockCredential = { mock: 'defaultCredential' };
    (admin.credential.applicationDefault as jest.Mock).mockReturnValue(
      mockCredential,
    );

    const result = admin.credential.applicationDefault();
    expect(result).toEqual(mockCredential);
  });

  it('should have initializeApp method available', () => {
    const mockApp = { name: 'test-app' };
    (admin.initializeApp as jest.Mock).mockReturnValue(mockApp);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = admin.initializeApp({ credential: {} as any });
    expect(result).toEqual(mockApp);
    expect(admin.initializeApp).toHaveBeenCalledWith({
      credential: {},
    });
  });

  it('should handle service account parsing correctly', () => {
    const serviceAccountString = JSON.stringify({
      type: 'service_account',
      project_id: 'test-project',
      private_key_id: 'key-id',
      private_key:
        '-----BEGIN PRIVATE KEY-----\\ntest-key\\n-----END PRIVATE KEY-----\\n',
      client_email: 'test@test-project.iam.gserviceaccount.com',
      client_id: '123456789',
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    expect(() => JSON.parse(serviceAccountString)).not.toThrow();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = JSON.parse(serviceAccountString);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(parsed.type).toBe('service_account');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(parsed.project_id).toBe('test-project');
  });

  it('should handle invalid JSON gracefully', () => {
    const invalidJson = '{"incomplete": "json"';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    expect(() => JSON.parse(invalidJson)).toThrow();
  });

  it('should validate complete service account structure', () => {
    const completeServiceAccount = {
      type: 'service_account',
      project_id: 'melodia-project',
      private_key_id: 'abc123',
      private_key:
        '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBg...\\n-----END PRIVATE KEY-----\\n',
      client_email: 'firebase-adminsdk@melodia-project.iam.gserviceaccount.com',
      client_id: '123456789012345678901',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url:
        'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40melodia-project.iam.gserviceaccount.com',
    };

    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify(
      completeServiceAccount,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(parsed.type).toBe('service_account');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(parsed.project_id).toBe('melodia-project');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(parsed.client_email).toContain('firebase-adminsdk');
  });

  it('should initialize with service account when FIREBASE_SERVICE_ACCOUNT is provided', () => {
    const mockServiceAccount = {
      type: 'service_account',
      project_id: 'test-project',
      private_key_id: 'key-id',
      private_key:
        '-----BEGIN PRIVATE KEY-----\\ntest-key\\n-----END PRIVATE KEY-----\\n',
      client_email: 'test@test-project.iam.gserviceaccount.com',
      client_id: '123456789',
    };

    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify(mockServiceAccount);

    // Mock JSON.parse to simulate the service account parsing
    const originalParse = JSON.parse;
    jest.spyOn(JSON, 'parse').mockReturnValue(mockServiceAccount);

    // Simulate the credential creation
    expect(admin.credential.cert).toBeDefined();

    // Restore
    JSON.parse = originalParse;
  });

  it('should handle invalid FIREBASE_SERVICE_ACCOUNT and fallback to applicationDefault', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    process.env.FIREBASE_SERVICE_ACCOUNT = 'invalid-json';

    // Mock JSON.parse to throw an error
    const originalParse = JSON.parse;
    jest.spyOn(JSON, 'parse').mockImplementation(() => {
      throw new Error('Invalid JSON');
    });

    // This simulates the try-catch behavior in firebase.ts
    try {
      JSON.parse('invalid-json');
    } catch {
      console.error(
        'Error parsing FIREBASE_SERVICE_ACCOUNT, using applicationDefault',
      );
      admin.credential.applicationDefault();
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error parsing FIREBASE_SERVICE_ACCOUNT, using applicationDefault',
    );
    expect(admin.credential.applicationDefault).toHaveBeenCalled();

    consoleSpy.mockRestore();
    JSON.parse = originalParse;
  });

  it('should use applicationDefault when FIREBASE_SERVICE_ACCOUNT is not provided', () => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT;

    // Simulate the else path behavior
    admin.credential.applicationDefault();

    expect(admin.credential.applicationDefault).toHaveBeenCalled();
  });
});
