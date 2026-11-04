/**
 * Real-Time Project Metrics & Disk / Tokenizer Telemetry Types for Sportavand
 * Synchronized every 1 second with GET /api/status in server.ts
 */

export interface ScannedFileItem {
  path: string;
  filename: string;
  category: 'docs' | 'data_index' | 'source_code';
  type: 'markdown' | 'typescript' | 'php' | 'json' | 'css' | 'html' | 'bundle' | 'other';
  sizeBytes: number;
  sizeKB: number;
  lines: number;
  tokens: number;
  enabled: boolean;
}

export interface ServerTelemetryResponse {
  appName: string;
  appDescription: string;
  serverTime: string;
  totalStatusPolls: number;
  tokenizerEngine: string;
  geminiCountTokensVerified: boolean;
  geminiCalibrationRatio: number;
  memory: {
    heapUsedMB: number;
    rssMB: number;
  };
  capacity: {
    maxTokens: number;
    totalActiveTokens: number;
    freeTokens: number;
    percentUsed: number;
    freePercent: number;
    draftTokens: number;
    draftBytes: number;
    draftChars: number;
    statusLevel: 'optimal' | 'warning' | 'critical';
    statusLabel: string;
  };
  categories: {
    docs: {
      activeCount: number;
      totalCount: number;
      activeBytes: number;
      activeKB: number;
      totalDiskKB: number;
      tokens: number;
      files: ScannedFileItem[];
    };
    dataIndex: {
      fileCount: number;
      bytes: number;
      sizeKB: number;
      tokens: number;
      files: ScannedFileItem[];
    };
    sourceCode: {
      fileCount: number;
      bytes: number;
      sizeKB: number;
      tokens: number;
      files: ScannedFileItem[];
    };
    liveSession: {
      openFilesCount: number;
      sessionTrafficBytes: number;
      sessionTrafficKB: number;
      draftBytes: number;
      draftChars: number;
      draftTokens: number;
      totalBytes: number;
      totalKB: number;
      tokens: number;
    };
  };
  allScannedFiles: ScannedFileItem[];
}

export const INITIAL_TELEMETRY_STATE: ServerTelemetryResponse = {
  appName: 'اسپورتاوند | Sportavand — سامانه جامع مدیریت ورزش',
  appDescription:
    'اسپورتاوند سامانه‌ای ماژولار برای مدیریت هوشمند باشگاه‌ها، تیم‌ها، ورزشکاران، رویدادها و فرآیندهای ورزشی با ماژول تخصصی اسپورتاوند بسکتبال (Sportavand Basketball)',
  serverTime: new Date().toTimeString().split(' ')[0],
  totalStatusPolls: 1,
  tokenizerEngine:
    'شمارشگر رسمی Gemini API (countTokens ✓) / اسکنر زنده بایت دیسک و حافظه (Live UTF-8 Scanner)',
  geminiCountTokensVerified: true,
  geminiCalibrationRatio: 0.2941,
  memory: {
    heapUsedMB: 64.2,
    rssMB: 142.8,
  },
  capacity: {
    maxTokens: 1000000,
    totalActiveTokens: 325410,
    freeTokens: 674590,
    percentUsed: 32.54,
    freePercent: 67.46,
    draftTokens: 0,
    draftBytes: 0,
    draftChars: 0,
    statusLevel: 'optimal',
    statusLabel: 'سبز بهینه (ظرفیت کاملاً پایدار و آماده توسعه)',
  },
  categories: {
    docs: {
      activeCount: 6,
      totalCount: 6,
      activeBytes: 42500,
      activeKB: 41.5,
      totalDiskKB: 41.5,
      tokens: 12500,
      files: [
        {
          path: 'SPORTAVAND_BRAND.md',
          filename: 'SPORTAVAND_BRAND.md',
          category: 'docs',
          type: 'markdown',
          sizeBytes: 6200,
          sizeKB: 6.05,
          lines: 110,
          tokens: 1824,
          enabled: true,
        },
        {
          path: 'docs/UPGRADE_AND_MIGRATION.md',
          filename: 'UPGRADE_AND_MIGRATION.md',
          category: 'docs',
          type: 'markdown',
          sizeBytes: 9800,
          sizeKB: 9.57,
          lines: 165,
          tokens: 2882,
          enabled: true,
        },
        {
          path: 'docs/ProjectKnowledge.md',
          filename: 'ProjectKnowledge.md',
          category: 'docs',
          type: 'markdown',
          sizeBytes: 10500,
          sizeKB: 10.25,
          lines: 120,
          tokens: 3088,
          enabled: true,
        },
        {
          path: 'wordpress-plugin/sportavand/readme.txt',
          filename: 'readme.txt',
          category: 'docs',
          type: 'markdown',
          sizeBytes: 5100,
          sizeKB: 4.98,
          lines: 68,
          tokens: 1500,
          enabled: true,
        },
        {
          path: 'metadata.json',
          filename: 'metadata.json',
          category: 'docs',
          type: 'json',
          sizeBytes: 420,
          sizeKB: 0.41,
          lines: 7,
          tokens: 124,
          enabled: true,
        },
        {
          path: '.aistudio/artifacts/brain/e27ce1f9-fadb-4734-8fd4-e96f74ec5fe6/implementation_plan.md',
          filename: 'implementation_plan.md',
          category: 'docs',
          type: 'markdown',
          sizeBytes: 8874,
          sizeKB: 8.67,
          lines: 82,
          tokens: 2610,
          enabled: true,
        },
      ],
    },
    dataIndex: {
      fileCount: 10,
      bytes: 720450,
      sizeKB: 703.6,
      tokens: 211897,
      files: [],
    },
    sourceCode: {
      fileCount: 11,
      bytes: 225600,
      sizeKB: 220.3,
      tokens: 66353,
      files: [],
    },
    liveSession: {
      openFilesCount: 5,
      sessionTrafficBytes: 24576,
      sessionTrafficKB: 24.0,
      draftBytes: 0,
      draftChars: 0,
      draftTokens: 0,
      totalBytes: 24576,
      totalKB: 24.0,
      tokens: 7229,
    },
  },
  allScannedFiles: [],
};
