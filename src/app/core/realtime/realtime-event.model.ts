export type RealtimeConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface DemoChatMessage {
  type: string;
  message: string;
  occurredAt: string;
}

export interface DemoNotification {
  type: string;
  message: string;
  occurredAt: string;
}
