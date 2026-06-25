import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { formatTime } from "../../utils/formatters";
import whipptLogo from "../../assets/whippt_no_background.png";
import 'katex/dist/katex.min.css';

export default function MessageBubble({ msg, queueWaiting = 0 }) {
    const [copyToast, setCopyToast] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(msg.content);
        setCopyToast(true);
        setTimeout(() => setCopyToast(false), 1500);
    };

    const isAI = msg.role === "assistant";

    return (
        <div className={`msg-row ${msg.role}`}>
            <div className={`avatar ${isAI ? "ai" : "user"}`}>
                {isAI ? <img src={whipptLogo} alt="AI" /> : "나"}
            </div>
            <div className="msg-body">
                <div className="msg-meta">
                    <span className="msg-name">{isAI ? "WhipPT" : "나"}</span>
                    <span className="msg-time">{formatTime(msg.ts)}</span>
                </div>
                <div className={`bubble${msg.error ? " error" : ""}`}>
                    {isAI && msg.streaming && !msg.content && queueWaiting > 0 ? (
                        <span className="queue-placeholder">
                            대기열 {queueWaiting + 1}번째 · 응답 준비 중...
                        </span>
                    ) : isAI ? (
                        <div className="md-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        msg.content
                    )}
                    {msg.streaming && (msg.content || queueWaiting === 0) && <span className="cursor" />}
                </div>
                {!msg.streaming && isAI && (
                    <div className="msg-actions">
                        <button className={`action-btn${copyToast ? " copied" : ""}`} onClick={handleCopy}>
                            {copyToast ? "✓ 복사됨" : "복사"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}