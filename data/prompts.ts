// Example prompts data - separated for better bundle splitting
export const examplePrompts = [
  // Tech & Development
  {
    title: 'Generate API Docs',
    prompt: 'Create comprehensive API documentation for a RESTful service'
  },
  {
    title: 'Write a CI/CD Pipeline',
    prompt: 'Design a complete CI/CD pipeline for a web application'
  },
  {
    title: 'Explain an Algorithm',
    prompt: 'Explain how the quicksort algorithm works with examples'
  },
  {
    title: 'Troubleshoot Kubernetes',
    prompt: 'Help me debug pod scheduling issues in my Kubernetes cluster'
  },
  {
    title: 'Refactor a Code Snippet',
    prompt: 'Optimize this JavaScript function for better performance and readability'
  },
  {
    title: 'Design a Database Schema',
    prompt: 'Create a database schema for an e-commerce platform'
  },
  {
    title: 'Expert Security Audit',
    prompt: `Act as an expert security researcher specializing in code auditing. You are tasked with conducting a thorough security audit of the provided codebase.

**Objective:** Identify, prioritize, and propose remediation strategies for high-priority security vulnerabilities.

## **Phase 0: Scoping & Context Gathering**
- Ask clarifying questions about the language, framework, purpose, and dependencies of the application.
- Define a threat model based on the application's context.

## **Phase 1: Analysis & Vulnerability Identification**
- Systematically review the code, focusing on critical areas like authentication, authorization, input validation, data handling, secrets management, and dependencies.
- Document each finding with file paths, line numbers, and classify the vulnerability (e.g., SQLi, XSS, IDOR).

## **Phase 2: Remediation Planning**
- For each high-priority issue, explain the risk, provide an attack scenario, and propose specific, actionable steps to fix it, including corrected code snippets.

## **Phase 3: Verification Guidance**
- Suggest how each fix should be verified with test cases or security checks.
`
  },
  // Product & Data
  {
    title: 'Write User Stories',
    prompt: 'Act as a product manager. A new feature for our project management app is a "Dashboard View". This dashboard should give users a high-level overview of their projects. Write three detailed user stories for this feature, following the format: "As a [user type], I want [an action] so that [a benefit]." Include clear acceptance criteria for each story.'
  },
  {
    title: 'Analyze User Feedback',
    prompt: 'Analyze this customer feedback and provide actionable insights'
  },
  {
    title: 'Create User Personas',
    prompt: 'Develop detailed user personas for a fitness tracking app'
  },
  // Creative & Content
  {
    title: 'Write Marketing Copy',
    prompt: 'Create compelling marketing copy for a new SaaS product launch'
  },
  {
    title: 'Brainstorm Content Ideas',
    prompt: 'Generate 10 engaging blog post ideas for a tech startup'
  },
  {
    title: 'Create a Story Outline',
    prompt: 'Develop a detailed outline for a science fiction short story'
  },
  // Business & Strategy
  {
    title: 'SWOT Analysis',
    prompt: 'Conduct a SWOT analysis for a startup entering the food delivery market'
  },
  {
    title: 'Business Plan Draft',
    prompt: 'Create an executive summary for a sustainable fashion brand'
  },
  {
    title: 'Competitor Analysis',
    prompt: 'Analyze the competitive landscape for project management tools'
  }
];

// Smaller set for extension with limited space
export const extensionExamplePrompts = [
  {
    title: 'Generate API Docs',
    prompt: 'Create comprehensive API documentation for a RESTful service'
  },
  {
    title: 'Explain an Algorithm',
    prompt: 'Explain how the quicksort algorithm works with examples'
  },
  {
    title: 'Write User Stories',
    prompt: 'Act as a product manager. Write user stories for a dashboard feature.'
  },
  {
    title: 'Marketing Copy',
    prompt: 'Create compelling marketing copy for a new SaaS product launch'
  },
  {
    title: 'SWOT Analysis',
    prompt: 'Conduct a SWOT analysis for a startup entering the food delivery market'
  }
];

// Configuration arrays
export const personas = [
  'Default',
  'Senior Software Engineer',
  'Cybersecurity Expert',
  'Cloud Solutions Architect',
  'Data Scientist',
  'Product Manager',
  'UX/UI Designer',
  'Marketing Expert',
  'Legal Advisor',
  'Financial Analyst',
  'Science Communicator',
  'Creative Writer',
  'Career Coach',
];

export const vibes = [
  'Default',
  'Professional',
  'Casual',
  'Friendly',
  'Direct',
  'Enthusiastic',
  'Analytical',
  'Creative',
];
