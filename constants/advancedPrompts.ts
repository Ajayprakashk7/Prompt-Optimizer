// Advanced Prompt Engineering Techniques for 2024
// Implementing Chain-of-Thought, Tree-of-Thought, and CO-STAR frameworks

export const CHAIN_OF_THOUGHT_PATTERNS = {
  analytical: `
**Chain-of-Thought Reasoning:**
Let me think through this step by step:
1. **Problem Analysis**: What exactly needs to be solved?
2. **Context Evaluation**: What information is available?
3. **Strategy Selection**: What's the best approach?
4. **Solution Development**: How should I proceed?
5. **Validation**: Does this make sense?`,

  creative: `
**Creative Reasoning Process:**
Let me approach this creatively:
1. **Divergent Thinking**: What are all possible approaches?
2. **Pattern Recognition**: What similar problems exist?
3. **Innovation Synthesis**: How can I combine ideas uniquely?
4. **Feasibility Check**: What's actually achievable?
5. **Refinement**: How can I improve this solution?`,

  technical: `
**Technical Analysis Framework:**
Breaking this down systematically:
1. **Requirements Analysis**: What are the exact specifications?
2. **Constraint Identification**: What limitations exist?
3. **Solution Architecture**: How should this be structured?
4. **Implementation Planning**: What's the execution strategy?
5. **Quality Assurance**: How will I validate the result?`
};

export const TREE_OF_THOUGHT_STRUCTURE = `
**Multi-Path Reasoning Analysis:**

**Path A - Conservative Approach:**
- Strategy: [Safe, proven method]
- Pros: [Low risk, reliable]
- Cons: [May be slower, less innovative]
- Success Probability: [High/Medium/Low]

**Path B - Innovative Approach:**
- Strategy: [Creative, cutting-edge method]
- Pros: [High impact, efficient]
- Cons: [Higher risk, unproven]
- Success Probability: [High/Medium/Low]

**Path C - Hybrid Solution:**
- Strategy: [Balanced combination]
- Pros: [Balanced risk/reward]
- Cons: [May be complex]
- Success Probability: [High/Medium/Low]

**Evaluation Matrix:**
| Criteria | Path A | Path B | Path C |
|----------|--------|--------|--------|
| Feasibility | [Score] | [Score] | [Score] |
| Risk Level | [Score] | [Score] | [Score] |
| Innovation | [Score] | [Score] | [Score] |
| Efficiency | [Score] | [Score] | [Score] |

**Selected Path:** [Choose best option with detailed reasoning]
**Fallback Plan:** [Alternative if primary path fails]`;

export const COSTAR_FRAMEWORK = `
**CO-STAR Framework Analysis:**

**C - Context:**
- **Situation**: [Current state and background]
- **Environment**: [Technical/business context]
- **Stakeholders**: [Who's involved and their needs]
- **Constraints**: [Limitations and boundaries]

**O - Objective:**
- **Primary Goal**: [Main objective to achieve]
- **Success Metrics**: [How to measure success]
- **Deliverables**: [Expected outputs]
- **Timeline**: [When this needs to be completed]

**S - Style:**
- **Approach**: [Methodology to use]
- **Format**: [Structure and presentation]
- **Depth**: [Level of detail required]
- **Perspective**: [Viewpoint to take]

**T - Tone:**
- **Communication Style**: [Professional/casual/technical]
- **Audience Level**: [Beginner/intermediate/expert]
- **Formality**: [Formal/informal/conversational]
- **Urgency**: [Critical/important/routine]

**A - Audience:**
- **Primary Users**: [Main target audience]
- **Expertise Level**: [Technical background]
- **Expectations**: [What they need to know]
- **Context**: [Their situation and needs]

**R - Response:**
- **Format**: [Specific output structure]
- **Length**: [Detailed/concise/comprehensive]
- **Components**: [Required sections/elements]
- **Validation**: [Quality checks and criteria]`;

