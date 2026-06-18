import { useState } from "react";
import { formatDate } from "../../utils/formatters";
import whipptLogo from "../../assets/whippt_no_background.png";
import "../../styles/sidebar.css";

export default function Sidebar({ open, conversations, activeId, setActiveId, newConversation, deleteConversation }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredConvs = conversations.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <aside className={`sidebar${open ? "" : " closed"}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <img src={whipptLogo} alt="WhipPT Logo" className="logo-img" />
                    WhipPT
                </div>
                <button className="new-chat-btn" onClick={newConversation}>
                    <span>＋</span> 새 대화
                </button>
                <div className="search-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                        placeholder="대화 검색"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="conv-list">
                {filteredConvs.map(conv => (
                    <div
                        key={conv.id}
                        className={`conv-item${activeId === conv.id ? " active" : ""}`}
                        onClick={() => setActiveId(conv.id)}
                    >
                        <div className="conv-title">{conv.title}</div>
                        <div className="conv-date">{formatDate(conv.createdAt)}</div>
                        <button className="delete-btn" onClick={e => deleteConversation(conv.id, e)}>✕</button>
                    </div>
                ))}
            </div>
        </aside>
    );
}