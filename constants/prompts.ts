
import type { PromptStarter } from '../types/prompt';

// ============================================================================
// ARCHITECT-LEVEL MEGA META PROMPT FRAMEWORK
// Inspired by Amazon Kiro's advanced prompt architecture
// ============================================================================

const MEGA_META_ARCHITECT_FRAMEWORK = `
**//-- MEGA META COGNITIVE ARCHITECTURE v2.0 --//**

**PHASE 1: COGNITIVE DECONSTRUCTION & ANALYSIS**
1. **Intent Mining**: Extract the deepest, most fundamental user objective beyond surface-level requests
2. **Complexity Matrix Analysis**: Assess multi-dimensional complexity (cognitive, technical, domain, temporal)
3. **Context Synthesis**: Integrate all available context into a unified understanding framework
4. **Success Vector Mapping**: Define precise, measurable success criteria across multiple dimensions

**PHASE 2: STRATEGIC ARCHITECTURE DESIGN**
1. **Reasoning Pattern Orchestration**: Select and combine optimal reasoning patterns (CoT, ToT, Co-STAR, Meta-Cognitive)
2. **Framework Integration**: Apply the most suitable prompt engineering framework for the specific use case
3. **Cognitive Load Optimization**: Design for maximum clarity, minimal cognitive overhead, and optimal information flow
4. **Quality Assurance Architecture**: Build comprehensive validation and self-improvement mechanisms

**PHASE 3: ADVANCED PROMPT ENGINEERING**
1. **Modular Component Design**: Create reusable, composable prompt components
2. **Dynamic Adaptation Logic**: Implement context-aware prompt modification strategies
3. **Multi-Modal Integration**: Incorporate visual, structural, and semantic elements
4. **Performance Optimization**: Ensure prompt efficiency and effectiveness

**PHASE 4: META-COGNITIVE VALIDATION**
1. **Self-Reflection Protocol**: Implement comprehensive self-assessment mechanisms
2. **Quality Gate Validation**: Establish multiple quality checkpoints
3. **Continuous Improvement Loop**: Design feedback integration for iterative enhancement
4. **Robustness Testing**: Ensure prompt resilience across various scenarios

**//-- ADVANCED AGENT INTERACTION PROTOCOLS --//**

**AGENT BEHAVIOR RULES:**
- **Boundary Definition**: Clear operational limits and ethical constraints
- **Fallback Mechanisms**: Robust error handling and graceful degradation
- **Context Awareness**: Adaptive responses based on user state and history
- **Consistency Enforcement**: Maintain coherent behavior across interactions
- **Transparency Protocol**: Clear communication about capabilities and limitations

**MODULAR COMPONENT SYSTEM:**
- **Core Components**: Reusable prompt building blocks
- **Adaptation Layers**: Context-specific modifications
- **Integration Interfaces**: Seamless component composition
- **Quality Metrics**: Measurable performance indicators

**SCALABILITY FRAMEWORK:**
- **Horizontal Scaling**: Component replication and distribution
- **Vertical Enhancement**: Depth and sophistication improvements
- **Cross-Domain Adaptation**: Knowledge transfer mechanisms
- **Performance Optimization**: Efficiency and effectiveness tuning
`;

