/**
 * @brief JsonView tree-rendering functions: toggleMarker, renderObject, renderArray, buildLines.
 *
 * Split from json-view/index.tsx (271 SLOC) so each file stays under the 250 SLOC ceiling.
 * @since 0.1.1
 */
import { Text } from 'ink';
import { colors } from '../../core/style/colors';
import type { JsonPath, JsonViewProps } from './types.ts';
import { INDENT, typeOf, primitiveColor, primitiveLabel } from './types.ts';

type IsOpenFn = (key: string) => boolean;
type SetFocused = (k: string) => void;

interface RenderedLine {
  indent: string;
  head: React.ReactNode;
  body: React.ReactNode;
}

/** @brief Toggle marker (+/-) for collapsible containers. @since 0.1.1 */
export function toggleMarker(open: boolean, isFocused: boolean, onSelect: () => void): React.ReactNode {
  return (
    <Text color={isFocused ? colors.accent : colors.fgDim} inverse={isFocused} onClick={onSelect}>
      {open ? '−' : '+'}
    </Text>
  );
}

/** @brief Render an object as a collapsible tree. @since 0.1.1 */
export function renderObject(
  obj: Record<string, unknown>,
  path: string,
  depth: number,
  indent: string,
  collapsedDefault: boolean,
  maxDepth: number,
  onPathClick: ((node: JsonPath) => void) | undefined,
  isOpen: IsOpenFn,
  focused: string,
  setFocused: SetFocused,
): RenderedLine[] {
  const key = `o:${path}`;
  const open = isOpen(key) && depth < maxDepth;
  const keys = Object.keys(obj);
  const isFocused = focused === key;

  if (!open) {
    return [
      {
        indent,
        head: toggleMarker(isOpen(key), isFocused, () => setFocused(key)),
        body: (
          <Text color={colors.fgDim}>
            {' {'}
            <Text color={colors.fg}>{keys.length}</Text>
            {'}'}
          </Text>
        ),
      },
    ];
  }

  const out: RenderedLine[] = [
    {
      indent,
      head: toggleMarker(true, isFocused, () => setFocused(key)),
      body: <Text color={colors.fgDim}>{' {'}</Text>,
    },
  ];

  for (const k of keys) {
    const childPath = path ? `${path}.${k}` : k;
    const childValue = obj[k];
    const childIsContainer = childValue !== null && typeof childValue === 'object';

    if (!childIsContainer) {
      out.push({
        indent: indent + INDENT,
        head: null,
        body: (
          <Text>
            <Text color={colors.fgDim}>"{k}": </Text>
            <Text color={primitiveColor(childValue)}>{primitiveLabel(childValue)}</Text>
          </Text>
        ),
      });
      onPathClick?.({ path: childPath, value: childValue, type: typeOf(childValue) });
    } else {
      out.push(
        {
          indent: indent + INDENT,
          head: toggleMarker(
            isOpen(childPath),
            focused === childPath,
            () => setFocused(childPath),
          ),
          body: (
            <Text>
              <Text color={colors.fgDim}>"{k}": </Text>
              <Text color={colors.fgDim}>…</Text>
            </Text>
          ),
        },
        ...buildLines(
          childValue,
          childPath,
          depth + 1,
          collapsedDefault,
          maxDepth,
          onPathClick,
          isOpen,
          focused,
          setFocused,
        ),
      );
    }
  }

  out.push({
    indent,
    head: null,
    body: <Text color={colors.fgDim}>{'}'}</Text>,
  });
  return out;
}

/** @brief Render an array as a collapsible list. @since 0.1.1 */
export function renderArray(
  arr: unknown[],
  path: string,
  depth: number,
  indent: string,
  collapsedDefault: boolean,
  maxDepth: number,
  onPathClick: ((node: JsonPath) => void) | undefined,
  isOpen: IsOpenFn,
  focused: string,
  setFocused: SetFocused,
): RenderedLine[] {
  const key = `a:${path}`;
  const open = isOpen(key) && depth < maxDepth;
  const isFocused = focused === key;

  if (!open) {
    return [
      {
        indent,
        head: toggleMarker(isOpen(key), isFocused, () => setFocused(key)),
        body: (
          <Text color={colors.fgDim}>
            {' ['}
            <Text color={colors.fg}>{arr.length}</Text>
            {']'}
          </Text>
        ),
      },
    ];
  }

  const out: RenderedLine[] = [
    {
      indent,
      head: toggleMarker(true, isFocused, () => setFocused(key)),
      body: <Text color={colors.fgDim}>{' ['}</Text>,
    },
  ];

  arr.forEach((item, i) => {
    const childPath = `${path}[${i}]`;
    out.push(
      ...buildLines(item, childPath, depth + 1, collapsedDefault, maxDepth, onPathClick, isOpen, focused, setFocused),
    );
  });

  out.push({
    indent,
    head: null,
    body: <Text color={colors.fgDim}>{']'}</Text>,
  });
  return out;
}

/** @brief Build the flat list of rendered lines for a JSON value. @since 0.1.1 */
export function buildLines(
  value: unknown,
  path: string,
  depth: number,
  collapsedDefault: boolean,
  maxDepth: number,
  onPathClick: ((node: JsonPath) => void) | undefined,
  isOpen: IsOpenFn,
  focused: string,
  setFocused: SetFocused,
): RenderedLine[] {
  const indent = INDENT.repeat(depth);
  const isContainer = value !== null && typeof value === 'object';

  if (!isContainer) {
    return [
      {
        indent,
        head: null,
        body: <Text color={primitiveColor(value)}>{primitiveLabel(value)}</Text>,
      },
    ];
  }

  if (Array.isArray(value)) {
    return renderArray(value, path, depth, indent, collapsedDefault, maxDepth, onPathClick, isOpen, focused, setFocused);
  }

  return renderObject(
    value as Record<string, unknown>,
    path,
    depth,
    indent,
    collapsedDefault,
    maxDepth,
    onPathClick,
    isOpen,
    focused,
    setFocused,
  );
}