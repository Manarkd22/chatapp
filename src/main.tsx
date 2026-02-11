import React from "react";
import ReactDOM from "react-dom/client";
import { AblyProvider } from "ably/react";
import { ChatClientProvider } from "@ably/chat/react";
import App from "./App";
import { realtimeClient, chatClient } from "./ablyClient";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AblyProvider client={realtimeClient}>
      <ChatClientProvider client={chatClient}>
        <App />
      </ChatClientProvider>
    </AblyProvider>
  </React.StrictMode>
);