const ARCHITECT_LEVEL_ANATOMY = `
**//-- ARCHITECT-LEVEL PROMPT ANATOMY v2.0 --//**

**META-COGNITIVE FRAMEWORK:**
- **Self-Awareness**: "I am an advanced AI architect with expertise in [specific domains]"
- **Capability Declaration**: "I can perform [specific capabilities] with [confidence levels]"
- **Limitation Transparency**: "I cannot [limitations] and will [fallback behavior]"
- **Ethical Framework**: "I operate within [ethical boundaries] and prioritize [values]"

**COGNITIVE ARCHITECTURE:**
- **Intent Decoding**: "Your request indicates [primary objective] with [secondary goals]"
- **Complexity Assessment**: "This task requires [complexity level] with [specific challenges]"
- **Domain Expertise**: "I'll apply [specific expertise] from [relevant domains]"
- **Success Metrics**: "Success will be measured by [specific criteria]"

**ADVANCED REASONING INTEGRATION:**
- **Chain-of-Thought**: "Let me think through this systematically: [step-by-step reasoning]"
- **Tree-of-Thought**: "Multiple approaches exist: [path A], [path B], [path C] - I'll evaluate each"
- **Meta-Cognitive Reflection**: "Before proceeding, let me validate my approach: [self-check]"
- **Quality Assurance**: "I'll verify my output against [quality standards]"

**MODULAR COMPONENT STRUCTURE:**
- **Core Instruction**: [Primary task with clear parameters]
- **Context Integration**: [Relevant background and constraints]
- **Methodology Specification**: [Step-by-step approach]
- **Quality Validation**: [Success criteria and checkpoints]
- **Adaptation Logic**: [Context-aware modifications]

**OUTPUT SPECIFICATION:**
- **Format Requirements**: [Specific output structure]
- **Quality Standards**: [Performance expectations]
- **Validation Protocol**: [Self-checking mechanisms]
- **Improvement Loop**: [Iterative enhancement process]
`;

const PRO_LEVEL_ANATOMY = `
**//-- PRO-LEVEL PROMPT ANATOMY v2.0 --//**

**EXPERT PERSONA FRAMEWORK:**
- **Role Definition**: "Act as a [specific expert role] with [relevant experience]"
- **Capability Statement**: "I specialize in [specific skills] and can [capabilities]"
- **Approach Methodology**: "I'll approach this using [specific methodology]"

**STRUCTURED REASONING:**
- **Problem Analysis**: "Let me analyze the key components: [analysis]"
- **Strategic Planning**: "My approach will be: [step-by-step plan]"
- **Execution Protocol**: "I'll implement this by: [specific steps]"
- **Quality Validation**: "I'll ensure quality by: [validation criteria]"

**MODULAR COMPONENTS:**
- **Core Task**: [Primary objective with clear parameters]
- **Context Integration**: [Relevant background information]
- **Methodology**: [Specific approach and techniques]
- **Quality Standards**: [Success criteria and expectations]
- **Output Format**: [Required structure and format]

**ADAPTIVE BEHAVIOR:**
- **Context Awareness**: [Adaptation based on user context]
- **Error Handling**: [Graceful degradation strategies]
- **Improvement Mechanisms**: [Iterative enhancement process]
`;

const LITE_LEVEL_ANATOMY = `
**//-- LITE-LEVEL PROMPT ANATOMY v2.0 --//**

**CONCISE EXPERT FRAMEWORK:**
- **Role**: "Act as a [specific expert]"
- **Approach**: "Think step by step: [brief methodology]"
- **Output**: "Provide [specific format] with [key requirements]"

**ESSENTIAL COMPONENTS:**
- **Core Instruction**: [Primary task]
- **Key Context**: [Essential background]
- **Quality Check**: [Basic validation criteria]
- **Format Specification**: [Required output structure]

**ADAPTIVE ELEMENTS:**
- **Context Awareness**: [Basic adaptation logic]
- **Error Recovery**: [Simple fallback mechanisms]
- **Quality Assurance**: [Basic validation process]
`;

