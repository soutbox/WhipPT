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

    // 스크롤 컨테이너와 자동 스크롤 활성화 여부를 추적할 Ref
    const messagesContainerRef = useRef(null);
    const autoScrollEnabled = useRef(true);

    const { conversations, activeId, setActiveId, activeConv, updateConv, newConversation, deleteConversation } = useConversations();
    const { sendMessage, stopStreaming, isStreaming } = useChatStream(activeId, activeConv, updateConv);

    // 사용자가 스크롤을 위로 올렸는지 판별
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;

        // 바닥에서 100px 이내인지 확인하여 자동 스크롤 여부 결정
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        autoScrollEnabled.current = isAtBottom;
    };

    // 메시지가 추가될 때 조건부 자동 스크롤
    useEffect(() => {
        if (autoScrollEnabled.current) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeConv?.messages]);

    const handleSend = () => {
        // 새 메시지 전송 시 무조건 바닥으로 스크롤 강제 ON
        autoScrollEnabled.current = true;
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
                    <div className="messages" ref={messagesContainerRef} onScroll={handleScroll}>
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