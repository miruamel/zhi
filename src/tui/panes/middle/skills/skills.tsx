/**
 * @fileoverview Skill browser pane — search, inspect, toggle skills.
 * @since 0.2.3
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';

/** @brief Skill browser props. @since 0.2.3 */
export interface SkillBrowserPaneProps {
  skills: Array<{
    name: string;
    description: string;
    enabled: boolean;
    category?: string;
    usageCount?: number;
  }>;
  searchQuery?: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  build: colors.complete,
  test: colors.forward,
  security: colors.error,
  docs: colors.warn,
  deploy: colors.scoring,
  ops: colors.fgDim,
};

/** @brief Render the skill browser pane. @since 0.2.3 */
export function SkillBrowserPane({ skills, searchQuery }: SkillBrowserPaneProps) {
  const q = (searchQuery ?? '').toLowerCase();
  const filtered = q
    ? skills.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
      )
    : skills;
  const enabledCount = skills.filter((s) => s.enabled).length;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _SKILLS ({enabledCount}/{skills.length} enabled)
      </Text>
      {searchQuery && <Text color={colors.fgDim}> filter: {searchQuery}</Text>}
      {filtered.length === 0 ? (
        <Text color={colors.fgDim}>No skills match.</Text>
      ) : (
        filtered.slice(0, 30).map((s) => {
          const color = s.enabled ? colors.fg : colors.fgDim;
          const cat = s.category ?? 'ops';
          return (
            <Box key={s.name} gap={1}>
              <Text color={color}>
                {s.enabled ? '●' : '○'} {s.name.padEnd(20)}
                <Text color={CATEGORY_COLOR[cat] ?? colors.fgDim}>[{cat}]</Text>
                {s.usageCount != null && s.usageCount > 0 && (
                  <Text color={colors.fgDim}> {s.usageCount}u</Text>
                )}
              </Text>
            </Box>
          );
        })
      )}
    </Box>
  );
}
