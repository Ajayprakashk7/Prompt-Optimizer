// ============================================================================
// ENHANCED AI SERVICE WITH AGENT RULES INTEGRATION
// Integrates architect-level mega meta prompts with behavioral framework
// ============================================================================

import { META_PROMPT_ENGINE } from '../constants/prompts';
import { 
  AGENT_BEHAVIOR_RULES, 
  AGENT_CAPABILITIES, 
  AGENT_CONTEXT_HANDLERS,
  AGENT_FALLBACK_STRATEGIES,
  AGENT_QUALITY_METRICS,
  type AgentContext,
  type AgentBehaviorRule
} from '../constants/aiAgentRules';
import { fewShotLearningService } from './fewShotLearningService';
import { modelOptimizationService } from './modelOptimizationService';
import { promptQualityScorer } from '../utils/promptQualityScorer';

export interface EnhancedAIRequest {
  userInput: string;
  mode: string;
  context?: AgentContext;
  qualityThreshold?: number;
  enableAgentRules?: boolean;
  enableQualityMetrics?: boolean;
}

export interface EnhancedAIResponse {
  optimizedPrompt: string;
  qualityMetrics?: {
    clarity: number;
    completeness: number;
    accuracy: number;
    usefulness: number;
  };
  agentFeedback?: string[];
  confidence: number;
  reasoning: string;
  appliedRules: string[];
  fallbackUsed?: boolean;
}

export interface AgentRuleViolation {
  ruleId: string;
  rule: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
}

export class EnhancedAIService {
  private static instance: EnhancedAIService;
  private contextHistory: AgentContext[] = [];

  static getInstance(): EnhancedAIService {
    if (!EnhancedAIService.instance) {
      EnhancedAIService.instance = new EnhancedAIService();
    }
    return EnhancedAIService.instance;
  }

  // Main enhanced AI processing with agent rules integration
  async processRequest(request: EnhancedAIRequest): Promise<EnhancedAIResponse> {
    const startTime = Date.now();
    
    try {
      // Phase 1: Context Analysis and Agent Rule Validation
      const context = this.analyzeContext(request);
      const ruleViolations = this.validateAgentRules(request, context);
      
      if (ruleViolations.some(v => v.severity === 'critical')) {
        return this.handleCriticalViolations(ruleViolations, request);
      }

      // Phase 2: Enhanced Prompt Generation
      const enhancedPrompt = await this.generateEnhancedPrompt(request, context);
      
      // Phase 3: Quality Assessment and Improvement
      const qualityMetrics = request.enableQualityMetrics 
        ? AGENT_QUALITY_METRICS.assessQuality(enhancedPrompt.optimizedPrompt, context)
        : undefined;

      const improvementFeedback = qualityMetrics 
        ? AGENT_QUALITY_METRICS.generateImprovementFeedback(qualityMetrics)
        : [];

      // Phase 4: Agent Rule Application
      const appliedRules = this.applyAgentRules(enhancedPrompt.optimizedPrompt, context);
      
      // Phase 5: Final Response Assembly
      const response: EnhancedAIResponse = {
        optimizedPrompt: enhancedPrompt.optimizedPrompt,
        qualityMetrics,
        agentFeedback: improvementFeedback,
        confidence: enhancedPrompt.confidence,
        reasoning: enhancedPrompt.reasoning,
        appliedRules: appliedRules.map(r => r.rule),
        fallbackUsed: false
      };

      // Update context history
      this.updateContextHistory(context, response);

      return response;

    } catch (error) {
      return this.handleError(error, request);
    }
  }

  // Context analysis and user state determination
  private analyzeContext(request: EnhancedAIRequest): AgentContext {
    const context = request.context || this.createDefaultContext();
    
    // Analyze user input complexity and patterns
    const complexity = this.assessInputComplexity(request.userInput);
    const domain = this.identifyDomain(request.userInput);
    const expertise = this.estimateUserExpertise(request.userInput, context);
    
    return {
      ...context,
      preferredComplexity: complexity,
      domainExpertise: [...new Set([...context.domainExpertise, domain])],
      sessionContext: {
        ...context.sessionContext,
        lastRequest: request.userInput,
        requestCount: context.historicalInteractions + 1,
        averageComplexity: this.calculateAverageComplexity()
      }
    };
  }

