/**
 * @fileoverview Metrics widget — key-value metric display. @since 0.2.6
 * @package zhi
 */
import { Text } from 'ink';

/** @brief Metric row. @since 0.2.6 */
export interface Metric {
  label: string;
  value: string | number;
  color?: string;
  trend?: 'up' | 'down' | 'flat';
}

/** @brief Metrics props. @since 0.2.6 */
export interface MetricsProps {
  metrics?: Metric[];
  columns?: number;
  tokensUsed?: number;
  tokensBudget?: number;
  elapsedMs?: number;
  stepsCompleted?: number;
  stepsTotal?: number;
  successRate?: number;
  costEstimate?: number;
}

/** @brief Metrics component. @since 0.2.6 */
export function Metrics({
  metrics,
  columns = 2,
  tokensUsed,
  tokensBudget,
  elapsedMs,
  stepsCompleted,
  stepsTotal,
  successRate,
  costEstimate,
}: MetricsProps): React.ReactElement {
  const rows: Metric[] = metrics ?? [];
  if (tokensUsed !== undefined) {
    rows.push({ label: 'Tokens', value: `${tokensUsed}/${tokensBudget}` });
    if (elapsedMs !== undefined) rows.push({ label: 'Time', value: `${elapsedMs}ms` });
    if (stepsCompleted !== undefined)
      rows.push({ label: 'Steps', value: `${stepsCompleted}/${stepsTotal}` });
    if (successRate !== undefined)
      rows.push({ label: 'Success', value: `${Math.round(successRate * 100)}%` });
    if (costEstimate !== undefined)
      rows.push({ label: 'Cost', value: `$${costEstimate.toFixed(4)}` });
  }

  const grid: Metric[][] = [];
  for (let i = 0; i < rows.length; i += columns) {
    grid.push(rows.slice(i, i + columns));
  }
  return (
    <Text>
      {grid.map((row, ri) => (
        <Text key={ri}>
          {row.map((m, ci) => (
            <Text key={ci}>
              <Text color="gray">{m.label}: </Text>
              <Text color={m.color}>{String(m.value)}</Text>
              {m.trend && (
                <Text color={m.trend === 'up' ? 'green' : m.trend === 'down' ? 'red' : 'gray'}>
                  {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'}
                </Text>
              )}
              {'  '}
            </Text>
          ))}
          {'\n'}
        </Text>
      ))}
    </Text>
  );
}
