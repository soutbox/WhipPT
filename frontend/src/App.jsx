import {useState, useRef, useEffect} from "react";
import {useConversations} from "./hooks/useConversations";
import {useChatStream} from "./hooks/useChatStream";
import {useAiHealth} from "./hooks/useAiHealth";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import EmptyState from "./components/chat/EmptyState";
import AiOfflineState from "./components/chat/AiOfflineState";
import MessageBubble from "./components/chat/MessageBubble";
import ChatInput from "./components/chat/ChatInput";
import "./styles/global.css";
import "./styles/chat.css";

const HEALTH_POLL_MS = 30_000;

export default function App() {
    const [input, setInput] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const isAiOnline = useAiHealth(HEALTH_POLL_MS);
    const bottomRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const autoScrollEnabled = useRef(true);
    const {
        conversations,
        activeId,
        setActiveId,
        activeConv,
        updateConv,
        goHome,
        startNewDraft,
        deleteConversation
    } = useConversations();
    const {sendMessage, stopStreaming, isStreaming, queueWaiting} =
        useChatStream(activeId, activeConv, updateConv, isAiOnline);

    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        const {scrollTop, scrollHeight, clientHeight} = messagesContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        autoScrollEnabled.current = isAtBottom;
    };

    useEffect(() => {
        if (autoScrollEnabled.current) {
            bottomRef.current?.scrollIntoView({behavior: "smooth"});
        }
    }, [activeConv?.messages]);

    const handleGoHome = () => {
        goHome();
        setInput("");
    };

    const handleStartNewDraft = () => {
        startNewDraft();
        setInput("");
    };

    const handleSend = () => {
        if (!isAiOnline) return;
        autoScrollEnabled.current = true;
        sendMessage(input, setInput);
    };

    const handleStarterClick = (text) => {
        if (isAiOnline) setInput(text);
    };

    return (
        <div className="app" style={{display: 'flex', height: '100vh', overflow: 'hidden'}}>
            <Sidebar
                open={sidebarOpen}
                conversations={conversations}
                activeId={activeId}
                setActiveId={setActiveId}
                goHome={handleGoHome}
                startNewDraft={handleStartNewDraft}
                deleteConversation={deleteConversation}
            />
            <main className="main">
                <TopBar
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    title={activeConv?.title}
                    isAiOnline={isAiOnline}
                    sidebarOpen={sidebarOpen}
                />
                {!isAiOnline && activeConv?.messages.length === 0 ? (
                    <AiOfflineState/>
                ) : activeConv?.messages.length === 0 ? (
                    <EmptyState onStarterClick={handleStarterClick}/>
                ) : (
                    <div className="messages" ref={messagesContainerRef} onScroll={handleScroll}>
                        <div className="msg-wrap">
                            {activeConv.messages.map(msg => (
                                <MessageBubble key={msg.id} msg={msg}/>
                            ))}
                            <div ref={bottomRef}/>
                        </div>
                    </div>
                )}
                <ChatInput
                    input={input}
                    setInput={setInput}
                    isStreaming={isStreaming}
                    isAiOnline={isAiOnline}
                    queueWaiting={queueWaiting}
                    onSend={handleSend}
                    onStop={stopStreaming}
                />
            </main>
        </div>
    );
}
