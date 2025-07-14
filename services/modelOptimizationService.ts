// Model-Specific Optimization Service
// Optimizes prompts for different AI models (GPT-4, Claude, Gemini, etc.)

export interface ModelConfig {
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'other';
  maxTokens: number;
  contextWindow: number;
  
  // Model characteristics
  strengths: string[];
  weaknesses: string[];
  preferredFormat: 'markdown' | 'json' | 'xml' | 'plain';
  
  // Optimization settings
  temperature: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  
  // Prompt engineering preferences
  systemPromptStyle: 'detailed' | 'concise' | 'conversational' | 'technical';
  reasoningStyle: 'chain_of_thought' | 'tree_of_thought' | 'direct' | 'step_by_step';
  examplePreference: 'few_shot' | 'zero_shot' | 'one_shot';
  
  // Special features
  supportsSystemPrompts: boolean;
  supportsJsonMode: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
  supportsCodeExecution: boolean;
}

export interface OptimizationStrategy {
  modelName: string;
  promptTransformations: PromptTransformation[];
  formatOptimizations: FormatOptimization[];
  contextOptimizations: ContextOptimization[];
  qualityEnhancements: QualityEnhancement[];
}

export interface PromptTransformation {
  name: string;
  description: string;
  apply: (prompt: string) => string;
  priority: number; // 1-10, higher = more important
}

export interface FormatOptimization {
  name: string;
  targetFormat: string;
  transform: (content: string) => string;
}

export interface ContextOptimization {
  name: string;
  description: string;
  optimize: (prompt: string, context: any) => string;
}

export interface QualityEnhancement {
  name: string;
  description: string;
  enhance: (prompt: string) => string;
}

export class ModelOptimizationService {
  private static instance: ModelOptimizationService;
  private modelConfigs = new Map<string, ModelConfig>();
  private optimizationStrategies = new Map<string, OptimizationStrategy>();

  static getInstance(): ModelOptimizationService {
    if (!ModelOptimizationService.instance) {
      ModelOptimizationService.instance = new ModelOptimizationService();
      ModelOptimizationService.instance.initializeModelConfigs();
    }
    return ModelOptimizationService.instance;
  }

  // Main optimization method
  optimizeForModel(prompt: string, modelName: string, context?: any): string {
    const config = this.modelConfigs.get(modelName);
    if (!config) {
      console.warn(`No configuration found for model ${modelName}, using default optimization`);
      return this.applyDefaultOptimizations(prompt);
    }

    const strategy = this.optimizationStrategies.get(modelName);
    if (!strategy) {
      return this.createBasicOptimization(prompt, config);
    }

    return this.applyOptimizationStrategy(prompt, strategy, config, context);
  }

  private applyOptimizationStrategy(
    prompt: string, 
    strategy: OptimizationStrategy, 
    config: ModelConfig,
    context?: any
  ): string {
    let optimizedPrompt = prompt;

    // Apply prompt transformations in priority order
    const sortedTransformations = strategy.promptTransformations
      .sort((a, b) => b.priority - a.priority);

    for (const transformation of sortedTransformations) {
      optimizedPrompt = transformation.apply(optimizedPrompt);
    }

    // Apply format optimizations
    for (const formatOpt of strategy.formatOptimizations) {
      optimizedPrompt = formatOpt.transform(optimizedPrompt);
    }

    // Apply context optimizations
    if (context) {
      for (const contextOpt of strategy.contextOptimizations) {
        optimizedPrompt = contextOpt.optimize(optimizedPrompt, context);
      }
    }

    // Apply quality enhancements
    for (const enhancement of strategy.qualityEnhancements) {
      optimizedPrompt = enhancement.enhance(optimizedPrompt);
    }

    return optimizedPrompt;
  }

  private createBasicOptimization(prompt: string, config: ModelConfig): string {
    let optimized = prompt;

    // Apply basic model-specific optimizations
    if (config.preferredFormat === 'markdown') {
      optimized = this.ensureMarkdownFormat(optimized);
    }

    if (config.reasoningStyle === 'chain_of_thought') {
      optimized = this.addChainOfThoughtPrompting(optimized);
    }

    if (config.systemPromptStyle === 'detailed') {
      optimized = this.addDetailedInstructions(optimized);
    }

    return optimized;
  }

  private applyDefaultOptimizations(prompt: string): string {
    // Basic optimizations that work well across models
    let optimized = prompt;
    
    // Ensure clear structure
    if (!optimized.includes('**') && !optimized.includes('#')) {
      optimized = this.addBasicStructure(optimized);
    }

    // Add basic reasoning prompt
    if (!optimized.toLowerCase().includes('step by step')) {
      optimized += '\n\nThink through this step by step.';
    }

    return optimized;
  }

