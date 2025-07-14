// Few-Shot Learning Service
// Implements example-based learning patterns for superior prompt generation

export interface FewShotExample {
  id: string;
  input: string;
  output: string;
  explanation?: string;
  quality: number; // 0-100
  category: string;
  tags: string[];
  createdAt: Date;
}

export interface FewShotPattern {
  id: string;
  name: string;
  description: string;
  category: string;
  examples: FewShotExample[];
  template: string;
  effectiveness: number; // 0-100
  usageCount: number;
}

export interface FewShotConfig {
  maxExamples: number;
  qualityThreshold: number;
  diversityWeight: number; // 0-1, how much to prioritize diverse examples
  relevanceWeight: number; // 0-1, how much to prioritize relevant examples
}

export class FewShotLearningService {
  private static instance: FewShotLearningService;
  private patterns = new Map<string, FewShotPattern>();
  private examples = new Map<string, FewShotExample>();

  static getInstance(): FewShotLearningService {
    if (!FewShotLearningService.instance) {
      FewShotLearningService.instance = new FewShotLearningService();
      FewShotLearningService.instance.initializeDefaultPatterns();
    }
    return FewShotLearningService.instance;
  }

  // Core few-shot learning methods
  generateFewShotPrompt(
    userPrompt: string,
    category: string,
    config: Partial<FewShotConfig> = {}
  ): string {
    const finalConfig: FewShotConfig = {
      maxExamples: 3,
      qualityThreshold: 80,
      diversityWeight: 0.3,
      relevanceWeight: 0.7,
      ...config
    };

    // Find relevant examples
    const relevantExamples = this.findRelevantExamples(userPrompt, category, finalConfig);
    
    // Build few-shot prompt
    return this.buildFewShotPrompt(userPrompt, relevantExamples);
  }

