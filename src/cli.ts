#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  }
}

// Constants
const API_BASE = "https://api.atlascloud.ai";
const CHAT_ENDPOINT = "/v1/chat/completions";
const DEFAULT_MODEL = "deepseek-ai/deepseek-v3.2";
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TOP_P = 1.0;

// Code mode system prompt
const CODE_SYSTEM_PROMPT = `You are an expert software engineer and code analyst. When reviewing code:
1. Identify bugs, security vulnerabilities, and performance issues
2. Suggest concrete improvements with code examples
3. Follow best practices and idiomatic patterns for the language
4. Consider edge cases, error handling, and maintainability
5. Be specific and actionable in your feedback

When generating code:
1. Write clean, well-documented, production-ready code
2. Include error handling and input validation
3. Follow language-specific conventions and best practices
4. Add relevant comments explaining non-obvious logic
5. Consider performance and scalability`;

// Available models for reference
const AVAILABLE_MODELS = [
  "deepseek-ai/deepseek-v3.2",
  "deepseek-ai/deepseek-v3.2-fast",
  "deepseek-ai/deepseek-v3.2-speciale",
  "deepseek-ai/deepseek-v3.2-exp",
  "deepseek-ai/deepseek-r1-0528",
  "deepseek-ai/deepseek-v3.1",
  "deepseek-ai/deepseek-ocr",
];

// Parse command line arguments
interface CliArgs {
  prompt: string;
  model: string;
  system: string | null;
  temperature: number;
  maxTokens: number;
  stream: boolean;
  file: string | null;
  code: boolean;
  topP: number;
  help: boolean;
  version: boolean;
}

function printHelp(): void {
  console.log(`
Usage: deepseek [options] <prompt>

Run DeepSeek V3.2 LLM via Atlas Cloud API for coding, reasoning, and analysis.

Arguments:
  prompt                      The prompt or question to send

Options:
  --model <model>             Model identifier (default: deepseek-ai/deepseek-v3.2)
  --system <prompt>           System prompt to set behavior
  --temperature <temp>        Sampling temperature 0.0-2.0 (default: 0.7)
  --max-tokens <n>            Maximum response tokens (default: 4096)
  --stream                    Enable streaming output via SSE
  --file <path>               Read file and include as context
  --code                      Enable code-focused mode with optimized system prompt
  --top-p <p>                 Nucleus sampling threshold (default: 1.0)
  -h, --help                  Show this help message
  -v, --version               Show version number

Models:
  deepseek-ai/deepseek-v3.2           Latest flagship ($0.26/$0.38 per M tokens)
  deepseek-ai/deepseek-v3.2-fast      Low latency variant
  deepseek-ai/deepseek-v3.2-speciale  Enhanced instruction following
  deepseek-ai/deepseek-v3.2-exp       Experimental features
  deepseek-ai/deepseek-r1-0528        Reasoning model ($0.50/$2.18 per M tokens)
  deepseek-ai/deepseek-v3.1           Previous generation
  deepseek-ai/deepseek-ocr            OCR-optimized

Examples:
  deepseek "What is merge sort?"
  deepseek "Explain this code" --file ./main.ts --code
  deepseek "Write a REST API in Go" --code --stream
  deepseek "Prove P != NP" --model deepseek-ai/deepseek-r1-0528
`);
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    prompt: "",
    model: DEFAULT_MODEL,
    system: null,
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
    stream: false,
    file: null,
    code: false,
    topP: DEFAULT_TOP_P,
    help: false,
    version: false,
  };

  const rawArgs = argv.slice(2);
  const positional: string[] = [];

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    switch (arg) {
      case "-h":
      case "--help":
        args.help = true;
        break;
      case "-v":
      case "--version":
        args.version = true;
        break;
      case "--model":
        args.model = rawArgs[++i];
        break;
      case "--system":
        args.system = rawArgs[++i];
        break;
      case "--temperature":
        args.temperature = parseFloat(rawArgs[++i]);
        break;
      case "--max-tokens":
        args.maxTokens = parseInt(rawArgs[++i], 10);
        break;
      case "--stream":
        args.stream = true;
        break;
      case "--file":
        args.file = rawArgs[++i];
        break;
      case "--code":
        args.code = true;
        break;
      case "--top-p":
        args.topP = parseFloat(rawArgs[++i]);
        break;
      default:
        if (!arg.startsWith("-")) {
          positional.push(arg);
        } else {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }

  args.prompt = positional.join(" ");
  return args;
}

// Read file content for context injection
function readFileContext(filePath: string): string {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`Error: File not found: ${resolved}`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolved, "utf-8");
  const ext = path.extname(resolved).slice(1);
  const filename = path.basename(resolved);

  return `\n\n--- File: ${filename} ---\n\`\`\`${ext}\n${content}\n\`\`\`\n`;
}

// Build messages array from arguments
function buildMessages(args: CliArgs): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = [];

  // System prompt: explicit > code mode > none
  if (args.system) {
    messages.push({ role: "system", content: args.system });
  } else if (args.code) {
    messages.push({ role: "system", content: CODE_SYSTEM_PROMPT });
  }

  // Build user message with optional file context
  let userContent = args.prompt;
  if (args.file) {
    const fileContext = readFileContext(args.file);
    userContent = `${args.prompt}${fileContext}`;
  }

  messages.push({ role: "user", content: userContent });
  return messages;
}

