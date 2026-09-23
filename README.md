# 🧠 Prompt Optimizer

> AI-assisted prompt engineering tool for turning vague instructions into clearer, more structured prompts.

## Concept

Good prompts are not only about adding more words. They need clear goals, context, constraints, output requirements, and evaluation criteria.

This project explores an interface where a user provides a rough prompt and an AI model helps transform it into a more explicit, reusable instruction.

## Intended Flow

```text
Raw Prompt
    ↓
Prompt Analysis
    ├── Goal
    ├── Context
    ├── Constraints
    └── Output Format
    ↓
Optimized Prompt
    ↓
Improvement Explanation
```

## Current Status

**Experimental / work in progress.**

The current repository originated from an AI Studio starter application. The README is intentionally kept clear about the project's current maturity rather than presenting the starter implementation as a finished product.

## Local Development

### Prerequisites

- Node.js
- Gemini API key

### Setup

```bash
git clone https://github.com/Ajayprakashk7/Prompt-Optimizer.git
cd Prompt-Optimizer

npm install
```

Create `.env.local` and configure your Gemini API key.

```bash
npm run dev
```

## Planned Engineering Improvements

- Prompt version history.
- Side-by-side before/after comparison.
- Structured prompt scoring.
- Model comparison.
- Evaluation datasets.
- Export / sharing.
- API endpoint for programmatic optimization.

## Author

**Ajay Prakash** · [Portfolio](https://ajayprakash.dev) · [GitHub](https://github.com/Ajayprakashk7)
