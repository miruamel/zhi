/**
 * @fileoverview Release pane — builds, tags, releases, SBOM.
 * @since 0.2.5
 */
import { Box, Text } from 'ink';
import { colors } from '../../../core/colors';

/** @brief A build entry. @since 0.2.5 */
export interface BuildEntry {
  id: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  branch: string;
  commit: string;
  duration?: number;
}

/** @brief A release entry. @since 0.2.5 */
export interface ReleaseEntry {
  version: string;
  tag: string;
  date: number;
  artifacts: number;
  sbom: boolean;
}

/** @brief Release pane props. @since 0.2.5 */
export interface ReleasePaneProps {
  builds: BuildEntry[];
  releases: ReleaseEntry[];
  selectedBuild?: number;
  onBuild?: (id: string) => void;
  onRelease?: (version: string) => void;
}

const BUILD_COLOR: Record<string, string> = {
  pending: colors.fgDim,
  running: colors.warn,
  success: colors.complete,
  failed: colors.error,
};

/** @brief Render the release pane. @since 0.2.5 */
export function ReleasePane({ builds, releases, selectedBuild, onRelease }: ReleasePaneProps) {
  const current = builds[selectedBuild ?? 0];

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.forward}
      paddingX={1}
      flexGrow={1}
    >
      <Text color={colors.forward} bold>
        _RELEASE ({builds.length} builds · {releases.length} releases)
      </Text>
      <Box gap={2} marginTop={1}>
        <Box flexDirection="column" width={30}>
          <Text color={colors.complete} bold>
            BUILDS
          </Text>
          {builds.length === 0 ? (
            <Text color={colors.fgDim}>No builds.</Text>
          ) : (
            builds.slice(0, 8).map((b, i) => (
              <Text key={b.id} color={BUILD_COLOR[b.status] ?? colors.fg}>
                {i === selectedBuild ? '▸ ' : '  '}
                <Text color={colors.fgDim}>{b.branch}</Text> {b.status}
                {b.duration ? ` (${b.duration}s)` : ''}
              </Text>
            ))
          )}
        </Box>
        <Box flexDirection="column" width={30}>
          <Text color={colors.warn} bold>
            RELEASES
          </Text>
          {releases.length === 0 ? (
            <Text color={colors.fgDim}>No releases.</Text>
          ) : (
            releases.slice(0, 8).map((r) => (
              <Text key={r.version} color={colors.forward}>
                <Text color={colors.fgDim}>{new Date(r.date).toLocaleDateString()}</Text>{' '}
                <Text bold>{r.version}</Text> {r.artifacts} artifacts
                {r.sbom ? ' ✓' : ' ✗'}
              </Text>
            ))
          )}
        </Box>
      </Box>
      {current && (
        <Box marginTop={1}>
          <Text color={colors.fgDim}>
            selected: {current.branch} @ {current.commit.slice(0, 7)} — {current.status}
          </Text>
        </Box>
      )}
      {onRelease && (
        <Box marginTop={1}>
          <Text color={colors.complete}>[r] release</Text>
        </Box>
      )}
    </Box>
  );
}