  private findRelevantExamples(
    userPrompt: string,
    category: string,
    config: FewShotConfig
  ): FewShotExample[] {
    // Get all examples for the category
    const categoryExamples = Array.from(this.examples.values())
      .filter(example => 
        example.category === category && 
        example.quality >= config.qualityThreshold
      );

    if (categoryExamples.length === 0) {
      return [];
    }

    // Score examples by relevance and diversity
    const scoredExamples = categoryExamples.map(example => ({
      example,
      relevanceScore: this.calculateRelevanceScore(userPrompt, example),
      diversityScore: this.calculateDiversityScore(example, categoryExamples)
    }));

    // Combine scores
    const rankedExamples = scoredExamples
      .map(item => ({
        example: item.example,
        totalScore: (item.relevanceScore * config.relevanceWeight) + 
                   (item.diversityScore * config.diversityWeight)
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, config.maxExamples)
      .map(item => item.example);

    return rankedExamples;
  }

  private calculateRelevanceScore(userPrompt: string, example: FewShotExample): number {
    // Simple relevance scoring based on keyword overlap
    const userWords = this.extractKeywords(userPrompt.toLowerCase());
    const exampleWords = this.extractKeywords(example.input.toLowerCase());
    
    const intersection = userWords.filter(word => exampleWords.includes(word));
    const union = [...new Set([...userWords, ...exampleWords])];
    
    return union.length > 0 ? (intersection.length / union.length) * 100 : 0;
  }

  private calculateDiversityScore(example: FewShotExample, allExamples: FewShotExample[]): number {
    // Calculate how different this example is from others
    const similarities = allExamples
      .filter(other => other.id !== example.id)
      .map(other => this.calculateSimilarity(example, other));
    
    const avgSimilarity = similarities.length > 0 
      ? similarities.reduce((a, b) => a + b, 0) / similarities.length 
      : 0;
    
    return 100 - avgSimilarity; // Higher diversity = lower similarity
  }

  private calculateSimilarity(example1: FewShotExample, example2: FewShotExample): number {
    const words1 = this.extractKeywords(example1.input.toLowerCase());
    const words2 = this.extractKeywords(example2.input.toLowerCase());
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return union.length > 0 ? (intersection.length / union.length) * 100 : 0;
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (would use NLP library in production)
    return text
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'man', 'men', 'put', 'say', 'she', 'too', 'use'];
    return stopWords.includes(word.toLowerCase());
  }

  private buildFewShotPrompt(userPrompt: string, examples: FewShotExample[]): string {
    if (examples.length === 0) {
      return userPrompt;
    }

    let fewShotPrompt = `Here are some examples of high-quality prompts and their optimized versions:\n\n`;

    examples.forEach((example, index) => {
      fewShotPrompt += `**Example ${index + 1}:**\n`;
      fewShotPrompt += `Input: ${example.input}\n`;
      fewShotPrompt += `Output: ${example.output}\n`;
      if (example.explanation) {
        fewShotPrompt += `Explanation: ${example.explanation}\n`;
      }
      fewShotPrompt += `\n`;
    });

    fewShotPrompt += `Now, following the same pattern and quality standards demonstrated above, optimize this prompt:\n\n`;
    fewShotPrompt += `Input: ${userPrompt}\n`;
    fewShotPrompt += `Output:`;

    return fewShotPrompt;
  }

  // Example management
  addExample(example: Omit<FewShotExample, 'id' | 'createdAt'>): FewShotExample {
    const newExample: FewShotExample = {
      ...example,
      id: this.generateExampleId(),
      createdAt: new Date()
    };

    this.examples.set(newExample.id, newExample);
    return newExample;
  }

  updateExample(id: string, updates: Partial<FewShotExample>): FewShotExample {
    const example = this.examples.get(id);
    if (!example) {
      throw new Error(`Example ${id} not found`);
    }

    Object.assign(example, updates);
    return example;
  }

  removeExample(id: string): void {
    this.examples.delete(id);
  }

  getExamplesByCategory(category: string): FewShotExample[] {
    return Array.from(this.examples.values())
      .filter(example => example.category === category)
      .sort((a, b) => b.quality - a.quality);
  }

  // Pattern management
  createPattern(pattern: Omit<FewShotPattern, 'id' | 'usageCount'>): FewShotPattern {
    const newPattern: FewShotPattern = {
      ...pattern,
      id: this.generatePatternId(),
      usageCount: 0
    };

    this.patterns.set(newPattern.id, newPattern);
    return newPattern;
  }

  getPatternsByCategory(category: string): FewShotPattern[] {
    return Array.from(this.patterns.values())
      .filter(pattern => pattern.category === category)
      .sort((a, b) => b.effectiveness - a.effectiveness);
  }

  // Initialize with high-quality default patterns
  private initializeDefaultPatterns(): void {
    // Code Review Pattern
    this.addExample({
      input: "Review this Python function for bugs",
      output: `Act as a senior Python developer and code reviewer. Analyze the following function systematically:

**Analysis Framework:**
1. **Logic Review**: Check for logical errors and edge cases
2. **Performance Analysis**: Identify potential bottlenecks
3. **Security Assessment**: Look for security vulnerabilities
4. **Best Practices**: Evaluate adherence to Python conventions
5. **Testing Considerations**: Suggest test cases

**Output Format:**
- **Issues Found**: List each issue with severity level
- **Recommendations**: Specific improvement suggestions
- **Refactored Code**: Provide improved version if needed
- **Test Cases**: Suggest key test scenarios

Please provide the function code to review.`,
      explanation: "Transforms vague request into structured, comprehensive code review prompt with clear methodology",
      quality: 95,
      category: "code_review",
      tags: ["python", "code_review", "analysis"]
    });

    // Content Creation Pattern
    this.addExample({
      input: "Write a blog post about AI",
      output: `Act as an expert content strategist and AI thought leader. Create a comprehensive blog post about AI with the following structure:

**Content Strategy:**
- **Target Audience**: {{target_audience}} (e.g., business leaders, developers, general public)
- **Tone**: {{tone}} (e.g., educational, conversational, authoritative)
- **Length**: {{word_count}} words
- **SEO Focus**: {{primary_keyword}}

**Article Structure:**
1. **Hook**: Compelling opening that grabs attention
2. **Problem/Opportunity**: What AI challenge or opportunity are we addressing?
3. **Solution/Insight**: Your unique perspective or solution
4. **Evidence**: Data, examples, case studies
5. **Actionable Takeaways**: 3-5 specific actions readers can take
6. **Call to Action**: What should readers do next?

**Quality Standards:**
- Include relevant statistics and examples
- Use subheadings for readability
- Add meta description and title suggestions
- Ensure factual accuracy and cite sources

Topic focus: {{specific_ai_topic}}`,
      explanation: "Transforms generic request into detailed content brief with strategy, structure, and quality standards",
      quality: 92,
      category: "content_creation",
      tags: ["blog", "AI", "content_strategy"]
    });

    // Data Analysis Pattern
    this.addExample({
      input: "Analyze this dataset",
      output: `Act as a senior data scientist. Perform a comprehensive analysis of the provided dataset using this systematic approach:

**Phase 1: Data Understanding**
1. **Dataset Overview**: Describe structure, size, and data types
2. **Data Quality Assessment**: Check for missing values, outliers, inconsistencies
3. **Initial Observations**: Note patterns, distributions, correlations

**Phase 2: Exploratory Data Analysis**
1. **Descriptive Statistics**: Summary statistics for all variables
2. **Visualization Strategy**: Key charts and graphs to create
3. **Correlation Analysis**: Relationships between variables
4. **Segmentation**: Identify meaningful data segments

**Phase 3: Insights and Recommendations**
1. **Key Findings**: Top 5 most important discoveries
2. **Business Implications**: What do these findings mean?
3. **Recommendations**: Specific actions based on analysis
4. **Next Steps**: Suggested follow-up analyses

**Deliverables:**
- Executive summary (2-3 paragraphs)
- Detailed findings with visualizations
- Actionable recommendations
- Technical methodology notes

Please provide the dataset or describe the data structure to begin analysis.`,
      explanation: "Converts vague analysis request into structured data science methodology with clear phases and deliverables",
      quality: 94,
      category: "data_analysis",
      tags: ["data_science", "analysis", "methodology"]
    });

    // Creative Writing Pattern
    this.addExample({
      input: "Write a story",
      output: `Act as a professional creative writer. Craft an engaging story using this structured approach:

**Story Foundation:**
- **Genre**: {{genre}} (e.g., sci-fi, mystery, romance, thriller)
- **Length**: {{length}} (e.g., short story 1000 words, flash fiction 500 words)
- **Perspective**: {{pov}} (first person, third person limited, omniscient)
- **Tone**: {{tone}} (dark, humorous, suspenseful, heartwarming)

**Story Elements:**
1. **Protagonist**: Compelling main character with clear motivation
2. **Conflict**: Central problem or challenge to overcome
3. **Setting**: Vivid, immersive world that serves the story
4. **Theme**: Underlying message or question to explore

**Narrative Structure:**
1. **Hook**: Compelling opening that draws readers in
2. **Inciting Incident**: Event that sets the story in motion
3. **Rising Action**: Building tension and character development
4. **Climax**: Pivotal moment of highest tension
5. **Resolution**: Satisfying conclusion that addresses the conflict

**Writing Quality Standards:**
- Show, don't tell
- Use sensory details and vivid imagery
- Create authentic dialogue
- Maintain consistent voice and pacing
- End with emotional impact

Story premise: {{story_premise}}`,
      explanation: "Transforms generic writing request into structured creative brief with clear elements and quality standards",
      quality: 90,
      category: "creative_writing",
      tags: ["storytelling", "creative", "narrative"]
    });

    // Technical Documentation Pattern
    this.addExample({
      input: "Document this API",
      output: `Act as a technical documentation specialist. Create comprehensive API documentation with this structure:

**Documentation Framework:**

**1. Overview Section**
- **Purpose**: What does this API do?
- **Base URL**: API endpoint base
- **Authentication**: Required auth methods
- **Rate Limits**: Usage restrictions
- **Versioning**: API version information

**2. Endpoint Documentation**
For each endpoint, include:
- **HTTP Method**: GET, POST, PUT, DELETE
- **URL Pattern**: Full endpoint path with parameters
- **Description**: What this endpoint accomplishes
- **Parameters**: Required and optional parameters with types
- **Request Body**: Expected payload structure (if applicable)
- **Response Format**: Success response structure
- **Error Responses**: Possible error codes and messages
- **Example Requests**: cURL and code examples
- **Example Responses**: Sample JSON responses

**3. Integration Guide**
- **Quick Start**: Basic setup steps
- **Code Examples**: Multiple programming languages
- **SDKs**: Available client libraries
- **Testing**: How to test API calls

**4. Reference Materials**
- **Error Codes**: Complete error reference
- **Data Models**: Object schemas
- **Changelog**: Version history
- **Support**: Contact information

Please provide the API details to document.`,
      explanation: "Converts basic documentation request into comprehensive technical writing framework with all essential sections",
      quality: 93,
      category: "technical_documentation",
      tags: ["API", "documentation", "technical_writing"]
    });
  }

  private generateExampleId(): string {
    return `example_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePatternId(): string {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const fewShotLearningService = FewShotLearningService.getInstance();
