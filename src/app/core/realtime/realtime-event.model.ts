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

export interface RealtimeServerEvents {
  messageReceived: DemoChatMessage;
  demoNotification: DemoNotification;
}

export type RealtimeServerEventName = keyof RealtimeServerEvents;

export const ApplicationRealtimeEvents = {
  MessageReceived: 'messageReceived',
  DemoNotification: 'demoNotification',
} as const;

export const ApplicationRealtimeMethods = {
  SendMessage: 'SendMessage',
} as const;
