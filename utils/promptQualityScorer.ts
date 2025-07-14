// Advanced Prompt Quality Scoring System
// Evaluates prompts based on 2024 prompt engineering best practices

export interface PromptQualityScore {
  clarity: number;        // 0-100: How clear and unambiguous is the prompt?
  specificity: number;    // 0-100: How specific and detailed are the instructions?
  completeness: number;   // 0-100: Does it include all necessary information?
  structure: number;      // 0-100: How well-organized and logical is it?
  reasoning: number;      // 0-100: Does it include reasoning frameworks?
  effectiveness: number;  // 0-100: Predicted likelihood of achieving desired outcome
  overallScore: number;   // 0-100: Weighted average of all dimensions
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  suggestions: string[];  // Specific improvement recommendations
  strengths: string[];    // What the prompt does well
  weaknesses: string[];   // Areas that need improvement
}

export class PromptQualityScorer {
  private static instance: PromptQualityScorer;

  static getInstance(): PromptQualityScorer {
    if (!PromptQualityScorer.instance) {
      PromptQualityScorer.instance = new PromptQualityScorer();
    }
    return PromptQualityScorer.instance;
  }

  scorePrompt(prompt: string): PromptQualityScore {
    const clarity = this.evaluateClarity(prompt);
    const specificity = this.evaluateSpecificity(prompt);
    const completeness = this.evaluateCompleteness(prompt);
    const structure = this.evaluateStructure(prompt);
    const reasoning = this.evaluateReasoning(prompt);
    const effectiveness = this.predictEffectiveness(prompt);

    // Weighted average (reasoning and effectiveness are most important)
    const overallScore = Math.round(
      (clarity * 0.15) +
      (specificity * 0.15) +
      (completeness * 0.15) +
      (structure * 0.15) +
      (reasoning * 0.20) +
      (effectiveness * 0.20)
    );

    const grade = this.calculateGrade(overallScore);
    const suggestions = this.generateSuggestions(prompt, {
      clarity, specificity, completeness, structure, reasoning, effectiveness
    });
    const strengths = this.identifyStrengths(prompt, {
      clarity, specificity, completeness, structure, reasoning, effectiveness
    });
    const weaknesses = this.identifyWeaknesses(prompt, {
      clarity, specificity, completeness, structure, reasoning, effectiveness
    });

    return {
      clarity,
      specificity,
      completeness,
      structure,
      reasoning,
      effectiveness,
      overallScore,
      grade,
      suggestions,
      strengths,
      weaknesses
    };
  }