  // Model configuration initialization
  private initializeModelConfigs(): void {
    // GPT-4 Configuration
    this.modelConfigs.set('gpt-4', {
      name: 'GPT-4',
      provider: 'openai',
      maxTokens: 8192,
      contextWindow: 128000,
      strengths: ['reasoning', 'code_generation', 'analysis', 'creative_writing'],
      weaknesses: ['very_recent_events', 'real_time_data'],
      preferredFormat: 'markdown',
      temperature: 0.7,
      systemPromptStyle: 'detailed',
      reasoningStyle: 'chain_of_thought',
      examplePreference: 'few_shot',
      supportsSystemPrompts: true,
      supportsJsonMode: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsCodeExecution: false
    });

    // Claude 3 Configuration
    this.modelConfigs.set('claude-3', {
      name: 'Claude 3',
      provider: 'anthropic',
      maxTokens: 4096,
      contextWindow: 200000,
      strengths: ['analysis', 'reasoning', 'safety', 'long_context'],
      weaknesses: ['code_execution', 'real_time_data'],
      preferredFormat: 'markdown',
      temperature: 0.5,
      systemPromptStyle: 'conversational',
      reasoningStyle: 'step_by_step',
      examplePreference: 'few_shot',
      supportsSystemPrompts: true,
      supportsJsonMode: false,
      supportsFunctionCalling: false,
      supportsVision: true,
      supportsCodeExecution: false
    });

    // Gemini Pro Configuration
    this.modelConfigs.set('gemini-pro', {
      name: 'Gemini Pro',
      provider: 'google',
      maxTokens: 32768,
      contextWindow: 1000000,
      strengths: ['multimodal', 'long_context', 'reasoning', 'code_generation'],
      weaknesses: ['consistency', 'following_complex_instructions'],
      preferredFormat: 'json',
      temperature: 0.6,
      systemPromptStyle: 'technical',
      reasoningStyle: 'tree_of_thought',
      examplePreference: 'one_shot',
      supportsSystemPrompts: false,
      supportsJsonMode: true,
      supportsFunctionCalling: true,
      supportsVision: true,
      supportsCodeExecution: true
    });

    // Initialize optimization strategies
    this.initializeOptimizationStrategies();
  }

  private initializeOptimizationStrategies(): void {
    // GPT-4 Optimization Strategy
    this.optimizationStrategies.set('gpt-4', {
      modelName: 'gpt-4',
      promptTransformations: [
        {
          name: 'Add System Context',
          description: 'Leverage GPT-4\'s strong system prompt support',
          priority: 9,
          apply: (prompt: string) => {
            if (!prompt.toLowerCase().includes('you are') && !prompt.toLowerCase().includes('act as')) {
              return `You are an expert AI assistant. ${prompt}`;
            }
            return prompt;
          }
        },
        {
          name: 'Enhance Reasoning',
          description: 'Add chain-of-thought prompting for better reasoning',
          priority: 8,
          apply: (prompt: string) => {
            if (!prompt.toLowerCase().includes('step by step') && !prompt.toLowerCase().includes('think through')) {
              return `${prompt}\n\nLet's think through this step by step:`;
            }
            return prompt;
          }
        },
        {
          name: 'Structure for Clarity',
          description: 'Use markdown structure that GPT-4 handles well',
          priority: 7,
          apply: (prompt: string) => this.ensureMarkdownFormat(prompt)
        }
      ],
      formatOptimizations: [
        {
          name: 'Markdown Enhancement',
          targetFormat: 'markdown',
          transform: (content: string) => this.enhanceMarkdownStructure(content)
        }
      ],
      contextOptimizations: [
        {
          name: 'Context Length Optimization',
          description: 'Optimize for GPT-4\'s context window',
          optimize: (prompt: string, context: any) => {
            return this.optimizeContextLength(prompt, 8192);
          }
        }
      ],
      qualityEnhancements: [
        {
          name: 'Add Validation',
          description: 'Add self-validation for better quality',
          enhance: (prompt: string) => {
            return `${prompt}\n\nBefore responding, please validate your answer for accuracy and completeness.`;
          }
        }
      ]
    });

    // Claude 3 Optimization Strategy
    this.optimizationStrategies.set('claude-3', {
      modelName: 'claude-3',
      promptTransformations: [
        {
          name: 'Conversational Tone',
          description: 'Use Claude\'s preferred conversational style',
          priority: 9,
          apply: (prompt: string) => {
            return `I need your help with the following task. ${prompt}`;
          }
        },
        {
          name: 'Clear Instructions',
          description: 'Claude works best with very clear, explicit instructions',
          priority: 8,
          apply: (prompt: string) => {
            return `${prompt}\n\nPlease be thorough and systematic in your response.`;
          }
        }
      ],
      formatOptimizations: [
        {
          name: 'Long Context Optimization',
          targetFormat: 'structured',
          transform: (content: string) => this.optimizeForLongContext(content)
        }
      ],
      contextOptimizations: [
        {
          name: 'Context Preservation',
          description: 'Optimize for Claude\'s excellent long context handling',
          optimize: (prompt: string, context: any) => {
            return this.preserveContextDetails(prompt, context);
          }
        }
      ],
      qualityEnhancements: [
        {
          name: 'Safety and Accuracy',
          description: 'Leverage Claude\'s safety and accuracy strengths',
          enhance: (prompt: string) => {
            return `${prompt}\n\nPlease ensure your response is accurate, helpful, and considers potential risks or limitations.`;
          }
        }
      ]
    });

    // Gemini Pro Optimization Strategy
    this.optimizationStrategies.set('gemini-pro', {
      modelName: 'gemini-pro',
      promptTransformations: [
        {
          name: 'Technical Precision',
          description: 'Use Gemini\'s preference for technical, precise language',
          priority: 9,
          apply: (prompt: string) => {
            return `Execute the following task with technical precision: ${prompt}`;
          }
        },
        {
          name: 'Structured Output',
          description: 'Leverage Gemini\'s JSON mode capabilities',
          priority: 8,
          apply: (prompt: string) => {
            if (prompt.toLowerCase().includes('format') || prompt.toLowerCase().includes('structure')) {
              return `${prompt}\n\nProvide the response in a well-structured format.`;
            }
            return prompt;
          }
        }
      ],
      formatOptimizations: [
        {
          name: 'JSON Structure',
          targetFormat: 'json',
          transform: (content: string) => this.optimizeForJsonOutput(content)
        }
      ],
      contextOptimizations: [
        {
          name: 'Multimodal Context',
          description: 'Optimize for Gemini\'s multimodal capabilities',
          optimize: (prompt: string, context: any) => {
            return this.optimizeMultimodalContext(prompt, context);
          }
        }
      ],
      qualityEnhancements: [
        {
          name: 'Code Integration',
          description: 'Leverage Gemini\'s code execution capabilities',
          enhance: (prompt: string) => {
            if (prompt.toLowerCase().includes('code') || prompt.toLowerCase().includes('calculate')) {
              return `${prompt}\n\nIf calculations or code execution would be helpful, please use them to verify your response.`;
            }
            return prompt;
          }
        }
      ]
    });
  }

