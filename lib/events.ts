// Simple event system for cross-component communication
type EventCallback = (data?: any) => void;
type EventMap = Record<string, EventCallback[]>;

// Define the structure for chat message events
export interface ChatMessageEvent {
  message: string;
  category: string;
}

class EventBus {
  private events: EventMap = {};

  // Subscribe to an event
  on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    };
  }

  // Emit an event
  emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  }
}

// Create a singleton instance
export const eventBus = new EventBus();

// Event names
export const EVENTS = {
  SEND_CHAT_MESSAGE: 'send-chat-message',
};