// Non-streaming HTTP request
function requestJSON(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === "https:" ? https : http;

    const req = protocol.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let body = "";
        res.on("data", (chunk: Buffer) => (body += chunk.toString()));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode || 0, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode || 0, data: body });
          }
        });
      }
    );

    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

// Streaming HTTP request with SSE parsing
function requestStream(
  url: string,
  options: {
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === "https:" ? https : http;

    const req = protocol.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "POST",
        headers: options.headers || {},
      },
      (res) => {
        if (res.statusCode !== 200) {
          let errorBody = "";
          res.on("data", (chunk: Buffer) => (errorBody += chunk.toString()));
          res.on("end", () => {
            try {
              const errData = JSON.parse(errorBody);
              reject(new Error(`API error (${res.statusCode}): ${JSON.stringify(errData)}`));
            } catch {
              reject(new Error(`API error (${res.statusCode}): ${errorBody}`));
            }
          });
          return;
        }

        let fullContent = "";
        let buffer = "";

        res.on("data", (chunk: Buffer) => {
          buffer += chunk.toString();

          // Process complete SSE lines
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith(":")) continue;

            if (trimmed.startsWith("data: ")) {
              const data = trimmed.slice(6);

              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  process.stdout.write(delta);
                  fullContent += delta;
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }
        });

        res.on("end", () => {
          // Process any remaining buffer
          if (buffer.trim()) {
            const trimmed = buffer.trim();
            if (trimmed.startsWith("data: ") && trimmed.slice(6) !== "[DONE]") {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  process.stdout.write(delta);
                  fullContent += delta;
                }
              } catch {
                // Skip malformed final chunk
              }
            }
          }
          process.stdout.write("\n");
          resolve(fullContent);
        });
      }
    );

    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

// Main execution
async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.version) {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf-8"));
    console.log(pkg.version);
    process.exit(0);
  }

  if (!args.prompt) {
    console.error("Error: A prompt is required.");
    console.error('Usage: deepseek "your prompt here"');
    process.exit(1);
  }

  const apiKey = process.env.ATLAS_API_KEY;
  if (!apiKey) {
    console.error("Error: ATLAS_API_KEY environment variable is not set.");
    console.error("Set it in your .env file or export it: export ATLAS_API_KEY=your_key_here");
    console.error("Get your key at https://www.atlascloud.ai");
    process.exit(1);
  }

  // Validate temperature
  if (args.temperature < 0 || args.temperature > 2) {
    console.error("Error: Temperature must be between 0.0 and 2.0.");
    process.exit(1);
  }

  // Validate model
  if (!AVAILABLE_MODELS.includes(args.model)) {
    console.warn(`Warning: '${args.model}' is not a recognized model. Proceeding anyway.`);
    console.warn(`Available models: ${AVAILABLE_MODELS.join(", ")}`);
  }

  const messages = buildMessages(args);

  // Log request info
  console.error(`Model: ${args.model}`);
  console.error(`Temperature: ${args.temperature}`);
  console.error(`Max tokens: ${args.maxTokens}`);
  if (args.file) console.error(`File context: ${args.file}`);
  if (args.code) console.error("Mode: code");
  if (args.stream) console.error("Streaming: enabled");
  console.error("---");

  // Build request body
  const body = JSON.stringify({
    model: args.model,
    messages,
    temperature: args.temperature,
    max_tokens: args.maxTokens,
    stream: args.stream,
    top_p: args.topP,
  });

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const url = `${API_BASE}${CHAT_ENDPOINT}`;

  if (args.stream) {
    // Streaming mode
    try {
      await requestStream(url, { headers, body });
    } catch (err: any) {
      console.error(`\nError: ${err.message}`);
      process.exit(1);
    }
  } else {
    // Non-streaming mode
    try {
      const res = await requestJSON(url, {
        method: "POST",
        headers,
        body,
      });

      if (res.status !== 200) {
        console.error(`API error (${res.status}):`, JSON.stringify(res.data, null, 2));
        process.exit(1);
      }

      const choice = res.data.choices?.[0];
      if (!choice) {
        console.error("Error: No response from model.");
        console.error("Response:", JSON.stringify(res.data, null, 2));
        process.exit(1);
      }

      // Print the response content
      const content = choice.message?.content || "";
      console.log(content);

      // Print usage info to stderr
      const usage = res.data.usage;
      if (usage) {
        console.error("---");
        console.error(
          `Tokens: ${usage.prompt_tokens} input, ${usage.completion_tokens} output, ${usage.total_tokens} total`
        );

        // Estimate cost based on model
        const isR1 = args.model.includes("r1");
        const inputCost = isR1 ? 0.5 : 0.26;
        const outputCost = isR1 ? 2.18 : 0.38;
        const cost = (usage.prompt_tokens * inputCost + usage.completion_tokens * outputCost) / 1_000_000;
        console.error(`Estimated cost: $${cost.toFixed(6)}`);
      }

      // Print finish reason if not 'stop'
      if (choice.finish_reason && choice.finish_reason !== "stop") {
        console.error(`Finish reason: ${choice.finish_reason}`);
      }
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message || err);
  process.exit(1);
});
