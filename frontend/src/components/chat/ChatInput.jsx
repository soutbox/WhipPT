import { useRef, useEffect } from "react";
import "../../styles/input.css";

export default function ChatInput({
    input,
    setInput,
    isStreaming,
    isAiOnline,
    queueWaiting,
    onSend,
    onStop
}) {
    const textareaRef = useRef(null);
    const disabled = !isAiOnline || isStreaming;

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
        }
    }, [input]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled) onSend();
        }
    };

    const placeholder = !isAiOnline
        ? "AI 서버가 오프라인입니다"
        : "채찍피티에게 물어보세요...";

    return (
        <div className="input-area">
            <div className="input-inner">
                {queueWaiting > 0 && (
                    <div className="queue-banner">
                        대기열 {queueWaiting + 1}번째 · 앞선 요청 처리 후 응답합니다
                    </div>
                )}
                {!isAiOnline && (
                    <div className="offline-banner">
                        AI 서버 오프라인 · 잠시 후 다시 시도해주세요
                    </div>
                )}
                <div className={`input-box ${disabled ? 'disabled' : ''}`}>
                    <textarea
                        ref={textareaRef}
                        placeholder={placeholder}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        rows={1}
                    />
                    <div className="input-controls">
                        {isStreaming ? (
                            <button className="stop-btn" onClick={onStop} title="생성 중단">■</button>
                        ) : (
                            <button
                                className="send-btn"
                                onClick={onSend}
                                disabled={disabled || !input.trim()}
                                title="전송 (Enter)"
                            >↵</button>
                        )}
                    </div>
                </div>
                <div className="input-hint">
                    {isStreaming
                        ? "생성 중... ■ 버튼으로 중단"
                        : !isAiOnline
                            ? "AI 서버가 복구되면 자동으로 전송이 가능합니다"
                            : "Enter로 전송 · Shift+Enter 줄바꿈"}
                </div>
            </div>
        </div>
    );
}
