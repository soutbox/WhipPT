import { useState, useRef, useEffect } from "react";
import { useConversations } from "./hooks/useConversations";
import { useChatStream } from "./hooks/useChatStream";

import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import EmptyState from "./components/chat/EmptyState";
import MessageBubble from "./components/chat/MessageBubble";
import ChatInput from "./components/chat/ChatInput";

import "./styles/global.css";
import "./styles/chat.css";

export default function App() {
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);

  // 분리한 Custom Hooks 호출
  const { conversations, activeId, setActiveId, activeConv, updateConv, newConversation, deleteConversation } = useConversations();
  const { sendMessage, stopStreaming, isStreaming } = useChatStream(activeId, activeConv, updateConv);

  // 메시지가 추가될 때마다 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const handleSend = () => {
    sendMessage(input, setInput);
  };

  return (
      <div className="app" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar
            open={sidebarOpen}
            conversations={conversations}
            activeId={activeId}
            setActiveId={setActiveId}
            newConversation={newConversation}
            deleteConversation={deleteConversation}
        />

        <main className="main">
          <TopBar
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              title={activeConv?.title}
          />

          {activeConv?.messages.length === 0 ? (
              <EmptyState onStarterClick={(text) => setInput(text)} />
          ) : (
              <div className="messages">
                <div className="msg-wrap">
                  {activeConv.messages.map(msg => (
                      <MessageBubble key={msg.id} msg={msg} />
                  ))}
                  <div ref={bottomRef} />
                </div>
              </div>
          )}

          <ChatInput
              input={input}
              setInput={setInput}
              isStreaming={isStreaming}
              onSend={handleSend}
              onStop={stopStreaming}
          />
        </main>
      </div>
  );
}