/**
 * @fileoverview Agent definitions — registry of built-in agents with capabilities.
 * @since 0.2.7
 * @package zhi
 */

export interface AgentCapability {
  name: string;
  description: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  model: string;
  systemPrompt: string;
  maxTokens: number;
  timeoutMs: number;
  sandbox: string;
}

/** @brief A capability builder helper. @since 0.2.7 */
export function cap(
  name: string,
  description: string,
  input?: Record<string, unknown>,
  output?: Record<string, unknown>,
): AgentCapability {
  return { name, description, input, output };
}

/** @brief Architect agent — designs system architecture. @since 0.2.7 */
export const ARCHITECT_AGENT: AgentDefinition = {
  id: 'architect',
  name: 'Architect',
  description: 'Designs system architecture, module boundaries, and layering rules.',
  capabilities: [
    cap(
      'design',
      'Design module boundaries and layering',
      { domain: 'string' },
      { layers: 'string[]' },
    ),
    cap(
      'review',
      'Review architecture compliance',
      { files: 'FileRecord[]' },
      { violations: 'string[]' },
    ),
    cap('plan', 'Plan feature decomposition', { goal: 'string' }, { steps: 'Step[]' }),
  ],
  model: 'gpt-4o-mini',
  systemPrompt: 'You are a software architect. Design clean, layered, fractal module structures.',
  maxTokens: 4096,
  timeoutMs: 60000,
  sandbox: 'none',
};

/** @brief Coder agent — writes implementation code. @since 0.2.7 */
export const CODER_AGENT: AgentDefinition = {
  id: 'coder',
  name: 'Coder',
  description: 'Generates implementation code from specs.',
  capabilities: [
    cap(
      'generate',
      'Generate source files from spec',
      { spec: 'GenSpec' },
      { files: 'ScaffoldFile[]' },
    ),
    cap('refactor', 'Refactor code safely', { files: 'FileRecord[]' }, { patches: 'string[]' }),
    cap('test', 'Generate tests for code', { files: 'FileRecord[]' }, { tests: 'string[]' }),
  ],
  model: 'gpt-4o-mini',
  systemPrompt: 'You are a senior engineer. Write clean, idiomatic, well-tested code.',
  maxTokens: 8192,
  timeoutMs: 120000,
  sandbox: 'isolated',
};

/** @brief Critic agent — runs quality checks. @since 0.2.7 */
export const CRITIC_AGENT: AgentDefinition = {
  id: 'critic',
  name: 'Critic',
  description: 'Runs multi-critic quality gate and reports findings.',
  capabilities: [
    cap(
      'critique',
      'Run critics against files',
      { files: 'FileRecord[]' },
      { report: 'CriticReport' },
    ),
    cap('verify', 'Verify build artifacts', { artifacts: 'Artifact[]' }, { passed: 'boolean' }),
    cap('security', 'Security scan', { files: 'FileRecord[]' }, { findings: 'CriticFinding[]' }),
  ],
  model: 'gpt-4o-mini',
  systemPrompt: 'You are a quality gate. Be strict, precise, and evidence-backed.',
  maxTokens: 4096,
  timeoutMs: 60000,
  sandbox: 'none',
};

/** @brief Research agent — investigates topics. @since 0.2.7 */
export const RESEARCH_AGENT: AgentDefinition = {
  id: 'research',
  name: 'Researcher',
  description: 'Researches topics, libraries, and patterns.',
  capabilities: [
    cap('search', 'Search web for information', { query: 'string' }, { results: 'string[]' }),
    cap('summarize', 'Summarize documents', { docs: 'string[]' }, { summary: 'string' }),
    cap('compare', 'Compare alternatives', { options: 'string[]' }, { recommendation: 'string' }),
  ],
  model: 'gpt-4o-mini',
  systemPrompt: 'You are a research assistant. Be thorough, cite sources, and synthesize findings.',
  maxTokens: 4096,
  timeoutMs: 60000,
  sandbox: 'none',
};

/** @brief DevOps agent — manages builds and releases. @since 0.2.7 */
export const DEVOPS_AGENT: AgentDefinition = {
  id: 'devops',
  name: 'DevOps',
  description: 'Manages CI/CD, builds, releases, and SBOM generation.',
  capabilities: [
    cap('build', 'Run build pipeline', { config: 'BuildConfig' }, { result: 'BuildResult' }),
    cap(
      'release',
      'Create release tag and artifacts',
      { version: 'string' },
      { tag: 'string', artifacts: 'Artifact[]' },
    ),
    cap('sbom', 'Generate SBOM', { files: 'FileRecord[]' }, { sbom: 'string' }),
  ],
  model: 'gpt-4o-mini',
  systemPrompt: 'You are a DevOps engineer. Automate builds, releases, and supply-chain security.',
  maxTokens: 4096,
  timeoutMs: 120000,
  sandbox: 'docker',
};

/** @brief All built-in agent definitions. @since 0.2.7 */
export const BUILTIN_AGENTS: AgentDefinition[] = [
  ARCHITECT_AGENT,
  CODER_AGENT,
  CRITIC_AGENT,
  RESEARCH_AGENT,
  DEVOPS_AGENT,
];

/** @brief Look up an agent definition by id. @since 0.2.7 */
export function getAgent(id: string): AgentDefinition | undefined {
  return BUILTIN_AGENTS.find((a) => a.id === id);
}

/** @brief Register all built-in agents into a runtime. @since 0.2.7 */
export function registerBuiltinAgents(runtime: { register(d: AgentDefinition): void }): void {
  for (const a of BUILTIN_AGENTS) runtime.register(a);
}
