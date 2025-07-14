// Advanced Prompt Chaining Service
// Orchestrates complex multi-step prompt workflows

import { 
  PromptChain, 
  PromptStep, 
  ChainExecution, 
  StepResult, 
  ChainError,
  ChainBuilder,
  ChainExecutor 
} from '../types/promptChain';
import { promptQualityScorer } from '../utils/promptQualityScorer';
import { optimizePrompt } from './geminiService';

export class PromptChainService implements ChainBuilder, ChainExecutor {
  private static instance: PromptChainService;
  private activeExecutions = new Map<string, ChainExecution>();

  static getInstance(): PromptChainService {
    if (!PromptChainService.instance) {
      PromptChainService.instance = new PromptChainService();
    }
    return PromptChainService.instance;
  }

  // Chain Builder Implementation
  private currentChain: Partial<PromptChain> = {};

  addStep(step: Omit<PromptStep, 'id' | 'status' | 'retryCount'>): ChainBuilder {
    if (!this.currentChain.steps) this.currentChain.steps = [];
    
    const newStep: PromptStep = {
      ...step,
      id: this.generateStepId(),
      status: 'pending',
      retryCount: 0
    };
    
    this.currentChain.steps.push(newStep);
    return this;
  }

  addDependency(stepId: string, dependsOn: string): ChainBuilder {
    const step = this.currentChain.steps?.find(s => s.id === stepId);
    if (step) {
      if (!step.dependencies.includes(dependsOn)) {
        step.dependencies.push(dependsOn);
      }
    }
    return this;
  }

  addVariable(variable: any): ChainBuilder {
    if (!this.currentChain.globalVariables) this.currentChain.globalVariables = [];
    this.currentChain.globalVariables.push(variable);
    return this;
  }

  setParallelExecution(enabled: boolean): ChainBuilder {
    this.currentChain.parallelExecution = enabled;
    return this;
  }

  setQualityThreshold(threshold: number): ChainBuilder {
    this.currentChain.qualityThreshold = threshold;
    return this;
  }

  build(): PromptChain {
    const chain: PromptChain = {
      id: this.generateChainId(),
      name: this.currentChain.name || 'Untitled Chain',
      description: this.currentChain.description || '',
      version: '1.0.0',
      steps: this.currentChain.steps || [],
      globalVariables: this.currentChain.globalVariables || [],
      parallelExecution: this.currentChain.parallelExecution || false,
      maxConcurrentSteps: this.currentChain.maxConcurrentSteps || 3,
      totalTimeout: this.currentChain.totalTimeout || 300000, // 5 minutes
      qualityThreshold: this.currentChain.qualityThreshold || 70,
      monitoringEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user',
      tags: [],
      status: 'draft',
      executionHistory: []
    };

    // Reset builder state
    this.currentChain = {};
    
    return chain;
  }

  // Chain Executor Implementation
  async execute(chain: PromptChain, inputData: Record<string, any>): Promise<ChainExecution> {
    const execution: ChainExecution = {
      id: this.generateExecutionId(),
      chainId: chain.id,
      startTime: new Date(),
      status: 'running',
      stepResults: {},
      totalExecutionTime: 0,
      averageQualityScore: 0,
      errors: [],
      warnings: [],
      inputData,
      outputData: {}
    };

    this.activeExecutions.set(execution.id, execution);

    try {
      // Validate input data
      this.validateInputData(chain, inputData);

      // Execute steps based on dependencies
      if (chain.parallelExecution) {
        await this.executeParallel(chain, execution);
      } else {
        await this.executeSequential(chain, execution);
      }

      execution.status = 'completed';
      execution.endTime = new Date();
      execution.totalExecutionTime = execution.endTime.getTime() - execution.startTime.getTime();
      
      // Calculate average quality score
      const qualityScores = Object.values(execution.stepResults)
        .filter(result => result.qualityScore > 0)
        .map(result => result.qualityScore);
      
      execution.averageQualityScore = qualityScores.length > 0 
        ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length 
        : 0;

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errors.push({
        stepId: 'chain',
        type: 'execution',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        severity: 'error'
      });
    }

    return execution;
  }

