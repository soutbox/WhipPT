import { useRef, useEffect } from "react";
import "../../styles/input.css";

export default function ChatInput({ input, setInput, isStreaming, onSend, onStop }) {
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
        }
    }, [input]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="input-area">
            <div className="input-inner">
                <div className="input-box">
                    <textarea
                          ref={textareaRef}
                          placeholder="채찍피티에게 물어보세요..."
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          rows={1}
                    />
                    <div className="input-controls">
                        {isStreaming ? (
                            <button className="stop-btn" onClick={onStop} title="생성 중단">■</button>
                        ) : (
                            <button className="send-btn" onClick={onSend} disabled={!input.trim()} title="전송 (Enter)">↵</button>
                        )}
                    </div>
                </div>
                <div className="input-hint">
                    {isStreaming ? "생성 중... ■ 버튼으로 중단" : "Enter로 전송 · Shift+Enter 줄바꿈"}
                </div>
            </div>
        </div>
    );
}