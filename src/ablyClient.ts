
import * as Ably from "ably";
import { ChatClient, LogLevel } from "@ably/chat";

//  Realtime client
export const realtimeClient = new Ably.Realtime({
  key: import.meta.env.VITE_ABLY_API_KEY,
  clientId: "my-first-client",
});

// ChatClient pour @ably/chat/react
export const chatClient = new ChatClient(realtimeClient, {
  logLevel: LogLevel.Info,
});
