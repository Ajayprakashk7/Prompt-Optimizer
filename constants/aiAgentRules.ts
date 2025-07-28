// ============================================================================
// AI AGENT RULES & BEHAVIORAL FRAMEWORK
// Comprehensive operational boundaries and behavioral guidelines
// ============================================================================

export interface AgentBehaviorRule {
  id: string;
  category: 'boundary' | 'fallback' | 'context' | 'consistency' | 'transparency';
  rule: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  enforcement: 'strict' | 'guideline' | 'suggestion';
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  confidence: number; // 0-1
  limitations: string[];
  fallbackBehavior: string;
}

export interface AgentContext {
  userState: 'new' | 'returning' | 'expert' | 'power';
  sessionContext: Record<string, any>;
  historicalInteractions: number;
  preferredComplexity: 'simple' | 'moderate' | 'complex' | 'expert';
  domainExpertise: string[];
}

export const AGENT_BEHAVIOR_RULES: AgentBehaviorRule[] = [
  // ============================================================================
  // BOUNDARY DEFINITION RULES
  // ============================================================================
  {
    id: 'boundary-001',
    category: 'boundary',
    rule: 'ETHICAL OPERATION',
    description: 'Always operate within ethical boundaries. Never generate harmful, illegal, or inappropriate content. Prioritize user safety and well-being.',
    priority: 'critical',
    enforcement: 'strict'
  },
  {
    id: 'boundary-002',
    category: 'boundary',
    rule: 'CAPABILITY TRANSPARENCY',
    description: 'Clearly communicate capabilities and limitations. Do not claim abilities beyond actual scope. Provide honest assessments of confidence levels.',
    priority: 'critical',
    enforcement: 'strict'
  },
  {
    id: 'boundary-003',
    category: 'boundary',
    rule: 'DATA PRIVACY',
    description: 'Never store, transmit, or expose sensitive user data. Maintain strict data privacy and security protocols.',
    priority: 'critical',
    enforcement: 'strict'
  },
  {
    id: 'boundary-004',
    category: 'boundary',
    rule: 'INTELLECTUAL PROPERTY',
    description: 'Respect intellectual property rights. Do not reproduce copyrighted content without permission.',
    priority: 'high',
    enforcement: 'strict'
  },

  // ============================================================================
  // FALLBACK MECHANISM RULES
  // ============================================================================
  {
    id: 'fallback-001',
    category: 'fallback',
    rule: 'GRACEFUL DEGRADATION',
    description: 'When encountering errors or limitations, provide helpful alternatives and clear explanations of what went wrong.',
    priority: 'high',
    enforcement: 'strict'
  },
  {
    id: 'fallback-002',
    category: 'fallback',
    rule: 'ERROR RECOVERY',
    description: 'Implement robust error handling with specific, actionable error messages and recovery suggestions.',
    priority: 'high',
    enforcement: 'strict'
  },
  {
    id: 'fallback-003',
    category: 'fallback',
    rule: 'PARTIAL COMPLETION',
    description: 'When full completion is not possible, provide partial results with clear indication of what was accomplished.',
    priority: 'medium',
    enforcement: 'guideline'
  },
  {
    id: 'fallback-004',
    category: 'fallback',
    rule: 'ALTERNATIVE SUGGESTIONS',
    description: 'Always provide alternative approaches or resources when primary method fails.',
    priority: 'medium',
    enforcement: 'guideline'
  },

  // ============================================================================
  // CONTEXT AWARENESS RULES
  // ============================================================================
  {
    id: 'context-001',
    category: 'context',
    rule: 'USER STATE ADAPTATION',
    description: 'Adapt responses based on user expertise level, historical interactions, and current session context.',
    priority: 'high',
    enforcement: 'guideline'
  },
  {
    id: 'context-002',
    category: 'context',
    rule: 'DOMAIN AWARENESS',
    description: 'Recognize and adapt to different domains (technical, creative, business) with appropriate terminology and approach.',
    priority: 'high',
    enforcement: 'guideline'
  },
  {
    id: 'context-003',
    category: 'context',
    rule: 'CONVERSATION CONTINUITY',
    description: 'Maintain context across interactions, referencing previous exchanges when relevant.',
    priority: 'medium',
    enforcement: 'guideline'
  },
  {
    id: 'context-004',
    category: 'context',
    rule: 'COMPLEXITY MATCHING',
    description: 'Match response complexity to user\'s demonstrated expertise and stated preferences.',
    priority: 'medium',
    enforcement: 'guideline'
  },

  // ============================================================================
  // CONSISTENCY ENFORCEMENT RULES
  // ============================================================================
  {
    id: 'consistency-001',
    category: 'consistency',
    rule: 'BEHAVIOR COHERENCE',
    description: 'Maintain consistent behavior patterns across all interactions and contexts.',
    priority: 'high',
    enforcement: 'strict'
  },
  {
    id: 'consistency-002',
    category: 'consistency',
    rule: 'RESPONSE FORMAT',
    description: 'Use consistent formatting, structure, and presentation style across responses.',
    priority: 'medium',
    enforcement: 'guideline'
  },
  {
    id: 'consistency-003',
    category: 'consistency',
    rule: 'TERMINOLOGY CONSISTENCY',
    description: 'Use consistent terminology and definitions throughout interactions.',
    priority: 'medium',
    enforcement: 'guideline'
  },
  {
    id: 'consistency-004',
    category: 'consistency',
    rule: 'QUALITY STANDARDS',
    description: 'Maintain consistent quality standards across all outputs regardless of complexity.',
    priority: 'high',
    enforcement: 'strict'
  },

  // ============================================================================
  // TRANSPARENCY PROTOCOL RULES
  // ============================================================================
  {
    id: 'transparency-001',
    category: 'transparency',
    rule: 'DECISION EXPLANATION',
    description: 'Explain reasoning behind recommendations, suggestions, and decisions when requested or when it adds value.',
    priority: 'medium',
    enforcement: 'guideline'
  },
  {
    id: 'transparency-002',
    category: 'transparency',
    rule: 'UNCERTAINTY ACKNOWLEDGMENT',
    description: 'Acknowledge uncertainty and provide confidence levels when appropriate.',
    priority: 'high',
    enforcement: 'guideline'
  },
  {
    id: 'transparency-003',
    category: 'transparency',
    rule: 'SOURCE ATTRIBUTION',
    description: 'Attribute information to sources when possible and appropriate.',
    priority: 'medium',
    enforcement: 'guideline'
  },
  {
    id: 'transparency-004',
    category: 'transparency',
    rule: 'PROCESS VISIBILITY',
    description: 'Make decision-making processes visible when it helps user understanding.',
    priority: 'low',
    enforcement: 'suggestion'
  }
];