  // Agent rule validation
  private validateAgentRules(request: EnhancedAIRequest, context: AgentContext): AgentRuleViolation[] {
    const violations: AgentRuleViolation[] = [];

    // Check boundary rules
    const boundaryRules = AGENT_BEHAVIOR_RULES.filter(r => r.category === 'boundary');
    for (const rule of boundaryRules) {
      const violation = this.checkRuleViolation(rule, request, context);
      if (violation) violations.push(violation);
    }

    // Check consistency rules
    const consistencyRules = AGENT_BEHAVIOR_RULES.filter(r => r.category === 'consistency');
    for (const rule of consistencyRules) {
      const violation = this.checkRuleViolation(rule, request, context);
      if (violation) violations.push(violation);
    }

    return violations;
  }

  // Check individual rule violation
  private checkRuleViolation(rule: AgentBehaviorRule, request: EnhancedAIRequest, context: AgentContext): AgentRuleViolation | null {
    switch (rule.id) {
      case 'boundary-001': // ETHICAL OPERATION
        if (this.containsHarmfulContent(request.userInput)) {
          return {
            ruleId: rule.id,
            rule: rule.rule,
            severity: 'critical',
            description: 'Request contains potentially harmful content',
            suggestion: 'Please rephrase your request to focus on constructive, ethical use cases.'
          };
        }
        break;

      case 'boundary-002': // CAPABILITY TRANSPARENCY
        if (this.exceedsCapabilities(request.userInput)) {
          return {
            ruleId: rule.id,
            rule: rule.rule,
            severity: 'high',
            description: 'Request exceeds current capabilities',
            suggestion: 'I can help with prompt optimization, but may need to focus on achievable aspects of your request.'
          };
        }
        break;

      case 'consistency-001': // BEHAVIOR COHERENCE
        if (this.contradictsPreviousBehavior(request.userInput, context)) {
          return {
            ruleId: rule.id,
            rule: rule.rule,
            severity: 'medium',
            description: 'Request may contradict previous interactions',
            suggestion: 'I\'ll maintain consistency while adapting to your current needs.'
          };
        }
        break;
    }

    return null;
  }

  // Enhanced prompt generation with agent rules
  private async generateEnhancedPrompt(request: EnhancedAIRequest, context: AgentContext): Promise<{
    optimizedPrompt: string;
    confidence: number;
    reasoning: string;
  }> {
    // Determine category for few-shot learning
    let category = 'general';
    try {
      const analysis = await this.analyzePrompt(request.userInput);
      category = analysis.category.toLowerCase().replace(/\s+/g, '_');
    } catch (error) {
      console.warn('Failed to analyze prompt for category, using general:', error);
    }

    // Generate few-shot enhanced prompt
    const fewShotPrompt = fewShotLearningService.generateFewShotPrompt(
      request.userInput,
      category,
      { maxExamples: request.mode === 'Architect' ? 3 : request.mode === 'Pro' ? 2 : 1 }
    );

    // Apply context-aware adaptation
    const adaptedInput = AGENT_CONTEXT_HANDLERS.adaptResponse(context, request.userInput);

    const userRequest = `
## USER'S RAW PROMPT:
\`\`\`
${adaptedInput}
\`\`\`

## FEW-SHOT ENHANCED PROMPT:
\`\`\`
${fewShotPrompt}
\`\`\`

## REQUESTED MODE:
${request.mode}

## USER CONTEXT:
- Expertise Level: ${context.userState}
- Preferred Complexity: ${context.preferredComplexity}
- Domain Expertise: ${context.domainExpertise.join(', ')}
- Historical Interactions: ${context.historicalInteractions}

## ADDITIONAL CONTEXT:
- Category: ${category}
- Few-shot examples included: ${fewShotPrompt !== request.userInput ? 'Yes' : 'No'}
- Use the few-shot examples as patterns for creating an even better optimized prompt
- Adapt response complexity to user's expertise level
- Ensure consistency with previous interactions
    `;

    const fullPrompt = `${META_PROMPT_ENGINE}\n\n${userRequest.trim()}`;

    // Generate response using the enhanced prompt
    const response = await this.callAIService(fullPrompt);
    
    return {
      optimizedPrompt: response,
      confidence: this.calculateConfidence(request.userInput, response, context),
      reasoning: this.generateReasoning(request.userInput, response, context)
    };
  }

