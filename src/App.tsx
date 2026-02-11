// App.tsx
import React, { useState, useCallback } from "react";
import "./App.css";
import { ChatRoomProvider, useChatConnection, useMessages, useRoom, useTyping, usePresence, usePresenceListener, useRoomReactions } from "@ably/chat/react";
import type { Message, RoomReaction } from "@ably/chat";
import { chatClient, realtimeClient } from "./ablyClient"; 

/* ---------------- CONNECTION STATUS ---------------- */
function ConnectionStatus() {
  const { currentStatus } = useChatConnection();
  return (
    <div className="p-4 text-center h-full border bg-gray-100">
      <h2 className="text-lg font-semibold text-blue-500">Ably Chat Connection</h2>
      <p>Connection: {currentStatus}</p>
    </div>
  );
}

/* ---------------- ROOM STATUS ---------------- */
function RoomStatus() {
  const [currentRoomStatus, setCurrentRoomStatus] = useState("");
  const { roomName } = useRoom({
    onStatusChange: (status) => setCurrentRoomStatus(status.current),
  });
  return (
    <div className="p-4 text-center h-full border bg-gray-100">
      <h2 className="text-lg font-semibold text-blue-500">Room Status</h2>
      <p>Status: {currentRoomStatus}<br />Room: {roomName}</p>
    </div>
  );
}

/* ---------------- CHAT BOX ---------------- */
function ChatBox() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const { sendMessage, updateMessage } = useMessages({
    listener: (event) => {
      const message = event.message;
      if (event.type === "message:created") {
        setMessages(prev => [...prev, message]);
      }
      if (event.type === "message:updated") {
        setMessages(prev => {
          const index = prev.findIndex(m => m.serial === message.serial);
          if (index === -1) return prev;
          const copy = [...prev];
          copy[index] = message;
          return copy;
        });
      }
    }
  });

  const { currentlyTyping, keystroke, stop } = useTyping();

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage({ text: inputValue }).catch(console.error);
    setInputValue("");
    stop().catch(console.error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    val.trim() ? keystroke().catch(console.error) : stop().catch(console.error);
  };

  const onUpdateMessage = useCallback((message: Message) => {
    const newText = prompt("Enter new text");
    if (!newText) return;
    updateMessage(message.serial, { text: newText }).catch(console.error);
  }, [updateMessage]);

  return (
    <div className="flex flex-col w-full h-[600px] items-start border border-blue-500 rounded-lg">
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map(msg => (
          <div
            key={msg.serial}
            onClick={() => onUpdateMessage(msg)}
            className="bg-blue-100 rounded px-3 py-2 w-fit cursor-pointer"
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="h-6 px-2">
        {currentlyTyping.size > 0 && <p>{Array.from(currentlyTyping).join(", ")} is typing...</p>}
      </div>

      <div className="flex p-2">
        <input
          className="flex-1 border p-2 rounded"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 ml-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}

/* ---------------- PRESENCE ---------------- */
function PresenceStatus() {
  usePresence();
  const { presenceData } = usePresenceListener();
  return (
    <div className="p-2 border">
      Online: {presenceData.length}
      {presenceData.map((m, i) => <div key={i}>{m.clientId}</div>)}
    </div>
  );
}

/* ---------------- REACTIONS ---------------- */
function ReactionComponent() {
  const reactions = ["👍", "❤️", "💥"];
  const [roomReactions, setRoomReactions] = useState<RoomReaction[]>([]);
  const { sendRoomReaction } = useRoomReactions({
    listener: (e) => setRoomReactions(prev => [...prev, e.reaction])
  });

  return (
    <div>
      <div className="flex gap-2">
        {reactions.map(r => <button key={r} onClick={() => sendRoomReaction({ name: r })}>{r}</button>)}
      </div>
      <div>
        {roomReactions.map((r, i) => <span key={i}>{r.name}</span>)}
      </div>
    </div>
  );
}

/* ---------------- MAIN APP ---------------- */
export default function App() {
  const handleDisconnect = () => {
    realtimeClient.connection.close();
    console.log("Disconnected from Ably");
  };

  return (
    <ChatRoomProvider name="my-first-room" client={chatClient} release={true}>
      <div className="flex flex-col w-[900px] mx-auto border rounded">

        <div className="p-2 text-right">
          <button onClick={handleDisconnect} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
            Disconnect
          </button>
        </div>

        <div className="flex">
          <ConnectionStatus />
          <RoomStatus />
        </div>

        <div className="flex">
          <PresenceStatus />
          <ReactionComponent />
          <ChatBox />
        </div>

      </div>
    </ChatRoomProvider>
  );
}
