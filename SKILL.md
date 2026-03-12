---
name: deepseek-llm
description: Run DeepSeek V3.2 LLM via Atlas Cloud API for coding, reasoning, and analysis. 685B parameter model at $0.26/M tokens with 164K context. Use when user asks to "analyze code with DeepSeek" or "use DeepSeek for reasoning".
---
# DeepSeek LLM Skill — Claude Code Integration

## What This Tool Does

`deepseek` runs DeepSeek V3.2 LLM via Atlas Cloud API for coding, reasoning, and analysis tasks. It supports chat completion, streaming, file context injection, and a dedicated code review mode.

## When to Use

Activate this skill when the user:
- Asks to "analyze code", "review code", "explain code", or "debug" using DeepSeek
- Mentions "deepseek" by name
- Wants a second opinion on code from a different LLM
- Needs complex reasoning (use R1 model)
- Asks for code generation, refactoring, or documentation using DeepSeek

## Command Format

```bash
deepseek "<prompt>" [options]
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--model <model>` | Model identifier | `deepseek-ai/deepseek-v3.2` |
| `--system <prompt>` | Custom system prompt | — |
| `--temperature <temp>` | Sampling temperature (0.0-2.0) | `0.7` |
| `--max-tokens <n>` | Maximum response tokens | `4096` |
| `--stream` | Enable real-time streaming output | off |
| `--file <path>` | Read file and include as context | — |
| `--code` | Code-focused mode with optimized system prompt | off |
| `--top-p <p>` | Nucleus sampling threshold | `1.0` |

## Available Models

- `deepseek-ai/deepseek-v3.2` — Latest flagship, best overall ($0.26/$0.38 per M tokens)
- `deepseek-ai/deepseek-v3.2-fast` — Lower latency variant
- `deepseek-ai/deepseek-v3.2-speciale` — Enhanced instruction following
- `deepseek-ai/deepseek-v3.2-exp` — Experimental features
- `deepseek-ai/deepseek-r1-0528` — Reasoning model with chain-of-thought ($0.50/$2.18 per M tokens)
- `deepseek-ai/deepseek-v3.1` — Previous generation, proven reliability
- `deepseek-ai/deepseek-ocr` — OCR-optimized

## Example Commands

```bash
# Simple question
deepseek "What is the time complexity of quicksort?"

# Code review with file context
deepseek "Review this code for bugs and improvements" --file ./src/auth.ts --code

# Streaming response
deepseek "Explain microservices architecture" --stream

# Complex reasoning with R1
deepseek "Solve this optimization problem step by step" --model deepseek-ai/deepseek-r1-0528

# Custom system prompt
deepseek "Audit this file" --system "You are a security expert" --file ./app.js

# Low temperature for deterministic output
deepseek "Convert this JSON to TypeScript types" --file ./data.json --temperature 0 --code
```

## Decision Guide

- **Code review/generation**: Always use `--code` flag
- **File analysis**: Always use `--file <path>` to inject file content
- **Long responses**: Use `--stream` for real-time output
- **Complex reasoning**: Switch to `--model deepseek-ai/deepseek-r1-0528`
- **Deterministic output**: Set `--temperature 0`
- **Creative tasks**: Set `--temperature 1.0` or higher

## Environment

Requires `ATLAS_API_KEY` environment variable. If not set, instruct the user to:
1. Get an API key at https://www.atlascloud.ai
2. Set it: `export ATLAS_API_KEY=your_key_here`