  // Apply agent rules to the generated prompt
  private applyAgentRules(prompt: string, context: AgentContext): AgentBehaviorRule[] {
    const appliedRules: AgentBehaviorRule[] = [];

    // Apply context awareness rules
    const contextRules = AGENT_BEHAVIOR_RULES.filter(r => r.category === 'context');
    for (const rule of contextRules) {
      if (this.shouldApplyRule(rule, prompt, context)) {
        appliedRules.push(rule);
      }
    }

    // Apply transparency rules
    const transparencyRules = AGENT_BEHAVIOR_RULES.filter(r => r.category === 'transparency');
    for (const rule of transparencyRules) {
      if (this.shouldApplyRule(rule, prompt, context)) {
        appliedRules.push(rule);
      }
    }

    return appliedRules;
  }

  // Error handling with agent rules
  private handleError(error: any, request: EnhancedAIRequest): EnhancedAIResponse {
    const context = request.context || this.createDefaultContext();
    const errorMessage = AGENT_CONTEXT_HANDLERS.handleError(error, context);

    return {
      optimizedPrompt: AGENT_FALLBACK_STRATEGIES.primaryFallback(request.userInput, error),
      confidence: 0.3,
      reasoning: errorMessage,
      appliedRules: ['fallback-001', 'fallback-002'],
      fallbackUsed: true,
      agentFeedback: ['Error occurred during processing', 'Using fallback strategy']
    };
  }

  // Handle critical rule violations
  private handleCriticalViolations(violations: AgentRuleViolation[], request: EnhancedAIRequest): EnhancedAIResponse {
    const criticalViolation = violations.find(v => v.severity === 'critical');
    
    return {
      optimizedPrompt: `I cannot process this request due to ethical or safety concerns. ${criticalViolation?.suggestion || 'Please rephrase your request.'}`,
      confidence: 0.1,
      reasoning: criticalViolation?.description || 'Critical rule violation detected',
      appliedRules: ['boundary-001'],
      fallbackUsed: true,
      agentFeedback: [criticalViolation?.description || 'Critical violation']
    };
  }

  // Helper methods for context analysis
  private assessInputComplexity(input: string): 'simple' | 'moderate' | 'complex' | 'expert' {
    const wordCount = input.split(/\s+/).length;
    const technicalTerms = (input.match(/algorithm|architecture|optimization|framework|api|database|serverless|microservices/g) || []).length;
    
    if (wordCount < 10 && technicalTerms === 0) return 'simple';
    if (wordCount < 30 && technicalTerms < 3) return 'moderate';
    if (wordCount < 100 && technicalTerms < 6) return 'complex';
    return 'expert';
  }

  private identifyDomain(input: string): string {
    const domains = {
      'software': /code|programming|function|class|api|database|server|client/g,
      'ai': /ai|machine learning|neural|model|training|inference/g,
      'business': /business|strategy|marketing|sales|customer|product/g,
      'creative': /creative|design|art|writing|content|story/g,
      'technical': /technical|engineering|system|architecture|performance/g
    };

    for (const [domain, pattern] of Object.entries(domains)) {
      if (pattern.test(input.toLowerCase())) {
        return domain;
      }
    }
    return 'general';
  }

  private estimateUserExpertise(input: string, context: AgentContext): 'new' | 'returning' | 'expert' | 'power' {
    if (context.historicalInteractions < 3) return 'new';
    if (context.historicalInteractions < 10) return 'returning';
    if (context.historicalInteractions < 50) return 'expert';
    return 'power';
  }

  // Helper methods for rule validation
  private containsHarmfulContent(input: string): boolean {
    const harmfulPatterns = [
      /harm|hurt|damage|destroy|attack|hack|crack|steal|illegal|unethical/g,
      /personal.?data|private.?information|password|credit.?card/g
    ];
    
    return harmfulPatterns.some(pattern => pattern.test(input.toLowerCase()));
  }