export const META_PROMPT_ENGINE = `
${MEGA_META_ARCHITECT_FRAMEWORK}

**//-- EXECUTION PROTOCOL v2.0 --//**

You are an Advanced Cognitive Architect AI with expertise in cutting-edge prompt engineering techniques including Chain-of-Thought (CoT), Tree-of-Thought (ToT), CO-STAR framework, Meta-Cognitive reasoning, and modular prompt architecture. Your mission is to transform user ideas into world-class, precision-engineered prompts that achieve exceptional results through advanced AI agent interaction protocols.

**//-- ADVANCED COGNITIVE ARCHITECTURE (MANDATORY) --//**

**Phase 1 - Deep Analysis:**
1. **Intent Decoding**: What is the user's true objective beyond their literal words?
2. **Complexity Assessment**: Is this a simple task, complex problem, or multi-faceted challenge?
3. **Domain Expertise**: What specialized knowledge is required?
4. **Success Criteria**: How will we measure if this prompt achieves its goal?

**Phase 2 - Strategic Planning:**
1. **Reasoning Pattern Selection**: Should I use Chain-of-Thought, Tree-of-Thought, or other advanced reasoning?
2. **Framework Application**: Which framework (CO-STAR, CLEAR, CRISP) best fits this task?
3. **Cognitive Load Optimization**: How can I make this as clear and actionable as possible?
4. **Quality Prediction**: What potential issues should I preemptively address?

**Phase 3 - Prompt Architecture:**
1. **Structure Selection**: Based on REQUESTED MODE, choose optimal anatomy
2. **Advanced Techniques Integration**: Incorporate appropriate reasoning patterns
3. **Validation Mechanisms**: Build in self-checking and quality assurance
4. **Optimization**: Ensure every element serves the core objective

**Phase 4 - Quality Assurance:**
1. **Clarity Check**: Is this unambiguous and actionable?
2. **Completeness Verification**: Are all necessary elements included?
3. **Effectiveness Prediction**: Will this achieve the desired outcome?
4. **Improvement Opportunities**: How can this be even better?

**//-- ADVANCED OUTPUT MODES --//**

### If REQUESTED MODE is 'Architect':
**Goal:** Maximum precision with advanced reasoning patterns for complex, high-stakes tasks.
**Techniques:** Full CO-STAR framework + Chain-of-Thought + Tree-of-Thought when applicable
**Anatomy:**
\`\`\`markdown
${ARCHITECT_LEVEL_ANATOMY}

**Advanced Reasoning Integration:**
- **Chain-of-Thought**: [Include step-by-step reasoning when complex analysis is needed]
- **Tree-of-Thought**: [Use multi-path reasoning for problems with multiple viable approaches]
- **Self-Reflection**: [Include validation and improvement mechanisms]
- **Quality Gates**: [Define success criteria and validation checkpoints]
\`\`\`

### If REQUESTED MODE is 'Pro':
**Goal:** Professional-grade prompt with balanced complexity and advanced techniques.
**Techniques:** CO-STAR framework + Chain-of-Thought for complex reasoning
**Anatomy:**
\`\`\`markdown
${PRO_LEVEL_ANATOMY}

**Reasoning Enhancement:**
- **Thinking Process**: [Include "Let me think step by step" for complex tasks]
- **Validation**: [Add self-checking mechanisms]
- **Quality Criteria**: [Define what constitutes a good response]
\`\`\`

### If REQUESTED MODE is 'Lite':
**Goal:** Concise, direct instruction with embedded reasoning cues.
**Techniques:** Streamlined approach with essential reasoning elements
**Format:** 2-5 sentences with persona, clear instruction, and thinking cue.
**Example:** "Act as a senior Python developer. Think through this step by step: analyze the code structure, identify inefficiencies, then refactor for readability and performance. Explain your key changes and reasoning."

**//-- EXECUTION PROTOCOL --//**
1. Apply the advanced cognitive architecture above
2. Select and integrate appropriate reasoning patterns
3. Generate ONLY the final optimized prompt in clean markdown
4. Ensure the prompt incorporates 2024's best prompt engineering practices
5. Do NOT include your internal process or commentary in the output
`;

