// A/B Testing Framework Types
// Enables scientific comparison of prompt variations

export interface PromptVariant {
  id: string;
  name: string;
  prompt: string;
  description?: string;
  
  // Configuration
  weight: number; // 0-100, percentage of traffic to receive
  isControl: boolean; // Is this the control/baseline variant?
  
  // Performance metrics
  metrics: VariantMetrics;
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  tags: string[];
}

export interface VariantMetrics {
  // Execution metrics
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  
  // Quality metrics
  averageQualityScore: number;
  qualityScoreDistribution: Record<string, number>; // score range -> count
  
  // User satisfaction
  userRatings: number[]; // 1-5 star ratings
  averageUserRating: number;
  
  // Business metrics
  conversionRate: number; // If applicable
  engagementScore: number;
  
  // Statistical significance
  confidenceLevel: number; // 0-100
  pValue: number;
  isStatisticallySignificant: boolean;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  hypothesis: string; // What we're testing
  
  // Test configuration
  variants: PromptVariant[];
  trafficSplit: Record<string, number>; // variant ID -> percentage
  
  // Test parameters
  startDate: Date;
  endDate?: Date;
  targetSampleSize: number;
  minimumDetectableEffect: number; // Minimum improvement to detect
  confidenceLevel: number; // 90, 95, 99
  
  // Test state
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  currentSampleSize: number;
  
  // Results
  winner?: string; // Variant ID of the winning variant
  results: TestResults;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
}

export interface TestResults {
  // Overall test metrics
  totalParticipants: number;
  testDuration: number; // milliseconds
  
  // Variant comparison
  variantComparison: VariantComparison[];
  
  // Statistical analysis
  statisticalSignificance: boolean;
  confidenceInterval: [number, number];
  effectSize: number;
  
  // Recommendations
  recommendation: 'implement_winner' | 'continue_testing' | 'inconclusive' | 'no_significant_difference';
  reasoning: string;
  nextSteps: string[];
}

export interface VariantComparison {
  variantId: string;
  variantName: string;
  
  // Performance vs control
  relativeImprovement: number; // Percentage improvement over control
  absoluteImprovement: number; // Absolute difference
  
  // Statistical measures
  confidenceInterval: [number, number];
  pValue: number;
  isSignificant: boolean;
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
}

export interface TestExecution {
  id: string;
  testId: string;
  variantId: string;
  
  // Execution details
  timestamp: Date;
  userId?: string;
  sessionId: string;
  
  // Input/Output
  inputData: Record<string, any>;
  outputData: string;
  
  // Metrics
  executionTime: number;
  qualityScore: number;
  userRating?: number;
  
  // Context
  userAgent?: string;
  location?: string;
  deviceType?: string;
}

// A/B Testing Service Interfaces
export interface ABTestManager {
  createTest(config: CreateTestConfig): Promise<ABTest>;
  startTest(testId: string): Promise<void>;
  pauseTest(testId: string): Promise<void>;
  stopTest(testId: string): Promise<TestResults>;
  
  // Variant management
  addVariant(testId: string, variant: Omit<PromptVariant, 'id' | 'metrics' | 'createdAt'>): Promise<PromptVariant>;
  updateVariant(testId: string, variantId: string, updates: Partial<PromptVariant>): Promise<PromptVariant>;
  removeVariant(testId: string, variantId: string): Promise<void>;
  
  // Execution
  executeVariant(testId: string, inputData: Record<string, any>, context?: ExecutionContext): Promise<TestExecution>;
  
  // Analysis
  getResults(testId: string): Promise<TestResults>;
  getVariantMetrics(testId: string, variantId: string): Promise<VariantMetrics>;
  
  // Monitoring
  getActiveTests(): Promise<ABTest[]>;
  getTestHistory(): Promise<ABTest[]>;
}

export interface CreateTestConfig {
  name: string;
  description: string;
  hypothesis: string;
  
  // Initial variants
  controlVariant: Omit<PromptVariant, 'id' | 'metrics' | 'createdAt' | 'isControl'>;
  testVariants: Omit<PromptVariant, 'id' | 'metrics' | 'createdAt' | 'isControl'>[];
  
  // Test parameters
  targetSampleSize: number;
  minimumDetectableEffect: number;
  confidenceLevel: number;
  maxDuration?: number; // milliseconds
  
  // Traffic allocation
  trafficSplit?: Record<string, number>;
}

export interface ExecutionContext {
  userId?: string;
  sessionId: string;
  userAgent?: string;
  location?: string;
  deviceType?: string;
  customAttributes?: Record<string, any>;
}

// Statistical analysis interfaces
export interface StatisticalAnalyzer {
  calculateSignificance(variantA: VariantMetrics, variantB: VariantMetrics): SignificanceResult;
  calculateSampleSize(effect: number, power: number, alpha: number): number;
  calculateConfidenceInterval(data: number[], confidence: number): [number, number];
  performTTest(groupA: number[], groupB: number[]): TTestResult;
}

export interface SignificanceResult {
  pValue: number;
  isSignificant: boolean;
  confidenceLevel: number;
  effectSize: number;
  confidenceInterval: [number, number];
}

export interface TTestResult {
  tStatistic: number;
  pValue: number;
  degreesOfFreedom: number;
  isSignificant: boolean;
}

// Reporting and visualization
export interface TestReport {
  testId: string;
  testName: string;
  
  // Executive summary
  summary: {
    winner: string;
    improvement: number;
    confidence: number;
    recommendation: string;
  };
  
  // Detailed results
  variantPerformance: VariantPerformanceReport[];
  
  // Charts and visualizations
  charts: {
    conversionRates: ChartData;
    qualityScores: ChartData;
    executionTimes: ChartData;
    userRatings: ChartData;
  };
  
  // Statistical details
  statisticalAnalysis: {
    methodology: string;
    assumptions: string[];
    limitations: string[];
    recommendations: string[];
  };
}

export interface VariantPerformanceReport {
  variantId: string;
  variantName: string;
  
  // Key metrics
  sampleSize: number;
  conversionRate: number;
  averageQualityScore: number;
  averageExecutionTime: number;
  averageUserRating: number;
  
  // Comparison to control
  relativeImprovement: number;
  statisticalSignificance: boolean;
  confidenceInterval: [number, number];
}

export interface ChartData {
  type: 'line' | 'bar' | 'histogram' | 'scatter';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
    }[];
  };
}
