import {useState, useRef, useEffect} from "react";
import {useConversations} from "./hooks/useConversations";
import {useChatStream} from "./hooks/useChatStream";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import EmptyState from "./components/chat/EmptyState";
import AiOfflineState from "./components/chat/AiOfflineState";
import MessageBubble from "./components/chat/MessageBubble";
import ChatInput from "./components/chat/ChatInput";
import "./styles/global.css";
import "./styles/chat.css";

export default function App() {
    const [input, setInput] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isAiOnline, setIsAiOnline] = useState(true);
    const bottomRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const autoScrollEnabled = useRef(true);
    const {
        conversations,
        activeId,
        setActiveId,
        activeConv,
        updateConv,
        newConversation,
        deleteConversation
    } = useConversations();
    const {sendMessage, stopStreaming, isStreaming} = useChatStream(activeId, activeConv, updateConv);
    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch('/api/health');
                const isOk = await res.json();
                setIsAiOnline(isOk);
            } catch (e) {
                setIsAiOnline(false);
            }
        };
        checkHealth();
        window.addEventListener('focus', checkHealth);
        return () => window.removeEventListener('focus', checkHealth);
    }, []);
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
    const handleSend = () => {
        autoScrollEnabled.current = true;
        sendMessage(input, setInput);
    };
    return (
        <div className="app" style={{display: 'flex', height: '100vh', overflow: 'hidden'}}>
            <Sidebar open={sidebarOpen}
                     conversations={conversations}
                     activeId={activeId}
                     setActiveId={setActiveId}
                     newConversation={newConversation}
                     deleteConversation={deleteConversation}
            />
            <main className="main">
                <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={activeConv?.title}
                        isAiOnline={isAiOnline}/>{!isAiOnline && activeConv?.messages.length === 0 ? (
                <AiOfflineState/>) : activeConv?.messages.length === 0 ? (
                <EmptyState onStarterClick={(text) => setInput(text)}/>) : (
                <div className="messages" ref={messagesContainerRef} onScroll={handleScroll}>
                    <div className="msg-wrap">{activeConv.messages.map(msg => (
                        <MessageBubble key={msg.id} msg={msg}/>))}
                        <div ref={bottomRef}/>
                    </div>
                </div>)}<ChatInput input={input} setInput={setInput} isStreaming={isStreaming} onSend={handleSend}
                                   onStop={stopStreaming}/>
            </main>
        </div>);
}