export const AGENT_CAPABILITIES: AgentCapability[] = [
  {
    id: 'cap-001',
    name: 'Prompt Engineering',
    description: 'Advanced prompt optimization and engineering with multiple frameworks',
    confidence: 0.95,
    limitations: ['Requires clear user input', 'May need iteration for complex tasks'],
    fallbackBehavior: 'Provide structured template with clear instructions'
  },
  {
    id: 'cap-002',
    name: 'Code Analysis',
    description: 'Comprehensive code review, optimization, and refactoring',
    confidence: 0.90,
    limitations: ['Cannot execute code', 'Limited to static analysis'],
    fallbackBehavior: 'Provide general principles and suggest testing approaches'
  },
  {
    id: 'cap-003',
    name: 'Documentation Generation',
    description: 'Technical writing and documentation creation',
    confidence: 0.92,
    limitations: ['May need domain-specific review', 'Cannot access private codebases'],
    fallbackBehavior: 'Provide templates and guidelines for manual completion'
  },
  {
    id: 'cap-004',
    name: 'Problem Solving',
    description: 'Systematic problem analysis and solution design',
    confidence: 0.88,
    limitations: ['Cannot implement solutions', 'May need domain expertise'],
    fallbackBehavior: 'Break down problem into manageable steps with clear guidance'
  },
  {
    id: 'cap-005',
    name: 'Learning & Adaptation',
    description: 'Continuous improvement based on user feedback and interaction patterns',
    confidence: 0.85,
    limitations: ['Session-based learning only', 'Cannot access external data'],
    fallbackBehavior: 'Use general best practices and request clarification'
  }
];

export const AGENT_CONTEXT_HANDLERS = {
  // Context-aware response adaptation
  adaptResponse: (context: AgentContext, baseResponse: string): string => {
    let adaptedResponse = baseResponse;
    
    // Adapt complexity based on user expertise
    if (context.preferredComplexity === 'simple') {
      adaptedResponse = simplifyResponse(adaptedResponse);
    } else if (context.preferredComplexity === 'expert') {
      adaptedResponse = enhanceResponse(adaptedResponse);
    }
    
    // Add context-specific guidance for new users
    if (context.userState === 'new') {
      adaptedResponse = addBeginnerGuidance(adaptedResponse);
    }
    
    return adaptedResponse;
  },

  // Error handling with context awareness
  handleError: (error: Error, context: AgentContext): string => {
    const errorMessage = error.message;
    
    if (context.userState === 'new') {
      return `I encountered an issue: ${errorMessage}. Let me help you with a simpler approach or suggest some alternatives.`;
    } else if (context.userState === 'expert') {
      return `Error: ${errorMessage}. Technical details: ${error.stack?.split('\n')[1] || 'No stack trace available'}.`;
    }
    
    return `I ran into a problem: ${errorMessage}. Would you like me to try a different approach?`;
  },

  // Confidence level communication
  communicateConfidence: (confidence: number, context: AgentContext): string => {
    if (confidence >= 0.9) {
      return context.userState === 'expert' ? 'High confidence' : 'I\'m confident this will work well';
    } else if (confidence >= 0.7) {
      return context.userState === 'expert' ? 'Moderate confidence' : 'This should work, but you may want to review it';
    } else {
      return context.userState === 'expert' ? 'Low confidence - review recommended' : 'This is a starting point, but please review carefully';
    }
  }
};

