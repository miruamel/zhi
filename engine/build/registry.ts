/**
 * @fileoverview Build registry. @since 0.1.10
 * @package zhi
 */
import type { BuildConfig } from './core/types';
import type { ScaffoldFile } from './core/scaffold';

/** @brief Plugin type. @since 0.1.10 */
export type PluginType = 'transform' | 'resolve' | 'output' | 'cleanup';

/** @brief Build plugin. @since 0.1.10 */
export interface BuildPlugin {
  name: string;
  type: PluginType;
  apply(context: BuildContext): void;
}

/** @brief Build context. @since 0.1.10 */
export interface BuildContext {
  config: BuildConfig;
  files: ScaffoldFile[];
}

/** @brief Registry entry. @since 0.1.10 */
export interface RegistryEntry {
  name: string;
  plugin: BuildPlugin;
  dependencies: string[];
}

/** @brief Dependency node. @since 0.1.10 */
export interface DependencyNode {
  name: string;
  dependencies: string[];
  orphan: boolean;
  valid: boolean;
}

/** @brief Build registry. @since 0.1.10 */
export class BuildRegistry {
  private plugins = new Map<string, BuildPlugin>();
  private deps = new Map<string, string[]>();

  register(plugin: BuildPlugin, deps: string[] = []): void {
    this.plugins.set(plugin.name, plugin);
    this.deps.set(plugin.name, deps);
  }

  get(name: string): BuildPlugin | undefined {
    return this.plugins.get(name);
  }

  resolve(): DependencyNode[] {
    const nodes: DependencyNode[] = [];
    for (const [name, deps] of this.deps) {
      const orphan = deps.every((d) => !this.deps.has(d));
      const valid = deps.every((d) => this.deps.has(d));
      nodes.push({ name, dependencies: deps, orphan, valid });
    }
    return nodes;
  }
}

/** @brief Create build registry. @since 0.1.10 */
export function createBuildRegistry(): BuildRegistry {
  return new BuildRegistry();
}
