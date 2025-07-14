// Advanced Prompt Chaining System Types
// Enables creation of sophisticated multi-step prompt workflows

export interface PromptStep {
  id: string;
  name: string;
  prompt: string;
  description?: string;
  order: number;
  
  // Dependencies and flow control
  dependencies: string[]; // IDs of steps that must complete first
  nextSteps: string[];    // IDs of steps to execute next
  fallbackStep?: string;  // ID of step to execute if this fails
  
  // Execution configuration
  maxRetries: number;
  timeout: number; // milliseconds
  
  // Input/Output handling
  inputVariables: PromptVariable[];
  outputVariables: PromptVariable[];
  
  // Validation and quality control
  validationRules: ValidationRule[];
  qualityThreshold: number; // 0-100, minimum quality score required
  
  // Execution state
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: string;
  error?: string;
  executionTime?: number;
  qualityScore?: number;
  retryCount: number;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface ValidationRule {
  id: string;
  name: string;
  type: 'length' | 'pattern' | 'quality' | 'custom';
  condition: string; // JavaScript expression or regex
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
}

export interface PromptChain {
  id: string;
  name: string;
  description: string;
  version: string;
  
  // Chain configuration
  steps: PromptStep[];
  globalVariables: PromptVariable[];
  
  // Execution settings
  parallelExecution: boolean;
  maxConcurrentSteps: number;
  totalTimeout: number; // milliseconds
  
  // Quality and monitoring
  qualityThreshold: number;
  monitoringEnabled: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  
  // Execution state
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  currentStep?: string;
  executionHistory: ChainExecution[];
}

export interface ChainExecution {
  id: string;
  chainId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  
  // Results and metrics
  stepResults: Record<string, StepResult>;
  totalExecutionTime: number;
  averageQualityScore: number;
  
  // Error handling
  errors: ChainError[];
  warnings: string[];
  
  // Input/Output
  inputData: Record<string, any>;
  outputData: Record<string, any>;
}

export interface StepResult {
  stepId: string;
  status: 'completed' | 'failed' | 'skipped';
  result?: string;
  error?: string;
  executionTime: number;
  qualityScore: number;
  retryCount: number;
  timestamp: Date;
}

export interface ChainError {
  stepId: string;
  type: 'validation' | 'execution' | 'timeout' | 'quality';
  message: string;
  details?: any;
  timestamp: Date;
  severity: 'error' | 'warning';
}

// Chain building and execution interfaces
export interface ChainBuilder {
  addStep(step: Omit<PromptStep, 'id' | 'status' | 'retryCount'>): ChainBuilder;
  addDependency(stepId: string, dependsOn: string): ChainBuilder;
  addVariable(variable: PromptVariable): ChainBuilder;
  setParallelExecution(enabled: boolean): ChainBuilder;
  setQualityThreshold(threshold: number): ChainBuilder;
  build(): PromptChain;
}

export interface ChainExecutor {
  execute(chain: PromptChain, inputData: Record<string, any>): Promise<ChainExecution>;
  pause(executionId: string): Promise<void>;
  resume(executionId: string): Promise<void>;
  cancel(executionId: string): Promise<void>;
  getStatus(executionId: string): Promise<ChainExecution>;
}

// Pre-built chain templates
export interface ChainTemplate {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'analysis' | 'development' | 'research' | 'creative';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number; // minutes
  
  // Template configuration
  chain: Omit<PromptChain, 'id' | 'createdAt' | 'updatedAt' | 'executionHistory'>;
  
  // Usage and ratings
  usageCount: number;
  averageRating: number;
  reviews: TemplateReview[];
}

export interface TemplateReview {
  userId: string;
  rating: number; // 1-5
  comment: string;
  timestamp: Date;
}

// Chain optimization and analysis
export interface ChainAnalytics {
  chainId: string;
  
  // Performance metrics
  averageExecutionTime: number;
  successRate: number;
  averageQualityScore: number;
  
  // Step analysis
  stepPerformance: Record<string, StepAnalytics>;
  bottlenecks: string[]; // Step IDs that are slowest
  
  // Quality insights
  qualityTrends: QualityTrend[];
  improvementSuggestions: string[];
  
  // Usage patterns
  popularPaths: string[][]; // Common step sequences
  failurePatterns: FailurePattern[];
}

export interface StepAnalytics {
  stepId: string;
  averageExecutionTime: number;
  successRate: number;
  averageQualityScore: number;
  retryRate: number;
  commonErrors: string[];
}

export interface QualityTrend {
  timestamp: Date;
  averageScore: number;
  stepScores: Record<string, number>;
}

export interface FailurePattern {
  pattern: string;
  frequency: number;
  affectedSteps: string[];
  suggestedFix: string;
}