export const METACOGNITIVE_ARCHITECTURE = `
**Advanced Metacognitive Processing:**

**Layer 1 - Task Comprehension:**
1. **Intent Recognition**: What is the user really trying to achieve?
2. **Complexity Assessment**: How difficult is this task?
3. **Domain Identification**: What field/expertise is required?
4. **Success Criteria**: How will we know if this is successful?

**Layer 2 - Strategy Selection:**
1. **Pattern Matching**: What similar problems have I solved?
2. **Method Evaluation**: Which approach is most suitable?
3. **Resource Assessment**: What tools/knowledge do I need?
4. **Risk Analysis**: What could go wrong?

**Layer 3 - Execution Planning:**
1. **Step Sequencing**: What's the optimal order of operations?
2. **Checkpoint Definition**: Where should I validate progress?
3. **Contingency Planning**: What if something doesn't work?
4. **Quality Gates**: How will I ensure excellence?

**Layer 4 - Continuous Monitoring:**
1. **Progress Tracking**: Am I on the right path?
2. **Quality Assessment**: Is this meeting standards?
3. **Adaptation Triggers**: When should I change approach?
4. **Improvement Opportunities**: How can I do better?`;

export const ADVANCED_REASONING_PATTERNS = {
  deductive: `
**Deductive Reasoning Pattern:**
- **General Principle**: [Universal rule or law]
- **Specific Case**: [Particular instance]
- **Logical Conclusion**: [What must be true]
- **Validation**: [Verify the logic chain]`,

  inductive: `
**Inductive Reasoning Pattern:**
- **Observations**: [Specific instances and data]
- **Pattern Recognition**: [Common elements]
- **Hypothesis Formation**: [Proposed general rule]
- **Confidence Level**: [Strength of evidence]`,

  abductive: `
**Abductive Reasoning Pattern:**
- **Observation**: [What we see/know]
- **Possible Explanations**: [Candidate theories]
- **Best Explanation**: [Most likely cause]
- **Testing Strategy**: [How to validate]`,

  analogical: `
**Analogical Reasoning Pattern:**
- **Source Domain**: [Known, similar situation]
- **Target Domain**: [Current problem]
- **Mapping**: [How they correspond]
- **Inference**: [What we can conclude]`
};

export const QUALITY_VALIDATION_FRAMEWORK = `
**Multi-Dimensional Quality Assessment:**

**Clarity Evaluation:**
- Is the instruction unambiguous?
- Are technical terms properly defined?
- Is the expected output clear?
- Score: [0-100]

**Completeness Check:**
- Are all necessary details included?
- Are edge cases considered?
- Is context sufficient?
- Score: [0-100]

**Specificity Analysis:**
- Are requirements precise?
- Are examples provided where helpful?
- Are constraints clearly stated?
- Score: [0-100]

**Effectiveness Prediction:**
- Will this achieve the desired outcome?
- Is the approach optimal?
- Are there better alternatives?
- Score: [0-100]

**Overall Quality Score:** [Average of all dimensions]
**Improvement Recommendations:** [Specific suggestions]`;

export const SELF_REFLECTION_PROTOCOL = `
**Self-Reflection and Improvement Loop:**

**Pre-Execution Reflection:**
1. **Assumption Check**: What am I assuming about this task?
2. **Bias Identification**: What biases might affect my approach?
3. **Knowledge Gaps**: What don't I know that I should?
4. **Alternative Perspectives**: How might others approach this?

**Mid-Execution Monitoring:**
1. **Progress Assessment**: Am I making good progress?
2. **Quality Check**: Is this meeting my standards?
3. **Course Correction**: Should I adjust my approach?
4. **Stakeholder Alignment**: Does this match expectations?

**Post-Execution Analysis:**
1. **Outcome Evaluation**: Did I achieve the objective?
2. **Process Review**: What worked well/poorly?
3. **Learning Extraction**: What can I learn from this?
4. **Future Improvement**: How can I do better next time?`;