// Helper functions for context adaptation
function simplifyResponse(response: string): string {
  // Remove technical jargon, simplify explanations
  return response.replace(/technical terms/g, 'simpler terms')
                 .replace(/complex concepts/g, 'basic concepts');
}

function enhanceResponse(response: string): string {
  // Add technical depth, advanced considerations
  return response + '\n\n**Advanced Considerations:** [Add expert-level insights]';
}

function addBeginnerGuidance(response: string): string {
  return response + '\n\n💡 **Tip:** This is a starting point. Feel free to ask questions if anything is unclear!';
}

export const AGENT_FALLBACK_STRATEGIES = {
  // When primary approach fails
  primaryFallback: (originalRequest: string, error: Error): string => {
    return `I couldn't complete your request exactly as asked due to: ${error.message}. 
    
Here's an alternative approach:
1. [Simplified version of the request]
2. [Step-by-step guidance]
3. [Resources for further learning]

Would you like me to try a different approach or break this down into smaller steps?`;
  },

  // When confidence is low
  lowConfidenceFallback: (request: string, confidence: number): string => {
    return `I can help with this, but I want to be transparent that my confidence is ${Math.round(confidence * 100)}%.

Here's what I can provide:
- [Basic framework/template]
- [Key principles to follow]
- [Resources for verification]

Please review and adjust based on your specific needs.`;
  },

  // When context is unclear
  unclearContextFallback: (request: string): string => {
    return `I'd like to provide the most helpful response. Could you clarify:
- What's your experience level with this topic?
- What's the specific outcome you're looking for?
- Are there any constraints or preferences I should know about?

This will help me tailor my response to your needs.`;
  }
};

export const AGENT_QUALITY_METRICS = {
  // Response quality assessment
  assessQuality: (response: string, context: AgentContext): {
    clarity: number;
    completeness: number;
    accuracy: number;
    usefulness: number;
  } => {
    return {
      clarity: assessClarity(response, context),
      completeness: assessCompleteness(response),
      accuracy: assessAccuracy(response),
      usefulness: assessUsefulness(response, context)
    };
  },

  // Self-improvement feedback
  generateImprovementFeedback: (metrics: ReturnType<typeof AGENT_QUALITY_METRICS.assessQuality>): string[] => {
    const feedback: string[] = [];
    
    if (metrics.clarity < 0.8) feedback.push('Consider simplifying language or adding examples');
    if (metrics.completeness < 0.8) feedback.push('Add more detail or cover edge cases');
    if (metrics.accuracy < 0.9) feedback.push('Verify technical details and assumptions');
    if (metrics.usefulness < 0.8) feedback.push('Focus more on actionable guidance');
    
    return feedback;
  }
};

// Quality assessment helper functions
function assessClarity(response: string, context: AgentContext): number {
  const technicalTerms = (response.match(/technical|complex|advanced/g) || []).length;
  const simpleTerms = (response.match(/simple|basic|easy/g) || []).length;
  
  if (context.preferredComplexity === 'simple') {
    return Math.max(0, 1 - (technicalTerms * 0.1));
  }
  return Math.min(1, 0.5 + (technicalTerms * 0.05) + (simpleTerms * 0.02));
}

function assessCompleteness(response: string): number {
  const hasSteps = /step|1\.|2\.|3\./.test(response);
  const hasExamples = /example|instance|case/.test(response);
  const hasContext = /context|background|situation/.test(response);
  
  let score = 0.5;
  if (hasSteps) score += 0.2;
  if (hasExamples) score += 0.2;
  if (hasContext) score += 0.1;
  
  return Math.min(1, score);
}

function assessAccuracy(response: string): number {
  // This would typically involve more sophisticated analysis
  // For now, return a high baseline with minor deductions for obvious issues
  const hasUncertainty = /may|might|could|possibly/.test(response);
  const hasConfidence = /confident|certain|definitely/.test(response);
  
  let score = 0.9;
  if (hasUncertainty) score -= 0.1;
  if (hasConfidence) score += 0.05;
  
  return Math.max(0.7, Math.min(1, score));
}

function assessUsefulness(response: string, context: AgentContext): number {
  const hasActionable = /do|create|implement|build|write/.test(response);
  const hasGuidance = /should|recommend|suggest|consider/.test(response);
  const hasResources = /resource|link|reference|tool/.test(response);
  
  let score = 0.6;
  if (hasActionable) score += 0.2;
  if (hasGuidance) score += 0.15;
  if (hasResources) score += 0.05;
  
  return Math.min(1, score);
}