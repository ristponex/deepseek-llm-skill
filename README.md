# DeepSeek LLM Skill

An AI Agent Skill for running DeepSeek V3.2 LLM via Atlas Cloud API — coding, reasoning, analysis at $0.26/M input tokens. Access DeepSeek's powerful language models directly from your terminal with streaming support, file context injection, and dedicated code analysis modes.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![AI Agent Skill](https://img.shields.io/badge/AI_Agent-Skill-purple.svg)](https://github.com/thoughtincode/deepseek-llm-skill)

---

## Table of Contents

- [Features](#features)
- [Model Variants](#model-variants)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Basic Chat](#basic-chat)
  - [Streaming](#streaming)
  - [Code Mode](#code-mode)
  - [File Context](#file-context)
  - [System Prompts](#system-prompts)
- [Agent Skill Integration](#agent-skill-integration)
- [Use Cases](#use-cases)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Examples](#examples)
- [Pricing](#pricing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- **Chat Completion** — Send prompts and receive high-quality responses from DeepSeek V3.2, one of the most capable open-weight LLMs
- **Streaming Output** — Real-time token streaming via Server-Sent Events for responsive interactive sessions
- **Code Generation** — Dedicated code mode with optimized system prompts for writing, reviewing, and debugging code
- **Reasoning & Analysis** — Access DeepSeek R1-0528 for complex multi-step reasoning tasks with chain-of-thought
- **164K Context Window** — Process massive documents, entire codebases, or long conversation histories
- **OpenAI-Compatible API** — Drop-in replacement using the familiar chat completions API format
- **File Context Injection** — Read local files and inject them as context for code review, analysis, or Q&A
- **Agent Skill** — Works with 15+ AI coding agents including Claude Code, Cursor, OpenAI Codex, GitHub Copilot, Gemini CLI, Windsurf, OpenCode, Kiro, and more
- **Multiple Model Variants** — Choose between speed, capability, and cost across 7 model options
- **Temperature Control** — Fine-tune response creativity from deterministic (0.0) to highly creative (2.0)

---

## Model Variants

DeepSeek offers a powerful lineup of language models accessible through Atlas Cloud:

| Model | Context | Input Price | Output Price | Description |
|-------|---------|-------------|--------------|-------------|
| **DeepSeek V3.2** | 164K | $0.26/M | $0.38/M | Latest flagship model — best overall performance |
| **DeepSeek V3.2 Fast** | 164K | $0.26/M | $0.38/M | Optimized for lower latency with equivalent quality |
| **DeepSeek V3.2 Speciale** | 164K | $0.26/M | $0.38/M | Specialized variant with enhanced instruction following |
| **DeepSeek V3.2 Exp** | 164K | $0.26/M | $0.38/M | Experimental features and cutting-edge capabilities |
| **DeepSeek R1-0528** | 164K | $0.50/M | $2.18/M | Reasoning model with chain-of-thought for complex tasks |
| **DeepSeek V3.1** | 164K | $0.26/M | $0.38/M | Previous generation with proven production reliability |
| **DeepSeek OCR** | 164K | $0.26/M | $0.38/M | Optimized for optical character recognition tasks |

### Model ID Mapping

```
deepseek-ai/deepseek-v3.2           → DeepSeek V3.2
deepseek-ai/deepseek-v3.2-fast      → DeepSeek V3.2 Fast
deepseek-ai/deepseek-v3.2-speciale  → DeepSeek V3.2 Speciale
deepseek-ai/deepseek-v3.2-exp       → DeepSeek V3.2 Exp
deepseek-ai/deepseek-r1-0528        → DeepSeek R1-0528 (Reasoning)
deepseek-ai/deepseek-v3.1           → DeepSeek V3.1
deepseek-ai/deepseek-ocr            → DeepSeek OCR
```

---

## Installation

### Prerequisites

- Node.js 18+ and npm
- An Atlas Cloud API key ([get one here](https://www.atlascloud.ai?ref=JPM683&utm_source=github&utm_campaign=deepseek-llm-skill))

### Install from Source

```bash
git clone https://github.com/thoughtincode/deepseek-llm-skill.git
cd deepseek-llm-skill
npm install
npm run build
npm link
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env and add your Atlas Cloud API key
```

---

## Quick Start

```bash
# Simple chat
deepseek "What is the time complexity of merge sort?"

# Stream the response in real-time
deepseek "Explain quantum entanglement" --stream

# Code review mode
deepseek "Review this code for bugs" --file ./src/main.ts --code

# Use the reasoning model for complex problems
deepseek "Prove that the square root of 2 is irrational" --model deepseek-ai/deepseek-r1-0528
```

---

## Usage

### Basic Chat

Send a prompt and receive a complete response:

```bash
# Simple question
deepseek "What are the main differences between REST and GraphQL?"

# Detailed analysis
deepseek "Compare the performance characteristics of B-trees vs. LSM-trees for database indexing"

# Creative writing
deepseek "Write a short story about an AI that discovers music" --temperature 1.2
```

### Streaming

Enable real-time token streaming for responsive output:

```bash
# Stream a long response
deepseek "Write a comprehensive guide to Docker networking" --stream

# Stream with custom temperature
deepseek "Generate 10 creative startup ideas for AI in healthcare" --stream --temperature 0.9
```

### Code Mode

Activate code-focused mode with an optimized system prompt:

```bash
# Generate code
deepseek "Write a Python function to find the longest palindromic substring" --code

# Debug code
deepseek "Why does this function return undefined for empty arrays?" --code --file ./utils.js

# Architecture advice
deepseek "Design a microservices architecture for an e-commerce platform" --code
```

### File Context

Read local files and include them as context:

```bash
# Code review
deepseek "Review this code for security vulnerabilities" --file ./src/auth.ts

# Explain code
deepseek "Explain what this code does step by step" --file ./algorithm.py

# Suggest improvements
deepseek "How can I optimize this database query?" --file ./queries.sql

# Multiple concerns
deepseek "Check for memory leaks and race conditions" --file ./server.go --code
```

### System Prompts

Customize the AI's behavior with system prompts:

```bash
# Technical writer persona
deepseek "Document the API endpoints in this file" --system "You are a senior technical writer. Write clear, concise API documentation with examples." --file ./routes.ts

# Security auditor
deepseek "Audit this code" --system "You are a security expert. Focus on OWASP Top 10 vulnerabilities." --file ./app.js

# Tutor mode
deepseek "Explain recursion" --system "You are a patient CS teacher. Use simple analogies and build up from basics."
```

### Advanced Options

```bash
# Control response length
deepseek "Summarize this paper" --file ./paper.txt --max-tokens 500

# Deterministic output
deepseek "Convert this JSON to a TypeScript interface" --file ./data.json --temperature 0

# Use specific model
deepseek "Analyze this dataset" --model deepseek-ai/deepseek-v3.2-fast --file ./data.csv
```

---

## Agent Skill Integration

This tool is designed to work as an **AI agent skill** compatible with 15+ coding agents including Claude Code, Cursor, OpenAI Codex, GitHub Copilot, Gemini CLI, Windsurf, OpenCode, Kiro, and more. Once installed and linked, your AI agent can invoke it directly when you ask for code analysis, review, or DeepSeek-powered tasks.

### How It Works

1. Install the skill (see [Installation](#installation))
2. Your AI agent reads the skill configuration file (e.g., `CLAUDE.md`, `.cursorrules`, or equivalent) to understand available commands
3. When you ask for code review, analysis, or invoke DeepSeek, the agent constructs and runs the `deepseek` command

### Example Conversations

```
You: Use DeepSeek to review my authentication module

Claude: I'll analyze your auth module with DeepSeek.
> deepseek "Review this authentication module for security vulnerabilities,
  race conditions, and best practices compliance" --file ./src/auth.ts --code

[DeepSeek analysis output...]
```

```
You: Explain this complex algorithm using DeepSeek

Claude: I'll have DeepSeek explain the algorithm step by step.
> deepseek "Explain this algorithm in detail, including time and space
  complexity analysis" --file ./src/algorithm.ts --code --stream

[Streaming explanation...]
```

```
You: Use the reasoning model to solve this optimization problem

Claude: I'll use DeepSeek R1 for this complex reasoning task.
> deepseek "Find the optimal solution for this scheduling problem
  and prove its correctness" --model deepseek-ai/deepseek-r1-0528
  --file ./problem.txt

[Chain-of-thought reasoning output...]
```

---

## Use Cases

### Code Review

```bash
# Comprehensive review
deepseek "Perform a thorough code review. Check for bugs, security issues, performance problems, and suggest improvements" --file ./src/api.ts --code

# PR review
deepseek "Review this diff for potential issues" --file ./changes.diff --code
```

### Bug Analysis

```bash
# Debug error
deepseek "This function throws 'Cannot read property of undefined' on line 42. Why?" --file ./broken.js --code

# Trace logic error
deepseek "The output is incorrect for edge cases. Find the bug" --file ./calculator.py --code
```

### Documentation

```bash
# Generate docs
deepseek "Generate comprehensive JSDoc comments for all exported functions" --file ./lib.ts --code

# API documentation
deepseek "Create OpenAPI/Swagger documentation for these endpoints" --file ./routes.ts --code
```

### Data Analysis

```bash
# Analyze CSV structure
deepseek "Analyze this dataset. Describe the schema, identify patterns, and suggest queries" --file ./sales.csv

# SQL optimization
deepseek "Optimize these SQL queries for better performance" --file ./queries.sql --code
```

### Translation

```bash
# Technical translation
deepseek "Translate this README to Japanese while preserving technical accuracy" --file ./README.md

# Code comments
deepseek "Translate all comments in this file from Chinese to English" --file ./legacy.py --code
```

---

## API Reference

### Chat Completions

```
POST https://api.atlascloud.ai/v1/chat/completions
```

**Headers:**
```
Authorization: Bearer <ATLAS_API_KEY>
Content-Type: application/json
```

**Request Body:**
```json
{
  "model": "deepseek-ai/deepseek-v3.2",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Explain the CAP theorem"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 4096,
  "stream": false,
  "top_p": 1.0
}
```

**Response (non-streaming):**
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "deepseek-ai/deepseek-v3.2",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The CAP theorem states that..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 150,
    "total_tokens": 175
  }
}
```

**Response (streaming):**
```
data: {"id":"chatcmpl-abc123","choices":[{"delta":{"content":"The"},"index":0}]}

data: {"id":"chatcmpl-abc123","choices":[{"delta":{"content":" CAP"},"index":0}]}

data: {"id":"chatcmpl-abc123","choices":[{"delta":{"content":" theorem"},"index":0}]}

data: [DONE]
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `model` | string | Yes | — | Model identifier (see [Model Variants](#model-variants)) |
| `messages` | array | Yes | — | Array of message objects with `role` and `content` |
| `temperature` | number | No | `0.7` | Sampling temperature (0.0 - 2.0) |
| `max_tokens` | number | No | `4096` | Maximum tokens in response |
| `stream` | boolean | No | `false` | Enable Server-Sent Events streaming |
| `top_p` | number | No | `1.0` | Nucleus sampling threshold |

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ATLAS_API_KEY` | Yes | Your Atlas Cloud API key |

### CLI Options

```
Usage: deepseek [options] <prompt>

Arguments:
  prompt                      The prompt or question to send

Options:
  --model <model>             Model identifier (default: deepseek-ai/deepseek-v3.2)
  --system <prompt>           System prompt to set behavior
  --temperature <temp>        Sampling temperature 0.0-2.0 (default: 0.7)
  --max-tokens <n>            Maximum response tokens (default: 4096)
  --stream                    Enable streaming output
  --file <path>               Read file and include as context
  --code                      Enable code-focused mode with optimized system prompt
  --top-p <p>                 Nucleus sampling threshold (default: 1.0)
  -h, --help                  Show help
  -v, --version               Show version
```

---

## Examples

### Coding Tasks

```bash
# Write a complete implementation
deepseek "Implement a thread-safe LRU cache in Rust with O(1) get/put operations" --code

# Convert between languages
deepseek "Convert this Python code to idiomatic Go" --file ./script.py --code

# Write tests
deepseek "Write comprehensive unit tests for this module using Jest" --file ./utils.ts --code

# Refactor
deepseek "Refactor this code to use the strategy pattern" --file ./handler.ts --code --stream
```

### Analysis & Reasoning

```bash
# Complex reasoning with R1
deepseek "Analyze the time complexity of this algorithm and suggest optimizations" \
  --model deepseek-ai/deepseek-r1-0528 --file ./sort.py --code

# Architecture analysis
deepseek "Evaluate this microservices architecture for scalability bottlenecks" --file ./arch.md

# Data interpretation
deepseek "Interpret these benchmark results and explain the performance differences" --file ./benchmarks.json
```

### Productivity

```bash
# Summarize documents
deepseek "Summarize the key points of this document in bullet points" --file ./report.pdf --max-tokens 500

# Generate commit messages
deepseek "Write a conventional commit message for these changes" --file ./changes.diff

# Email drafting
deepseek "Draft a professional email declining this meeting request while suggesting alternatives" --temperature 0.5
```

### Creative

```bash
# Writing assistance
deepseek "Continue this story from where it left off, maintaining the same tone and style" \
  --file ./story.txt --temperature 1.0

# Brainstorming
deepseek "Generate 20 unique feature ideas for a fitness app targeting seniors" --temperature 1.2 --stream
```

---

## Pricing

All pricing is per million tokens through Atlas Cloud:

| Model | Input (per M tokens) | Output (per M tokens) |
|-------|---------------------|----------------------|
| DeepSeek V3.2 | $0.26 | $0.38 |
| DeepSeek V3.2 Fast | $0.26 | $0.38 |
| DeepSeek V3.2 Speciale | $0.26 | $0.38 |
| DeepSeek V3.2 Exp | $0.26 | $0.38 |
| DeepSeek R1-0528 | $0.50 | $2.18 |
| DeepSeek V3.1 | $0.26 | $0.38 |
| DeepSeek OCR | $0.26 | $0.38 |

> **Cost Comparison:** DeepSeek V3.2 at $0.26/M input tokens is one of the most cost-effective frontier-class LLMs available, offering GPT-4 class performance at a fraction of the cost.

---

## Troubleshooting

### Common Issues

**API Key Not Found**
```
Error: ATLAS_API_KEY environment variable is not set
```
Solution: Copy `.env.example` to `.env` and add your API key, or export it directly:
```bash
export ATLAS_API_KEY=your_key_here
```

**Context Too Long**
```
Error: Maximum context length exceeded
```
Solution: The model supports 164K tokens, but very large files may exceed this. Try:
- Sending only relevant portions of the file
- Using `--max-tokens` to limit output
- Splitting large files into sections

**Rate Limited**
```
Error: Rate limit exceeded (429)
```
Solution: Wait a few seconds and retry. Consider upgrading your Atlas Cloud tier for higher rate limits.

**Stream Connection Dropped**
```
Error: Stream connection closed unexpectedly
```
Solution: This can happen with very long responses. Try without `--stream` flag, or reduce `--max-tokens`.

**File Not Found**
```
Error: File not found: ./src/main.ts
```
Solution: Ensure the file path is correct relative to your current working directory. Use absolute paths if needed.

### Getting Help

- Open an issue on [GitHub](https://github.com/thoughtincode/deepseek-llm-skill/issues)
- Check [Atlas Cloud documentation](https://docs.atlascloud.ai)

---

## Take This to Production Today

This workflow is optimized for Atlas Cloud. Move from experiment to enterprise-ready scale.

- **Production-Ready**: Hosted DeepSeek deployments at only $0.26/M input tokens
- **Zero Maintenance**: Serverless architecture — focus on your product, not the servers
- **Enterprise Security**: SOC I & II Certified | HIPAA Compliant
- **25% Bonus**: First recharge up to $100

[Start Building on Atlas Cloud](https://www.atlascloud.ai?ref=JPM683&utm_source=github&utm_campaign=deepseek-llm-skill)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Acknowledgments

- [DeepSeek](https://deepseek.com) for the groundbreaking open-weight language models
- [Atlas Cloud](https://www.atlascloud.ai?ref=JPM683&utm_source=github&utm_campaign=deepseek-llm-skill) for the API infrastructure
- [Claude Code](https://claude.ai/code) for the skill integration framework, and the broader AI coding agent ecosystem for cross-platform compatibility

---

*Built with DeepSeek via [Atlas Cloud](https://www.atlascloud.ai?ref=JPM683&utm_source=github&utm_campaign=deepseek-llm-skill)*
