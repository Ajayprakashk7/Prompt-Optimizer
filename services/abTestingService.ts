// Advanced A/B Testing Service
// Scientific comparison of prompt variations with statistical analysis

import {
  ABTest,
  PromptVariant,
  TestExecution,
  TestResults,
  VariantMetrics,
  ABTestManager,
  CreateTestConfig,
  ExecutionContext,
  VariantComparison,
  StatisticalAnalyzer,
  SignificanceResult,
  TTestResult
} from '../types/abTesting';
import { promptQualityScorer } from '../utils/promptQualityScorer';
import { optimizePrompt } from './geminiService';
import { storage } from './storageService';

export class ABTestingService implements ABTestManager, StatisticalAnalyzer {
  private static instance: ABTestingService;
  private activeTests = new Map<string, ABTest>();
  private testExecutions = new Map<string, TestExecution[]>();

  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }

  // Test Management
  async createTest(config: CreateTestConfig): Promise<ABTest> {
    const testId = this.generateTestId();
    
    // Create control variant
    const controlVariant: PromptVariant = {
      id: this.generateVariantId(),
      name: config.controlVariant.name,
      prompt: config.controlVariant.prompt,
      description: config.controlVariant.description,
      weight: 50, // Default 50% traffic
      isControl: true,
      metrics: this.createEmptyMetrics(),
      createdAt: new Date(),
      createdBy: 'user',
      tags: config.controlVariant.tags || []
    };

    // Create test variants
    const testVariants: PromptVariant[] = config.testVariants.map(variant => ({
      id: this.generateVariantId(),
      name: variant.name,
      prompt: variant.prompt,
      description: variant.description,
      weight: Math.floor(50 / config.testVariants.length), // Distribute remaining 50%
      isControl: false,
      metrics: this.createEmptyMetrics(),
      createdAt: new Date(),
      createdBy: 'user',
      tags: variant.tags || []
    }));

    const test: ABTest = {
      id: testId,
      name: config.name,
      description: config.description,
      hypothesis: config.hypothesis,
      variants: [controlVariant, ...testVariants],
      trafficSplit: this.calculateTrafficSplit([controlVariant, ...testVariants]),
      startDate: new Date(),
      targetSampleSize: config.targetSampleSize,
      minimumDetectableEffect: config.minimumDetectableEffect,
      confidenceLevel: config.confidenceLevel,
      status: 'draft',
      currentSampleSize: 0,
      results: this.createEmptyResults(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user',
      tags: []
    };

    this.activeTests.set(testId, test);
    this.testExecutions.set(testId, []);
    
    // Persist to storage
    await this.saveTest(test);
    
    return test;
  }

  async startTest(testId: string): Promise<void> {
    const test = this.activeTests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);
    
    test.status = 'running';
    test.startDate = new Date();
    test.updatedAt = new Date();
    
    await this.saveTest(test);
  }

  async pauseTest(testId: string): Promise<void> {
    const test = this.activeTests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);
    
    test.status = 'paused';
    test.updatedAt = new Date();
    
    await this.saveTest(test);
  }

  async stopTest(testId: string): Promise<TestResults> {
    const test = this.activeTests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);
    
    test.status = 'completed';
    test.endDate = new Date();
    test.updatedAt = new Date();
    
    // Calculate final results
    const results = await this.calculateTestResults(test);
    test.results = results;
    
    await this.saveTest(test);
    
    return results;
  }

  // Variant Management
  async addVariant(testId: string, variantConfig: any): Promise<PromptVariant> {
    const test = this.activeTests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);
    
    const variant: PromptVariant = {
      id: this.generateVariantId(),
      ...variantConfig,
      isControl: false,
      metrics: this.createEmptyMetrics(),
      createdAt: new Date()
    };
    
    test.variants.push(variant);
    test.trafficSplit = this.calculateTrafficSplit(test.variants);
    test.updatedAt = new Date();
    
    await this.saveTest(test);
    
    return variant;
  }

  async updateVariant(testId: string, variantId: string, updates: Partial<PromptVariant>): Promise<PromptVariant> {
    const test = this.activeTests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);
    
    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) throw new Error(`Variant ${variantId} not found`);
    
    Object.assign(variant, updates);
    test.updatedAt = new Date();
    
    await this.saveTest(test);
    
    return variant;
  }

  async removeVariant(testId: string, variantId: string): Promise<void> {
    const test = this.activeTests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);
    
    test.variants = test.variants.filter(v => v.id !== variantId);
    test.trafficSplit = this.calculateTrafficSplit(test.variants);
    test.updatedAt = new Date();
    
    await this.saveTest(test);
  }

  // Test Execution
  async executeVariant(
    testId: string, 
    inputData: Record<string, any>, 
    context?: ExecutionContext
  ): Promise<TestExecution> {
    const test = this.activeTests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);
    
    if (test.status !== 'running') {
      throw new Error(`Test ${testId} is not running`);
    }

    // Select variant based on traffic split
    const selectedVariant = this.selectVariant(test);
    
    const execution: TestExecution = {
      id: this.generateExecutionId(),
      testId,
      variantId: selectedVariant.id,
      timestamp: new Date(),
      sessionId: context?.sessionId || this.generateSessionId(),
      inputData,
      outputData: '',
      executionTime: 0,
      qualityScore: 0,
      userId: context?.userId,
      userAgent: context?.userAgent,
      location: context?.location,
      deviceType: context?.deviceType
    };

    try {
      const startTime = Date.now();
      
      // Execute the prompt
      const result = await this.executePrompt(selectedVariant.prompt, inputData);
      execution.outputData = result;
      execution.executionTime = Date.now() - startTime;
      
      // Calculate quality score
      const qualityScore = promptQualityScorer.scorePrompt(result);
      execution.qualityScore = qualityScore.overallScore;
      
      // Update variant metrics
      await this.updateVariantMetrics(selectedVariant, execution);
      
      // Store execution
      const executions = this.testExecutions.get(testId) || [];
      executions.push(execution);
      this.testExecutions.set(testId, executions);
      
      // Update test sample size
      test.currentSampleSize++;
      
      // Check if test should auto-complete
      if (test.currentSampleSize >= test.targetSampleSize) {
        await this.stopTest(testId);
      }
      
    } catch (error) {
      execution.outputData = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      execution.qualityScore = 0;
    }

    return execution;
  }

  // Analysis and Results
  async getResults(testId: string): Promise<TestResults> {
    const test = this.activeTests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);
    
    return await this.calculateTestResults(test);
  }

  async getVariantMetrics(testId: string, variantId: string): Promise<VariantMetrics> {
    const test = this.activeTests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);
    
    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) throw new Error(`Variant ${variantId} not found`);
    
    return variant.metrics;
  }

  // Statistical Analysis Implementation
  calculateSignificance(variantA: VariantMetrics, variantB: VariantMetrics): SignificanceResult {
    // Simple t-test implementation
    const meanA = variantA.averageQualityScore;
    const meanB = variantB.averageQualityScore;
    const nA = variantA.totalExecutions;
    const nB = variantB.totalExecutions;
    
    // Calculate pooled standard deviation (simplified)
    const pooledStd = Math.sqrt(((nA - 1) * 10 + (nB - 1) * 10) / (nA + nB - 2));
    const standardError = pooledStd * Math.sqrt(1/nA + 1/nB);
    
    const tStatistic = (meanA - meanB) / standardError;
    const degreesOfFreedom = nA + nB - 2;
    
    // Simplified p-value calculation (would use proper statistical library in production)
    const pValue = this.calculatePValue(Math.abs(tStatistic), degreesOfFreedom);
    
    const effectSize = (meanA - meanB) / pooledStd;
    const confidenceInterval = this.calculateConfidenceInterval([meanA, meanB], 95);
    
    return {
      pValue,
      isSignificant: pValue < 0.05,
      confidenceLevel: 95,
      effectSize,
      confidenceInterval
    };
  }

  calculateSampleSize(effect: number, power: number, alpha: number): number {
    // Simplified sample size calculation
    const zAlpha = this.getZScore(alpha / 2);
    const zBeta = this.getZScore(1 - power);
    
    return Math.ceil(2 * Math.pow(zAlpha + zBeta, 2) / Math.pow(effect, 2));
  }

  calculateConfidenceInterval(data: number[], confidence: number): [number, number] {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const std = Math.sqrt(data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (data.length - 1));
    const margin = this.getZScore((100 - confidence) / 200) * (std / Math.sqrt(data.length));
    
    return [mean - margin, mean + margin];
  }

  performTTest(groupA: number[], groupB: number[]): TTestResult {
    const meanA = groupA.reduce((a, b) => a + b, 0) / groupA.length;
    const meanB = groupB.reduce((a, b) => a + b, 0) / groupB.length;
    
    const varA = groupA.reduce((a, b) => a + Math.pow(b - meanA, 2), 0) / (groupA.length - 1);
    const varB = groupB.reduce((a, b) => a + Math.pow(b - meanB, 2), 0) / (groupB.length - 1);
    
    const pooledVar = ((groupA.length - 1) * varA + (groupB.length - 1) * varB) / 
                     (groupA.length + groupB.length - 2);
    
    const standardError = Math.sqrt(pooledVar * (1/groupA.length + 1/groupB.length));
    const tStatistic = (meanA - meanB) / standardError;
    const degreesOfFreedom = groupA.length + groupB.length - 2;
    const pValue = this.calculatePValue(Math.abs(tStatistic), degreesOfFreedom);
    
    return {
      tStatistic,
      pValue,
      degreesOfFreedom,
      isSignificant: pValue < 0.05
    };
  }

  // Monitoring
  async getActiveTests(): Promise<ABTest[]> {
    return Array.from(this.activeTests.values()).filter(test => test.status === 'running');
  }

  async getTestHistory(): Promise<ABTest[]> {
    return Array.from(this.activeTests.values());
  }

  // Private helper methods
  private async executePrompt(prompt: string, inputData: Record<string, any>): Promise<string> {
    // Replace variables in prompt
    let processedPrompt = prompt;
    for (const [key, value] of Object.entries(inputData)) {
      processedPrompt = processedPrompt.replace(
        new RegExp(`{{${key}}}`, 'g'), 
        String(value)
      );
    }

    return await optimizePrompt(processedPrompt, 'Pro');
  }

  private selectVariant(test: ABTest): PromptVariant {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        return variant;
      }
    }
    
    return test.variants[0]; // Fallback to first variant
  }

  private calculateTrafficSplit(variants: PromptVariant[]): Record<string, number> {
    const split: Record<string, number> = {};
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    
    variants.forEach(variant => {
      split[variant.id] = (variant.weight / totalWeight) * 100;
    });
    
    return split;
  }

  private async updateVariantMetrics(variant: PromptVariant, execution: TestExecution): Promise<void> {
    const metrics = variant.metrics;
    
    metrics.totalExecutions++;
    if (execution.qualityScore > 0) {
      metrics.successfulExecutions++;
    } else {
      metrics.failedExecutions++;
    }
    
    // Update averages
    const totalQuality = metrics.averageQualityScore * (metrics.totalExecutions - 1) + execution.qualityScore;
    metrics.averageQualityScore = totalQuality / metrics.totalExecutions;
    
    const totalTime = metrics.averageExecutionTime * (metrics.totalExecutions - 1) + execution.executionTime;
    metrics.averageExecutionTime = totalTime / metrics.totalExecutions;
    
    // Update quality distribution
    const scoreRange = Math.floor(execution.qualityScore / 10) * 10;
    const rangeKey = `${scoreRange}-${scoreRange + 9}`;
    metrics.qualityScoreDistribution[rangeKey] = (metrics.qualityScoreDistribution[rangeKey] || 0) + 1;
  }

  private async calculateTestResults(test: ABTest): Promise<TestResults> {
    const executions = this.testExecutions.get(test.id) || [];
    const controlVariant = test.variants.find(v => v.isControl);
    
    if (!controlVariant) {
      throw new Error('No control variant found');
    }

    const variantComparison: VariantComparison[] = test.variants
      .filter(v => !v.isControl)
      .map(variant => {
        const significance = this.calculateSignificance(controlVariant.metrics, variant.metrics);
        
        return {
          variantId: variant.id,
          variantName: variant.name,
          relativeImprovement: ((variant.metrics.averageQualityScore - controlVariant.metrics.averageQualityScore) / controlVariant.metrics.averageQualityScore) * 100,
          absoluteImprovement: variant.metrics.averageQualityScore - controlVariant.metrics.averageQualityScore,
          confidenceInterval: significance.confidenceInterval,
          pValue: significance.pValue,
          isSignificant: significance.isSignificant,
          riskLevel: significance.isSignificant ? 'low' : 'medium',
          riskFactors: []
        };
      });

    const winner = variantComparison.find(v => v.isSignificant && v.relativeImprovement > 0);
    
    return {
      totalParticipants: executions.length,
      testDuration: test.endDate ? test.endDate.getTime() - test.startDate.getTime() : Date.now() - test.startDate.getTime(),
      variantComparison,
      statisticalSignificance: variantComparison.some(v => v.isSignificant),
      confidenceInterval: winner ? winner.confidenceInterval : [0, 0],
      effectSize: winner ? winner.relativeImprovement / 100 : 0,
      recommendation: winner ? 'implement_winner' : 'continue_testing',
      reasoning: winner ? `Variant ${winner.variantName} shows significant improvement` : 'No significant winner detected',
      nextSteps: winner ? ['Implement winning variant', 'Monitor performance'] : ['Continue testing', 'Increase sample size']
    };
  }

  private createEmptyMetrics(): VariantMetrics {
    return {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      averageQualityScore: 0,
      qualityScoreDistribution: {},
      userRatings: [],
      averageUserRating: 0,
      conversionRate: 0,
      engagementScore: 0,
      confidenceLevel: 0,
      pValue: 1,
      isStatisticallySignificant: false
    };
  }

  private createEmptyResults(): TestResults {
    return {
      totalParticipants: 0,
      testDuration: 0,
      variantComparison: [],
      statisticalSignificance: false,
      confidenceInterval: [0, 0],
      effectSize: 0,
      recommendation: 'continue_testing',
      reasoning: '',
      nextSteps: []
    };
  }

  private calculatePValue(tStat: number, df: number): number {
    // Simplified p-value calculation (would use proper statistical library)
    return Math.max(0.001, 1 / (1 + Math.abs(tStat)));
  }

  private getZScore(probability: number): number {
    // Simplified z-score calculation
    if (probability === 0.025) return 1.96;
    if (probability === 0.05) return 1.645;
    if (probability === 0.1) return 1.28;
    return 1.96; // Default to 95% confidence
  }

  private async saveTest(test: ABTest): Promise<void> {
    await storage.set(`ab_test_${test.id}`, test);
  }

  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateVariantId(): string {
    return `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const abTestingService = ABTestingService.getInstance();
