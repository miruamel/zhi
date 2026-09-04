/** @brief Widgets barrel — re-exports reusable ink widgets from nested subdirs.
 *  Layout per Mandate §6.2 (≤5 files/dir): badges, status, indicators, wayfinding, picker, structure, data.
 *  @since 0.1.1 */

export { Badge, BADGE_COLORS } from "./badges/badge";
export type { BadgeProps, BadgeColor, BadgeVariant, BadgeSize } from "./badges/badge";
export { StatCard } from "./badges/stat";

export { Callout, CALLOUT_VARIANTS } from "./status/callout";
export type { CalloutVariant, CalloutProps } from "./status/callout";
export { EmptyState } from "./status/empty-state";
export type { EmptyStateProps, EmptyStateAction } from "./status/empty-state";

export { ProgressBar } from "./indicators/progress";
export { ProgressRing } from "./indicators/progress-ring";
export type { ProgressRingProps } from "./indicators/progress-ring";
export { Spinner, SPINNER_PRESETS } from "./indicators/spinner";
export type { SpinnerType, SpinnerProps } from "./indicators/spinner";

export { Breadcrumb } from "./wayfinding/breadcrumb";
export type { BreadcrumbItem, BreadcrumbProps } from "./wayfinding/breadcrumb";
export { Tabs } from "./wayfinding/tabs";
export type { TabDef, TabsProps } from "./wayfinding/tabs";

export { SegmentedControl } from "./picker/segmented-control";
export type { SegmentOption, SegmentedControlProps } from "./picker/segmented-control";

export { Tree } from "./structure/tree";
export type { TreeNode, TreeProps } from "./structure/tree";

export { Table } from "./data/table";
export type { ColumnDef, TableProps } from "./data/table";
export { Tooltip } from "./data/tooltip";
export type { TooltipProps } from "./data/tooltip";
export { JsonView } from "./data/json-view";
export type { JsonPath, JsonViewProps } from "./data/json-view";