  private evaluateClarity(prompt: string): number {
    let score = 70; // Base score

    // Check for clear instructions
    if (prompt.includes('step by step') || prompt.includes('systematically')) score += 10;
    if (prompt.includes('specifically') || prompt.includes('exactly')) score += 5;
    
    // Check for ambiguous language
    if (prompt.includes('maybe') || prompt.includes('perhaps') || prompt.includes('might')) score -= 10;
    if (prompt.includes('something like') || prompt.includes('kind of')) score -= 15;

    // Check for clear structure
    if (prompt.includes('**') || prompt.includes('##') || prompt.includes('1.')) score += 10;

    // Check for jargon without explanation
    const jargonWords = ['API', 'ML', 'AI', 'DevOps', 'CI/CD'];
    const hasJargon = jargonWords.some(word => prompt.includes(word));
    const hasExplanation = prompt.includes('explain') || prompt.includes('define');
    if (hasJargon && !hasExplanation) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  private evaluateSpecificity(prompt: string): number {
    let score = 60; // Base score

    // Check for specific requirements
    if (prompt.includes('format:') || prompt.includes('structure:')) score += 15;
    if (prompt.includes('example') || prompt.includes('template')) score += 10;
    if (prompt.includes('constraints') || prompt.includes('requirements')) score += 10;

    // Check for vague language
    if (prompt.includes('good') || prompt.includes('better') || prompt.includes('nice')) score -= 10;
    if (prompt.includes('help me') || prompt.includes('please')) score -= 5;

    // Check for specific metrics or criteria
    if (prompt.includes('measure') || prompt.includes('criteria') || prompt.includes('score')) score += 10;

    // Check for variables/placeholders
    if (prompt.includes('{{') || prompt.includes('${')) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private evaluateCompleteness(prompt: string): number {
    let score = 65; // Base score

    // Check for essential components
    const hasPersona = prompt.toLowerCase().includes('act as') || prompt.toLowerCase().includes('you are');
    const hasContext = prompt.toLowerCase().includes('context') || prompt.toLowerCase().includes('background');
    const hasGoal = prompt.toLowerCase().includes('goal') || prompt.toLowerCase().includes('objective');
    const hasOutput = prompt.toLowerCase().includes('output') || prompt.toLowerCase().includes('format');

    if (hasPersona) score += 8;
    if (hasContext) score += 8;
    if (hasGoal) score += 8;
    if (hasOutput) score += 8;

    // Check for constraints and validation
    if (prompt.toLowerCase().includes('constraint') || prompt.toLowerCase().includes('must not')) score += 5;
    if (prompt.toLowerCase().includes('validate') || prompt.toLowerCase().includes('check')) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private evaluateStructure(prompt: string): number {
    let score = 60; // Base score

    // Check for markdown structure
    const hasHeaders = prompt.includes('#') || prompt.includes('**');
    const hasLists = prompt.includes('1.') || prompt.includes('-') || prompt.includes('*');
    const hasSections = prompt.split('\n\n').length > 2;

    if (hasHeaders) score += 15;
    if (hasLists) score += 10;
    if (hasSections) score += 10;

    // Check for logical flow
    const sections = prompt.split('\n\n');
    if (sections.length > 1) {
      // Basic structure check
      const hasIntro = sections[0].length > 20;
      const hasBody = sections.length > 2;
      const hasConclusion = sections[sections.length - 1].includes('output') || 
                           sections[sections.length - 1].includes('result');
      
      if (hasIntro) score += 5;
      if (hasBody) score += 5;
      if (hasConclusion) score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private evaluateReasoning(prompt: string): number {
    let score = 40; // Base score (most prompts lack advanced reasoning)

    // Check for Chain-of-Thought patterns
    if (prompt.includes('step by step') || prompt.includes('think through')) score += 20;
    if (prompt.includes('analyze') || prompt.includes('break down')) score += 15;
    if (prompt.includes('reasoning') || prompt.includes('logic')) score += 10;

    // Check for Tree-of-Thought patterns
    if (prompt.includes('approach') && prompt.includes('alternative')) score += 15;
    if (prompt.includes('path') || prompt.includes('option')) score += 10;

    // Check for metacognitive elements
    if (prompt.includes('validate') || prompt.includes('verify')) score += 10;
    if (prompt.includes('reflect') || prompt.includes('review')) score += 10;

    // Check for self-correction
    if (prompt.includes('check') || prompt.includes('ensure')) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private predictEffectiveness(prompt: string): number {
    let score = 70; // Base score

    // Positive indicators
    if (prompt.length > 100 && prompt.length < 2000) score += 10; // Good length
    if (prompt.includes('example') || prompt.includes('template')) score += 10;
    if (prompt.includes('specific') || prompt.includes('detailed')) score += 5;

    // Negative indicators
    if (prompt.length < 50) score -= 20; // Too short
    if (prompt.length > 3000) score -= 10; // Too long
    if (prompt.includes('just') || prompt.includes('simply')) score -= 5;

    // Advanced features
    if (prompt.includes('Chain-of-Thought') || prompt.includes('step by step')) score += 15;
    if (prompt.includes('validate') || prompt.includes('quality')) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private generateSuggestions(prompt: string, scores: any): string[] {
    const suggestions: string[] = [];

    if (scores.clarity < 80) {
      suggestions.push("Add clearer, more specific instructions");
      suggestions.push("Remove ambiguous language like 'maybe', 'perhaps', 'kind of'");
    }

    if (scores.specificity < 80) {
      suggestions.push("Include specific format requirements and examples");
      suggestions.push("Add measurable criteria for success");
    }

    if (scores.completeness < 80) {
      suggestions.push("Add persona definition (Act as...)");
      suggestions.push("Include context and background information");
      suggestions.push("Specify expected output format");
    }

    if (scores.structure < 80) {
      suggestions.push("Use markdown headers and bullet points for better organization");
      suggestions.push("Break content into logical sections");
    }

    if (scores.reasoning < 70) {
      suggestions.push("Add 'Think step by step' or Chain-of-Thought reasoning");
      suggestions.push("Include validation and quality check instructions");
      suggestions.push("Consider Tree-of-Thought for complex problems");
    }

    return suggestions;
  }

  private identifyStrengths(prompt: string, scores: any): string[] {
    const strengths: string[] = [];

    if (scores.clarity >= 85) strengths.push("Clear and unambiguous instructions");
    if (scores.specificity >= 85) strengths.push("Specific and detailed requirements");
    if (scores.completeness >= 85) strengths.push("Comprehensive and complete");
    if (scores.structure >= 85) strengths.push("Well-organized and structured");
    if (scores.reasoning >= 80) strengths.push("Includes advanced reasoning patterns");
    if (scores.effectiveness >= 85) strengths.push("High predicted effectiveness");

    return strengths;
  }

  private identifyWeaknesses(prompt: string, scores: any): string[] {
    const weaknesses: string[] = [];

    if (scores.clarity < 70) weaknesses.push("Lacks clarity and precision");
    if (scores.specificity < 70) weaknesses.push("Too vague and general");
    if (scores.completeness < 70) weaknesses.push("Missing essential components");
    if (scores.structure < 70) weaknesses.push("Poor organization and structure");
    if (scores.reasoning < 60) weaknesses.push("Lacks advanced reasoning frameworks");
    if (scores.effectiveness < 70) weaknesses.push("Low predicted effectiveness");

    return weaknesses;
  }
}

// Export singleton instance
export const promptQualityScorer = PromptQualityScorer.getInstance();