  private exceedsCapabilities(input: string): boolean {
    const capabilityPatterns = [
      /execute|run|deploy|install|download|upload|access.?file/g,
      /real.?time|live.?data|current.?price|weather/g
    ];
    
    return capabilityPatterns.some(pattern => pattern.test(input.toLowerCase()));
  }

  private contradictsPreviousBehavior(input: string, context: AgentContext): boolean {
    // Simple check for contradictions in user preferences
    const lastRequest = context.sessionContext?.lastRequest;
    if (!lastRequest) return false;
    
    const complexityChange = Math.abs(
      this.assessInputComplexity(input).length - 
      this.assessInputComplexity(lastRequest).length
    );
    
    return complexityChange > 2; // Significant complexity change
  }

  // Helper methods for rule application
  private shouldApplyRule(rule: AgentBehaviorRule, prompt: string, context: AgentContext): boolean {
    switch (rule.id) {
      case 'context-001': // USER STATE ADAPTATION
        return context.userState === 'new' || context.userState === 'expert';
      case 'context-002': // DOMAIN AWARENESS
        return context.domainExpertise.length > 1;
      case 'transparency-002': // UNCERTAINTY ACKNOWLEDGMENT
        return this.calculateConfidence(prompt, prompt, context) < 0.8;
      default:
        return true;
    }
  }

  // AI service call (placeholder - would integrate with actual AI service)
  private async callAIService(prompt: string): Promise<string> {
    // This would integrate with the actual AI service (Gemini, OpenAI, etc.)
    // For now, return a placeholder response
    return `Enhanced prompt based on: ${prompt.substring(0, 100)}...`;
  }

  // Confidence calculation
  private calculateConfidence(input: string, output: string, context: AgentContext): number {
    let confidence = 0.7; // Base confidence
    
    // Adjust based on input complexity
    const complexity = this.assessInputComplexity(input);
    if (complexity === 'simple') confidence += 0.1;
    if (complexity === 'expert') confidence -= 0.1;
    
    // Adjust based on user expertise
    if (context.userState === 'expert') confidence += 0.1;
    if (context.userState === 'new') confidence -= 0.1;
    
    // Adjust based on output quality
    const quality = promptQualityScorer.scorePrompt(output);
    confidence += (quality - 0.5) * 0.2;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  // Reasoning generation
  private generateReasoning(input: string, output: string, context: AgentContext): string {
    const complexity = this.assessInputComplexity(input);
    const domain = this.identifyDomain(input);
    
    return `Generated ${complexity}-level prompt for ${domain} domain, adapted for ${context.userState} user with ${context.historicalInteractions} previous interactions.`;
  }

  // Context history management
  private updateContextHistory(context: AgentContext, response: EnhancedAIResponse): void {
    this.contextHistory.push({
      ...context,
      historicalInteractions: context.historicalInteractions + 1
    });
    
    // Keep only last 100 interactions
    if (this.contextHistory.length > 100) {
      this.contextHistory = this.contextHistory.slice(-100);
    }
  }

  private calculateAverageComplexity(): number {
    if (this.contextHistory.length === 0) return 0.5;
    
    const complexities = this.contextHistory.map(ctx => {
      const complexity = ctx.preferredComplexity;
      return complexity === 'simple' ? 0.25 : 
             complexity === 'moderate' ? 0.5 :
             complexity === 'complex' ? 0.75 : 1.0;
    });
    
    return complexities.reduce((sum, c) => sum + c, 0) / complexities.length;
  }

  // Default context creation
  private createDefaultContext(): AgentContext {
    return {
      userState: 'new',
      sessionContext: {},
      historicalInteractions: 0,
      preferredComplexity: 'moderate',
      domainExpertise: []
    };
  }

  // Prompt analysis (placeholder)
  private async analyzePrompt(input: string): Promise<{ category: string }> {
    // This would integrate with actual prompt analysis
    return { category: 'general' };
  }
}

// Export singleton instance
export const enhancedAIService = EnhancedAIService.getInstance();