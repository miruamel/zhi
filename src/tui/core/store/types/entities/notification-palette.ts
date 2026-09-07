/**
 * @fileoverview Notification, palette, agent, and network entity types. @since 0.2.0
 * @package zhi
 */
import type { PaneId } from '../primitives';

/** Notification action */
export interface NotificationAction {
  label: string;
  onClick: () => void;
}

/** Notification item */
export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: number;
  read?: boolean;
  persistent?: boolean;
  action?: NotificationAction;
}

/** Command item for palette */
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  category?: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

/** Tab item */
export interface TabItem {
  id: string;
  title: string;
  icon?: string;
  modified?: boolean;
  closable?: boolean;
  paneId?: PaneId;
}

/** Agent info */
export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'busy' | 'error' | 'offline';
  tasks?: string[];
  memory?: number;
  tokens?: number;
  startTime?: number;
}

/** Network request */
export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  duration: number;
  timestamp: number;
  size?: number;
  error?: string;
}