  async pause(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution && execution.status === 'running') {
      // Implementation would pause ongoing steps
      console.log(`Pausing execution ${executionId}`);
    }
  }

  async resume(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      // Implementation would resume paused execution
      console.log(`Resuming execution ${executionId}`);
    }
  }

  async cancel(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      execution.status = 'cancelled';
      execution.endTime = new Date();
      this.activeExecutions.delete(executionId);
    }
  }

  async getStatus(executionId: string): Promise<ChainExecution> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }
    return execution;
  }

  // Private helper methods
  private async executeSequential(chain: PromptChain, execution: ChainExecution): Promise<void> {
    const sortedSteps = this.topologicalSort(chain.steps);
    
    for (const step of sortedSteps) {
      if (execution.status === 'cancelled') break;
      
      await this.executeStep(step, chain, execution);
    }
  }

  private async executeParallel(chain: PromptChain, execution: ChainExecution): Promise<void> {
    const stepGroups = this.groupStepsByDependencies(chain.steps);
    
    for (const group of stepGroups) {
      if (execution.status === 'cancelled') break;
      
      const promises = group.map(step => this.executeStep(step, chain, execution));
      await Promise.all(promises);
    }
  }

  private async executeStep(
    step: PromptStep, 
    chain: PromptChain, 
    execution: ChainExecution
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check dependencies
      if (!this.areDependenciesMet(step, execution)) {
        throw new Error(`Dependencies not met for step ${step.id}`);
      }

      // Prepare step input
      const stepInput = this.prepareStepInput(step, execution);
      
      // Execute the prompt
      const result = await this.executePrompt(step.prompt, stepInput);
      
      // Validate result
      const qualityScore = await this.validateStepResult(step, result);
      
      if (qualityScore < step.qualityThreshold) {
        throw new Error(`Quality threshold not met: ${qualityScore} < ${step.qualityThreshold}`);
      }

      // Store result
      const stepResult: StepResult = {
        stepId: step.id,
        status: 'completed',
        result,
        executionTime: Date.now() - startTime,
        qualityScore,
        retryCount: step.retryCount,
        timestamp: new Date()
      };

      execution.stepResults[step.id] = stepResult;
      step.status = 'completed';
      step.result = result;
      step.qualityScore = qualityScore;

    } catch (error) {
      const stepResult: StepResult = {
        stepId: step.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        qualityScore: 0,
        retryCount: step.retryCount,
        timestamp: new Date()
      };

      execution.stepResults[step.id] = stepResult;
      step.status = 'failed';
      step.error = stepResult.error;

      // Add to execution errors
      execution.errors.push({
        stepId: step.id,
        type: 'execution',
        message: stepResult.error || 'Step execution failed',
        timestamp: new Date(),
        severity: 'error'
      });

      // Handle retries
      if (step.retryCount < step.maxRetries) {
        step.retryCount++;
        step.status = 'pending';
        await this.executeStep(step, chain, execution);
      }
    }
  }

  private async executePrompt(prompt: string, input: Record<string, any>): Promise<string> {
    // Replace variables in prompt
    let processedPrompt = prompt;
    for (const [key, value] of Object.entries(input)) {
      processedPrompt = processedPrompt.replace(
        new RegExp(`{{${key}}}`, 'g'), 
        String(value)
      );
    }

    // Execute using the existing gemini service
    return await optimizePrompt(processedPrompt, 'Pro');
  }

  private async validateStepResult(step: PromptStep, result: string): Promise<number> {
    // Use the quality scorer to evaluate the result
    const qualityScore = promptQualityScorer.scorePrompt(result);
    return qualityScore.overallScore;
  }

  private validateInputData(chain: PromptChain, inputData: Record<string, any>): void {
    for (const variable of chain.globalVariables) {
      if (variable.required && !(variable.name in inputData)) {
        throw new Error(`Required variable '${variable.name}' is missing`);
      }
    }
  }

  private areDependenciesMet(step: PromptStep, execution: ChainExecution): boolean {
    return step.dependencies.every(depId => {
      const depResult = execution.stepResults[depId];
      return depResult && depResult.status === 'completed';
    });
  }

  private prepareStepInput(step: PromptStep, execution: ChainExecution): Record<string, any> {
    const input: Record<string, any> = { ...execution.inputData };
    
    // Add outputs from dependency steps
    for (const depId of step.dependencies) {
      const depResult = execution.stepResults[depId];
      if (depResult && depResult.result) {
        input[`step_${depId}_output`] = depResult.result;
      }
    }
    
    return input;
  }

  private topologicalSort(steps: PromptStep[]): PromptStep[] {
    // Simple topological sort implementation
    const visited = new Set<string>();
    const result: PromptStep[] = [];
    
    const visit = (step: PromptStep) => {
      if (visited.has(step.id)) return;
      visited.add(step.id);
      
      // Visit dependencies first
      for (const depId of step.dependencies) {
        const depStep = steps.find(s => s.id === depId);
        if (depStep) visit(depStep);
      }
      
      result.push(step);
    };
    
    for (const step of steps) {
      visit(step);
    }
    
    return result;
  }

  private groupStepsByDependencies(steps: PromptStep[]): PromptStep[][] {
    // Group steps that can be executed in parallel
    const groups: PromptStep[][] = [];
    const processed = new Set<string>();
    
    while (processed.size < steps.length) {
      const currentGroup = steps.filter(step => 
        !processed.has(step.id) && 
        step.dependencies.every(depId => processed.has(depId))
      );
      
      if (currentGroup.length === 0) break; // Circular dependency
      
      groups.push(currentGroup);
      currentGroup.forEach(step => processed.add(step.id));
    }
    
    return groups;
  }

  private generateChainId(): string {
    return `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const promptChainService = PromptChainService.getInstance();