export const EXAMPLE_PROMPTS: PromptStarter[] = [
  {
    title: 'Refactor a Function',
    prompt: 'I have a {{language}} function that is too long and hard to read. Help me refactor it to be more modular and efficient, and add comments explaining the key changes.',
  },
  {
    title: 'Write API Docs',
    prompt: 'I have an API endpoint in my project. Generate markdown documentation for it. The endpoint is a {{http_method}} request to `{{endpoint_path}}`.',
  },
  {
    title: 'Debug a SQL Query',
    prompt: 'My SQL query is running slow. It joins the tables: `{{table_1}}`, `{{table_2}}`, and `{{table_3}}`. The goal is to {{goal}}. Help me find the bottleneck and optimize it.',
  },
  {
    title: 'Generate a Regex',
    prompt: 'Generate a regular expression to validate `{{input_type}}`. The format requirements are: {{validation_rules}}.',
  },
  {
    title: 'Write a CI/CD Pipeline',
    prompt: 'Create a GitHub Actions pipeline that builds and tests a {{framework}} app, and deploys it to {{deployment_platform}}.',
  },
  {
    title: 'Draft an Email Campaign',
    prompt: 'Draft a 3-part onboarding email campaign for new users of my app, `{{app_name}}`. The audience is `{{target_audience}}`, and the goal is to {{goal}}.',
  },
  {
    title: 'Brainstorm UI Components',
    prompt: 'I’m designing a dashboard for `{{app_type}}`. Brainstorm key UI components and data visualizations for `{{target_user}}`.',
  },
  {
    title: 'Explain a Concept Simply',
    prompt: 'Explain the concept of `{{technical_topic}}` to a non-technical stakeholder using an analogy and plain language.',
  },
  {
    title: 'Create a Blog Outline',
    prompt: 'Create a blog post outline for the topic `{{blog_topic}}`. Include sections for intro, key trends, challenges, and actionable takeaways.',
  },
  {
    title: 'Write a Product Description',
    prompt: 'Write a persuasive product description for `{{product_name}}`, a `{{category}}` that helps users `{{user_goal}}`. Highlight 3 features with engaging tone.',
  },
  {
    title: 'Create a README',
    prompt: 'Write a professional README.md for my open-source project `{{repo_name}}`. It’s a `{{tech_stack}}` project and solves `{{problem_statement}}`.',
  },
  {
    title: 'Generate Unit Tests',
    prompt: 'Generate unit tests in {{language}} for the following function:\n\n```{{function_code}}```',
  },
  {
    title: 'Summarize Codebase',
    prompt: 'Summarize what this codebase does in plain English:\n\n{{codebase_snippet}}',
  },
  {
    title: 'Design System Architecture',
    prompt: 'Design a scalable system architecture for a {{type_of_app}} that supports {{key_requirements}}. Include a diagram layout in markdown.',
  },
  {
    title: 'Token Count Estimation',
    prompt: 'Estimate the token count of the following text for use in an LLM prompt:\n\n```{{prompt_text}}```',
  },
  {
    title: 'Fix Extension Layout',
    prompt: 'Fix the sizing inconsistency in a Chrome Extension UI (800x600px). Some sections are oversized or misaligned. Normalize paddings, ensure everything fits and layout doesn’t shift.',
  },
  {
    title: 'Generate Prompt Template',
    prompt: 'Generate a reusable prompt template for `{{task_type}}` that includes variable placeholders like `{{input_1}}`, `{{input_2}}`, and enforces a clear structure in markdown.',
  },
  {
    title: 'Create a Prompt Optimizer',
    prompt: 'Design an AI prompt refinement workflow that improves prompt clarity, brevity, and structure, while preserving intent. Include support for variable substitution.',
  },
  {
    title: 'Audit Chrome Extension Manifest',
    prompt: 'Review the following `manifest.json` and list any missing permissions, CSP errors, or best practice violations:\n\n```json\n{{manifest_code}}```',
  },
  {
    title: 'Write Performance Benchmarks',
    prompt: 'Create benchmark test cases in `{{language}}` to compare the performance of `{{approach_1}}` vs `{{approach_2}}` in solving the same problem.',
  },
  // ──────────────── SOFTWARE ENGINEERING ────────────────
  {
    title: 'Refactor a Function',
    prompt: 'Refactor this {{language}} function for readability and modularity:\n\n```{{function_code}}```',
  },
  {
    title: 'Document a Code Snippet',
    prompt: 'Add inline comments and a high-level summary to this code in {{language}}:\n\n```{{code}}```',
  },
  {
    title: 'Optimize Algorithm Performance',
    prompt: 'This algorithm is too slow for large inputs. Optimize it for performance in {{language}}:\n\n```{{algorithm_code}}```',
  },
  {
    title: 'Explain Legacy Code',
    prompt: 'Explain the purpose of this legacy code and highlight potential risks or smells:\n\n```{{code}}```',
  },
  {
    title: 'Add TypeScript Types',
    prompt: 'Convert this JavaScript function to TypeScript with strict type annotations:\n\n```{{function_code}}```',
  },
  {
    title: 'Design Scalable Architecture',
    prompt: 'Design a scalable microservices architecture for a {{app_type}} that supports {{requirements}}. Include component boundaries and communication strategies.',
  },

  // ──────────────── DEBUGGING & QA ────────────────
  {
    title: 'Debug UI Bug',
    prompt: 'I’m encountering a UI issue in a {{framework}} app. Describe what could cause this:\n\nIssue: {{issue_description}}\n\nCode:\n```{{code}}```',
  },
  {
    title: 'Find a Memory Leak',
    prompt: 'I suspect a memory leak in my {{language}} app. Here’s the scenario and some code. Help me identify potential leak sources.\n\n```{{code_or_context}}```',
  },
      {
      title: 'Create Test Cases',
      prompt: 'Write unit tests in {{test_framework}} for this function:\n\n```{{function_code}}```',
    },

  // ──────────────── LLM & PROMPT ENGINEERING ────────────────
  {
    title: 'Improve Prompt Clarity',
    prompt: 'Rewrite this prompt to make it more specific, structured, and LLM-friendly:\n\n"{{raw_prompt}}"',
  },
  {
    title: 'Generate Few-Shot Prompt',
    prompt: 'Generate a few-shot example prompt that teaches an LLM to `{{task}}` using 2-3 varied examples.',
  },
  {
    title: 'Design Multi-Step Prompt Chain',
    prompt: 'Design a multi-step prompt chain to complete the task: `{{task}}`. Include the role of each stage, input/output, and how the context is passed.',
  },
  {
    title: 'Estimate Token Count',
    prompt: 'Estimate the GPT token count of the following prompt:\n\n```{{prompt}}```',
  },

  // ──────────────── PRODUCTIVITY & WRITING ────────────────
  {
    title: 'Summarize a Meeting Transcript',
    prompt: 'Summarize this meeting transcript in bullet points. Include action items, decisions, and key concerns:\n\n"{{transcript}}"',
  },
  {
    title: 'Write a Project Update',
    prompt: 'Draft a status update email for a project. Include the current status, recent progress, blockers, and next steps.',
  },
  {
    title: 'Generate Acceptance Criteria',
    prompt: 'Turn this user story into well-structured acceptance criteria using Given/When/Then:\n\n"{{user_story}}"',
  },

  // ──────────────── DESIGN & UI/UX ────────────────
  {
    title: 'Describe a Dashboard Layout',
    prompt: 'Design a layout for a {{type}} dashboard used by {{user_type}}. Include the key visual components and user interactions.',
  },
  {
    title: 'Generate Figma Copy',
    prompt: 'Write microcopy for a user onboarding flow in a Figma prototype for an app called "{{app_name}}".',
  },

  // ──────────────── DEVOPS & AUTOMATION ────────────────
  {
    title: 'Write Dockerfile',
    prompt: 'Write a Dockerfile to containerize a {{language}} application using {{framework}}.',
  },
  {
    title: 'Write GitHub Actions Workflow',
    prompt: 'Create a GitHub Actions CI/CD workflow for a {{language}} app that runs tests, builds the app, and deploys to {{platform}}.',
  },
  {
    title: 'Bash Script Automation',
    prompt: 'Write a bash script to automate: {{task_description}}. It should include error handling and comments.',
  },

  // ──────────────── CHROME EXTENSION-SPECIFIC ────────────────
  {
    title: 'Fix Layout Sizing (Chrome Extension)',
    prompt: 'Fix inconsistent sizing in a 800x600px Chrome Extension popup. Normalize paddings, ensure layout fits without scrollbars, and prevent layout shifts.',
  },
  {
    title: 'Audit manifest.json',
    prompt: 'Review this `manifest.json` file for a Chrome Extension. Identify missing permissions, potential CSP issues, or deprecated keys:\n\n```json\n{{manifest}}```',
  },
  {
    title: 'Simplify Content Script',
    prompt: 'Here\'s a Chrome extension content script. Simplify and document it clearly:\n\n```{{script_code}}```',
  },

  // ──────────────── GENERAL ANALYSIS ────────────────
  {
    title: 'Root Cause Analysis Template',
    prompt: 'Create a template for structured root cause analysis of system failures using the 5 Whys method and post-incident steps.',
  },
  {
    title: 'Compare 2 Technologies',
    prompt: 'Compare `{{tech_1}}` and `{{tech_2}}` for use in a `{{project_type}}`. Include pros, cons, ecosystem maturity, and performance.',
  },
  {
    title: 'Analyze Performance Bottleneck',
    prompt: 'This system is experiencing high latency under load. Help me analyze the possible bottlenecks and suggest investigation points:\n\n{{system_description}}',
  },

  // ──────────────── FRONTEND DEV ────────────────
  {
    title: 'Tailwind Layout Suggestions',
    prompt: 'Suggest a responsive Tailwind CSS layout for a component that {{layout_description}}. Include class suggestions for mobile and desktop views.',
  },
  {
    title: 'Fix React Render Issue',
    prompt: 'Fix a React component that is not rendering correctly due to {{bug_symptom}}. Include hooks, lifecycle, and performance advice.',
  },
  {
    title: 'Convert HTML to React',
    prompt: 'Convert this static HTML to a reusable, styled React component using Tailwind CSS:\n\n```html\n{{html}}```',
  },

  // ──────────────── AI WORKFLOWS & AGENTS ────────────────
  {
    title: 'Design AI Agent Workflow',
    prompt: 'Design a modular multi-agent AI workflow that can perform the task: `{{task}}`. Describe the role of each agent, how they communicate, and any orchestration logic needed.',
  },
  {
    title: 'Prompt Injection Defense',
    prompt: 'How can I protect my app from prompt injection attacks if users are allowed to provide inputs to a LLM system?',
  },
  {
    title: 'Compare LLM APIs',
    prompt: 'Compare OpenAI GPT-4, Anthropic Claude 3, and Gemini 1.5 for building an assistant that needs long context, structured output, and cost-efficiency.',
  },
  {
    title: 'System Prompt for Assistant',
    prompt: 'Write a robust system prompt for a helpful, polite, and consistent AI assistant that supports customer queries for a {{industry}} SaaS product.',
  },
  {
    title: 'Convert Prompt to JSON Schema',
    prompt: 'Convert this unstructured user prompt into a machine-parseable JSON format:\n\n"{{user_prompt}}"',
  },

  // ──────────────── FRONTEND UX ENHANCEMENTS ────────────────
  {
    title: 'Accessibility Improvements',
    prompt: 'Audit this HTML/React component for accessibility issues (WCAG compliance). Suggest ARIA roles, keyboard handling, and screen reader improvements:\n\n```{{component_code}}```',
  },
  {
    title: 'Fix Tailwind Layout Overflow',
    prompt: 'Fix the layout of this Tailwind CSS component that overflows on smaller viewports. Ensure full responsiveness with no scrollbars:\n\n```{{component_code}}```',
  },
  {
    title: 'Add Dark Mode Support',
    prompt: 'Update this UI to support dark mode using Tailwind. Use class-based toggling and ensure contrast meets accessibility standards:\n\n```{{component_code}}```',
  },

  // ──────────────── BACKEND & DEVOPS ────────────────
  {
    title: 'Design REST API Endpoints',
    prompt: 'Design a RESTful API for a {{use_case}} feature. Include routes, request/response examples, and status codes.',
  },
  {
    title: 'Database Schema Suggestions',
    prompt: 'Design a normalized SQL schema for a feature that supports `{{business_logic}}`. Include primary/foreign keys and indexes.',
  },
  {
    title: 'Serverless Function Template',
    prompt: 'Write a serverless function in {{language}} using {{cloud_platform}} that does `{{task}}`. Include error handling and deployment notes.',
  },

  // ──────────────── DOCUMENTATION & COMMUNICATION ────────────────
  {
    title: 'Write Release Notes',
    prompt: 'Write a structured changelog/release note for version {{version}} of our product. Group features into New, Improved, Fixed, and Deprecated.',
  },
  {
    title: 'Summarize GitHub Issue',
    prompt: 'Summarize this GitHub issue into 3 bullet points: context, bug report, and reproduction steps:\n\n"{{issue_text}}"',
  },
  {
    title: 'Create Internal Wiki Page',
    prompt: 'Draft an internal wiki page for the `{{feature}}` module. Include an overview, usage examples, known issues, and owner contacts.',
  },

  // ──────────────── SAAS / STARTUP OPS ────────────────
  {
    title: 'Write a Product Strategy Brief',
    prompt: 'Write a 1-page product strategy for `{{product_name}}` focused on solving `{{user_pain_point}}` for `{{target_segment}}`. Include positioning, KPIs, and roadmap themes.',
  },
  {
    title: 'Draft Terms of Service',
    prompt: 'Generate a basic Terms of Service for a SaaS web app called `{{app_name}}` that handles user data, subscriptions, and AI-based content.',
  },
  {
    title: 'Product Onboarding Checklist',
    prompt: 'Create a product onboarding checklist for `{{app_name}}`. Focus on reducing friction for first-time users and guiding them to activation.',
  },

  // ──────────────── CAREER & GROWTH ────────────────
  {
    title: 'Improve Resume Bullet',
    prompt: 'Rewrite this resume bullet to be more impactful. Focus on results and metrics:\n\n"{{resume_line}}"',
  },
  {
    title: 'Answer System Design Interview',
    prompt: 'How would you design {{system_name}}? Include architecture, scalability, failure handling, and tradeoffs.',
  },
  {
    title: 'Mock Interview Feedback',
    prompt: 'Give structured feedback on this mock interview answer. Score communication, technical depth, and structure:\n\n"{{response}}"',
  },
  {
    title: 'Career Growth Plan (Dev → Lead)',
    prompt: 'Create a 6-month technical and leadership development plan for a senior developer aiming to become a tech lead.',
  },

  // ──────────────── COPYWRITING / GROWTH ────────────────
  {
    title: 'Generate Social Post',
    prompt: 'Write a LinkedIn post announcing our new feature: {{feature}}. Highlight benefits and include a soft CTA.',
  },
  {
    title: 'SEO Blog Outline',
    prompt: 'Create an SEO-optimized blog outline for the keyword "{{keyword}}". Include meta description, intro, H2s, and conclusion.',
  },
  {
    title: 'Landing Page Copy',
    prompt: 'Write landing page copy for a SaaS tool called `{{tool_name}}` that helps `{{audience}}` solve `{{pain_point}}`. Include a headline, 3 benefits, and CTA.',
  },

  // ──────────────── AI TOOLING / DEV EXPERIENCE ────────────────
  {
    title: 'Build Prompt Templates',
    prompt: 'Create reusable LLM prompt templates for `{{workflow}}`, including variable placeholders, guardrails, and role instructions.',
  },
  {
    title: 'Convert Logs to Trace Timeline',
    prompt: 'Convert these system logs into a high-level step-by-step trace timeline:\n\n"{{log_data}}"',
  },
  {
    title: 'Token Budgeting Strategy',
    prompt: 'Design a token budgeting strategy for an app using GPT-4-32k. Include prompt limits, history trimming, and cost control ideas.',
  }
];