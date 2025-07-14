// Professional Prompt Templates Library
// Comprehensive collection of enterprise-grade prompt templates

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  template: string;
  variables: TemplateVariable[];
  tags: string[];
  usageCount: number;
  rating: number;
  examples: TemplateExample[];
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiline';
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For select type
  placeholder?: string;
}

export interface TemplateExample {
  title: string;
  variables: Record<string, any>;
  expectedOutput: string;
}

export const PROFESSIONAL_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'enterprise_code_review',
    name: 'Enterprise Code Review',
    description: 'Comprehensive code review template for enterprise-level applications',
    category: 'Software Development',
    difficulty: 'expert',
    template: `# Enterprise Code Review Analysis

## Reviewer Profile
Act as a **Senior Software Architect** with 15+ years of experience in {{technology_stack}} and enterprise software development. You specialize in {{domain_expertise}} and have deep knowledge of security, scalability, and maintainability best practices.

## Code Review Framework

### **Phase 1: Initial Assessment**
Analyze the provided code using this systematic approach:

1. **Architecture Alignment**
   - Does this code align with the overall system architecture?
   - Are design patterns used appropriately?
   - Is the separation of concerns maintained?

2. **Security Analysis**
   - Identify potential security vulnerabilities
   - Check for proper input validation and sanitization
   - Verify authentication and authorization mechanisms
   - Assess data handling and privacy compliance

3. **Performance Evaluation**
   - Analyze algorithmic complexity
   - Identify potential bottlenecks
   - Review database query efficiency
   - Assess memory usage patterns

### **Phase 2: Quality Assessment**

**Code Quality Metrics:**
- **Readability**: Is the code self-documenting and clear?
- **Maintainability**: How easy is it to modify and extend?
- **Testability**: Can this code be effectively unit tested?
- **Reusability**: Are there opportunities for code reuse?

**Standards Compliance:**
- Coding standards adherence ({{coding_standards}})
- Documentation completeness
- Error handling robustness
- Logging and monitoring integration

### **Phase 3: Detailed Review**

**For each file/function, provide:**

1. **Severity Classification**
   - 🔴 **Critical**: Security vulnerabilities, data corruption risks
   - 🟡 **Major**: Performance issues, maintainability concerns
   - 🟢 **Minor**: Style improvements, optimization opportunities

2. **Specific Findings**
   - Line-by-line comments for issues
   - Suggested improvements with code examples
   - Alternative implementation approaches

3. **Positive Observations**
   - Well-implemented patterns
   - Good practices demonstrated
   - Innovative solutions

### **Phase 4: Recommendations**

**Immediate Actions Required:**
- List critical issues that must be fixed before deployment

**Improvement Opportunities:**
- Refactoring suggestions
- Performance optimizations
- Code organization improvements

**Future Considerations:**
- Scalability enhancements
- Technology upgrade paths
- Technical debt reduction strategies

## Output Format

```markdown
# Code Review Summary

## Overall Assessment
- **Quality Score**: X/10
- **Security Score**: X/10
- **Performance Score**: X/10
- **Maintainability Score**: X/10

## Critical Issues (🔴)
[List critical issues with specific line references]

## Major Issues (🟡)
[List major issues with improvement suggestions]

## Minor Issues (🟢)
[List minor improvements and optimizations]

## Positive Highlights
[Acknowledge good practices and well-written code]

## Recommendations
### Immediate Actions
- [ ] Action item 1
- [ ] Action item 2

### Future Improvements
- [ ] Improvement 1
- [ ] Improvement 2