  // Helper methods for optimizations
  private ensureMarkdownFormat(prompt: string): string {
    if (!prompt.includes('#') && !prompt.includes('**')) {
      const lines = prompt.split('\n');
      if (lines.length > 1) {
        return `# Task\n\n${prompt}`;
      }
    }
    return prompt;
  }

  private addChainOfThoughtPrompting(prompt: string): string {
    if (!prompt.toLowerCase().includes('step by step')) {
      return `${prompt}\n\nLet's approach this step by step:`;
    }
    return prompt;
  }

  private addDetailedInstructions(prompt: string): string {
    return `${prompt}\n\nPlease provide a detailed, comprehensive response that addresses all aspects of this request.`;
  }

  private addBasicStructure(prompt: string): string {
    return `## Task\n\n${prompt}\n\n## Instructions\n\nPlease provide a clear, well-structured response.`;
  }

  private enhanceMarkdownStructure(content: string): string {
    // Add proper markdown structure if missing
    if (!content.includes('#')) {
      return `# ${content.split('\n')[0]}\n\n${content.substring(content.indexOf('\n') + 1)}`;
    }
    return content;
  }

  private optimizeContextLength(prompt: string, maxTokens: number): string {
    // Simple token estimation (4 chars ≈ 1 token)
    const estimatedTokens = prompt.length / 4;
    if (estimatedTokens > maxTokens * 0.8) {
      // Truncate if too long, keeping the most important parts
      const lines = prompt.split('\n');
      const importantLines = lines.filter(line => 
        line.includes('**') || line.includes('#') || line.length > 50
      );
      return importantLines.join('\n');
    }
    return prompt;
  }

  private optimizeForLongContext(content: string): string {
    // Claude handles long context well, so we can be more verbose
    return `${content}\n\nContext: This is part of a longer conversation or document. Please consider the full context when responding.`;
  }

  private preserveContextDetails(prompt: string, context: any): string {
    if (context && context.previousMessages) {
      return `Previous context: ${JSON.stringify(context.previousMessages)}\n\nCurrent request: ${prompt}`;
    }
    return prompt;
  }

  private optimizeForJsonOutput(content: string): string {
    if (!content.toLowerCase().includes('json')) {
      return `${content}\n\nPlease structure your response in a clear, organized format.`;
    }
    return content;
  }

  private optimizeMultimodalContext(prompt: string, context: any): string {
    if (context && (context.images || context.files)) {
      return `${prompt}\n\nNote: Additional media or files may be provided as context for this request.`;
    }
    return prompt;
  }

  // Public API methods
  getModelConfig(modelName: string): ModelConfig | undefined {
    return this.modelConfigs.get(modelName);
  }

  getSupportedModels(): string[] {
    return Array.from(this.modelConfigs.keys());
  }

  addModelConfig(modelName: string, config: ModelConfig): void {
    this.modelConfigs.set(modelName, config);
  }

  updateOptimizationStrategy(modelName: string, strategy: OptimizationStrategy): void {
    this.optimizationStrategies.set(modelName, strategy);
  }
}

// Export singleton instance
export const modelOptimizationService = ModelOptimizationService.getInstance();
