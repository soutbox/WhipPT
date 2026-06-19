import {useState, useRef} from "react";
import {generateId} from "../utils/formatters";

export function useChatStream(activeId, activeConv, updateConv, isAiOnline) {
    const [isStreaming, setIsStreaming] = useState(false);
    const [queueWaiting, setQueueWaiting] = useState(0);
    const abortRef = useRef(null);

    const sendMessage = async (input, setInput) => {
        if (!input.trim() || isStreaming || !isAiOnline || !activeConv) return;

        const currentInput = input.trim();
        const userMsg = {id: generateId(), role: "user", content: currentInput, ts: Date.now()};
        const assistantId = generateId();
        const isFirst = activeConv.messages.length === 0;
        const title = isFirst
            ? currentInput.slice(0, 30) + (currentInput.length > 30 ? "…" : "")
            : activeConv.title;

        updateConv(activeId, c => {
            if (c.messages.some(m => m.id === assistantId)) return c;
            return {
                ...c,
                title,
                messages: [...c.messages, userMsg, {
                    id: assistantId,
                    role: "assistant",
                    content: "",
                    ts: Date.now(),
                    streaming: true
                }]
            };
        });
        setInput("");
        setIsStreaming(true);
        setQueueWaiting(0);

        try {
            abortRef.current = new AbortController();
            const response = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                signal: abortRef.current.signal,
                body: JSON.stringify({prompt: currentInput}),
            });
            if (!response.ok) throw new Error('서버 네트워크 에러');

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, {stream: true});
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.startsWith('data:')) continue;
                    const dataStr = line.substring(5).trim();
                    if (!dataStr) continue;
                    try {
                        const jsonData = JSON.parse(dataStr);

                        if (jsonData.queuePosition != null && jsonData.queuePosition > 1) {
                            setQueueWaiting(jsonData.queuePosition - 1);
                            continue;
                        }

                        if (jsonData.queuePosition != null) {
                            setQueueWaiting(0);
                        }

                        const textContent = jsonData.response;
                        if (textContent) {
                            updateConv(activeId, c => {
                                const newMessages = [...c.messages];
                                const lastIndex = newMessages.length - 1;
                                newMessages[lastIndex] = {
                                    ...newMessages[lastIndex],
                                    content: newMessages[lastIndex].content + textContent,
                                    offline: jsonData.source === 'offline'
                                };
                                return {...c, messages: newMessages};
                            });
                        }
                    } catch {
                        // partial JSON chunk
                    }
                }
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                updateConv(activeId, c => {
                    const newMessages = [...c.messages];
                    const lastIndex = newMessages.length - 1;
                    newMessages[lastIndex] = {
                        ...newMessages[lastIndex],
                        content: newMessages[lastIndex].content + '\n\n[통신 오류가 발생했습니다.]',
                        error: true
                    };
                    return {...c, messages: newMessages};
                });
            }
        } finally {
            setQueueWaiting(0);
            updateConv(activeId, c => {
                const newMessages = [...c.messages];
                const lastIndex = newMessages.length - 1;
                if (lastIndex >= 0) {
                    newMessages[lastIndex] = {...newMessages[lastIndex], streaming: false};
                }
                return {...c, messages: newMessages};
            });
            setIsStreaming(false);
        }
    };

    const stopStreaming = () => {
        abortRef.current?.abort();
        setIsStreaming(false);
        setQueueWaiting(0);
    };

    return {sendMessage, stopStreaming, isStreaming, queueWaiting};
}