## Refactored Code Examples
[Provide specific code improvements where applicable]
```

**Code to Review:**
{{code_content}}

**Additional Context:**
- **Project Type**: {{project_type}}
- **Performance Requirements**: {{performance_requirements}}
- **Security Level**: {{security_level}}
- **Team Size**: {{team_size}}`,
    variables: [
      {
        name: 'technology_stack',
        description: 'Primary technology stack (e.g., React/Node.js, Python/Django, Java/Spring)',
        type: 'string',
        required: true,
        placeholder: 'React/Node.js/TypeScript'
      },
      {
        name: 'domain_expertise',
        description: 'Specific domain expertise (e.g., fintech, healthcare, e-commerce)',
        type: 'string',
        required: true,
        placeholder: 'fintech applications'
      },
      {
        name: 'coding_standards',
        description: 'Coding standards to enforce',
        type: 'string',
        required: true,
        placeholder: 'ESLint, Prettier, TypeScript strict mode'
      },
      {
        name: 'code_content',
        description: 'The code to be reviewed',
        type: 'multiline',
        required: true,
        placeholder: 'Paste the code here...'
      },
      {
        name: 'project_type',
        description: 'Type of project',
        type: 'select',
        required: true,
        options: ['Web Application', 'Mobile App', 'API Service', 'Desktop Application', 'Microservice', 'Library/Framework']
      },
      {
        name: 'performance_requirements',
        description: 'Performance requirements',
        type: 'string',
        required: false,
        placeholder: 'Sub-second response times, 10k concurrent users'
      },
      {
        name: 'security_level',
        description: 'Security requirements level',
        type: 'select',
        required: true,
        options: ['Standard', 'High', 'Critical', 'Government/Military']
      },
      {
        name: 'team_size',
        description: 'Development team size',
        type: 'select',
        required: false,
        options: ['1-3 developers', '4-10 developers', '11-25 developers', '25+ developers']
      }
    ],
    tags: ['code-review', 'enterprise', 'security', 'performance', 'architecture'],
    usageCount: 0,
    rating: 0,
    examples: [
      {
        title: 'React Component Review',
        variables: {
          technology_stack: 'React/TypeScript/Node.js',
          domain_expertise: 'e-commerce platforms',
          coding_standards: 'ESLint, Prettier, TypeScript strict',
          project_type: 'Web Application',
          security_level: 'High',
          team_size: '4-10 developers'
        },
        expectedOutput: 'Comprehensive code review with security focus for e-commerce React component'
      }
    ]
  },

  {
    id: 'business_strategy_analysis',
    name: 'Business Strategy Analysis',
    description: 'Strategic business analysis and recommendation framework',
    category: 'Business Strategy',
    difficulty: 'expert',
    template: `# Strategic Business Analysis Framework

## Analyst Profile
Act as a **Senior Strategy Consultant** with an MBA from a top-tier business school and 12+ years of experience in {{industry_sector}}. You specialize in {{analysis_focus}} and have successfully guided {{company_size}} companies through strategic transformations.

## Analysis Framework

### **Phase 1: Situation Analysis**

**Market Environment Assessment:**
1. **Industry Analysis** (Porter's Five Forces)
   - Competitive rivalry intensity
   - Supplier bargaining power
   - Buyer bargaining power
   - Threat of substitutes
   - Barriers to entry

2. **Market Dynamics**
   - Market size and growth trends
   - Key market drivers and inhibitors
   - Regulatory environment impact
   - Technology disruption factors

**Internal Capability Assessment:**
1. **Resource Analysis**
   - Financial resources and constraints
   - Human capital and capabilities
   - Technology and infrastructure
   - Brand and intellectual property

2. **Operational Excellence**
   - Process efficiency and effectiveness
   - Quality management systems
   - Supply chain optimization
   - Customer experience delivery

### **Phase 2: Strategic Options Development**

**Strategic Alternatives Framework:**

**Option A: {{strategy_option_1}}**
- **Description**: [Detailed strategy description]
- **Investment Required**: [Financial and resource requirements]
- **Timeline**: [Implementation timeline]
- **Risk Assessment**: [Key risks and mitigation strategies]
- **Expected ROI**: [Financial projections and metrics]

**Option B: {{strategy_option_2}}**
- **Description**: [Alternative strategy approach]
- **Investment Required**: [Resource allocation needs]
- **Timeline**: [Phased implementation plan]
- **Risk Assessment**: [Risk profile and management]
- **Expected ROI**: [Return projections]

**Option C: {{strategy_option_3}}**
- **Description**: [Third strategic alternative]
- **Investment Required**: [Investment analysis]
- **Timeline**: [Execution roadmap]
- **Risk Assessment**: [Risk evaluation]
- **Expected ROI**: [Financial impact assessment]

### **Phase 3: Evaluation and Recommendation**

**Multi-Criteria Decision Analysis:**

| Criteria | Weight | Option A | Option B | Option C |
|----------|--------|----------|----------|----------|
| Financial Return | 30% | [Score] | [Score] | [Score] |
| Strategic Fit | 25% | [Score] | [Score] | [Score] |
| Risk Level | 20% | [Score] | [Score] | [Score] |
| Implementation Feasibility | 15% | [Score] | [Score] | [Score] |
| Market Timing | 10% | [Score] | [Score] | [Score] |

**Recommended Strategy:** [Selected option with detailed justification]

### **Phase 4: Implementation Roadmap**

**90-Day Quick Wins:**
- [ ] Immediate action 1
- [ ] Immediate action 2
- [ ] Immediate action 3

**6-Month Milestones:**
- [ ] Medium-term goal 1
- [ ] Medium-term goal 2
- [ ] Medium-term goal 3

**12-Month Strategic Objectives:**
- [ ] Long-term objective 1
- [ ] Long-term objective 2
- [ ] Long-term objective 3

**Success Metrics and KPIs:**
- Primary KPI: {{primary_kpi}}
- Secondary KPIs: {{secondary_kpis}}
- Monitoring frequency: {{monitoring_frequency}}

## Business Challenge
{{business_challenge}}

## Current Context
- **Company Size**: {{company_size}}
- **Industry**: {{industry_sector}}
- **Geographic Scope**: {{geographic_scope}}
- **Time Horizon**: {{time_horizon}}
- **Budget Constraints**: {{budget_constraints}}`,
    variables: [
      {
        name: 'industry_sector',
        description: 'Industry sector or vertical',
        type: 'string',
        required: true,
        placeholder: 'technology, healthcare, financial services'
      },
      {
        name: 'analysis_focus',
        description: 'Specific area of strategic expertise',
        type: 'string',
        required: true,
        placeholder: 'digital transformation, market expansion, operational efficiency'
      },
      {
        name: 'company_size',
        description: 'Company size category',
        type: 'select',
        required: true,
        options: ['Startup (1-50 employees)', 'SME (51-500 employees)', 'Mid-market (501-5000 employees)', 'Enterprise (5000+ employees)']
      },
      {
        name: 'business_challenge',
        description: 'The specific business challenge or opportunity to analyze',
        type: 'multiline',
        required: true,
        placeholder: 'Describe the business situation, challenge, or opportunity...'
      },
      {
        name: 'strategy_option_1',
        description: 'First strategic option to evaluate',
        type: 'string',
        required: true,
        placeholder: 'Market expansion strategy'
      },
      {
        name: 'strategy_option_2',
        description: 'Second strategic option to evaluate',
        type: 'string',
        required: true,
        placeholder: 'Product diversification strategy'
      },
      {
        name: 'strategy_option_3',
        description: 'Third strategic option to evaluate',
        type: 'string',
        required: true,
        placeholder: 'Operational optimization strategy'
      },
      {
        name: 'geographic_scope',
        description: 'Geographic scope of operations',
        type: 'select',
        required: true,
        options: ['Local', 'Regional', 'National', 'International', 'Global']
      },
      {
        name: 'time_horizon',
        description: 'Strategic planning time horizon',
        type: 'select',
        required: true,
        options: ['6 months', '1 year', '2-3 years', '3-5 years', '5+ years']
      },
      {
        name: 'budget_constraints',
        description: 'Budget or resource constraints',
        type: 'string',
        required: false,
        placeholder: 'Limited budget, need ROI within 18 months'
      },
      {
        name: 'primary_kpi',
        description: 'Primary success metric',
        type: 'string',
        required: true,
        placeholder: 'Revenue growth, market share, customer acquisition'
      },
      {
        name: 'secondary_kpis',
        description: 'Secondary success metrics',
        type: 'string',
        required: false,
        placeholder: 'Customer satisfaction, operational efficiency, brand awareness'
      },
      {
        name: 'monitoring_frequency',
        description: 'How often to monitor progress',
        type: 'select',
        required: true,
        options: ['Weekly', 'Monthly', 'Quarterly', 'Semi-annually', 'Annually']
      }
    ],
    tags: ['business-strategy', 'analysis', 'consulting', 'decision-making', 'planning'],
    usageCount: 0,
    rating: 0,
    examples: [
      {
        title: 'SaaS Market Expansion',
        variables: {
          industry_sector: 'SaaS technology',
          analysis_focus: 'international market expansion',
          company_size: 'SME (51-500 employees)',
          geographic_scope: 'National',
          time_horizon: '2-3 years',
          primary_kpi: 'International revenue growth'
        },
        expectedOutput: 'Comprehensive market expansion strategy with risk assessment and implementation roadmap'
      }
    ]
  }
];

// Template categories for organization
export const TEMPLATE_CATEGORIES = [
  'Software Development',
  'Business Strategy',
  'Data Analysis',
  'Content Creation',
  'Marketing',
  'Project Management',
  'Research & Analysis',
  'Creative Writing',
  'Technical Documentation',
  'Customer Service',
  'Sales & Business Development',
  'HR & Recruitment',
  'Finance & Accounting',
  'Legal & Compliance',
  'Education & Training'
];

// Template difficulty levels
export const DIFFICULTY_LEVELS = {
  beginner: {
    name: 'Beginner',
    description: 'Simple templates for basic tasks',
    color: '#10B981'
  },
  intermediate: {
    name: 'Intermediate',
    description: 'Moderate complexity templates',
    color: '#F59E0B'
  },
  advanced: {
    name: 'Advanced',
    description: 'Complex templates for experienced users',
    color: '#EF4444'
  },
  expert: {
    name: 'Expert',
    description: 'Enterprise-grade templates for professionals',
    color: '#8B5CF6'
  }
};
