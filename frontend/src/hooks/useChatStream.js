import {useState, useRef} from "react";
import {generateId} from "../utils/formatters";

/* 백엔드 API와의 비동기 스트리밍(SSE) 통신 및 진행 상태, 요청 취소(Abort) 기능을 전담하는 커스텀 훅 */
export function useChatStream(activeId, activeConv, updateConv) {

    /* 스트리밍 진행 여부 상태 (입력창 비활성화 및 정지 버튼 UI 제어용) */
    const [isStreaming, setIsStreaming] = useState(false);

    /* Fetch 요청을 중간에 강제 취소하기 위한 컨트롤러 참조값 보관 (리렌더링되어도 값 유지) */
    const abortRef = useRef(null);

    /* 사용자의 질문을 서버로 전송하고 스트리밍 응답을 수신하여 UI를 업데이트하는 핵심 통신 함수 */
    const sendMessage = async (input, setInput) => {
        if (!input.trim() || isStreaming) return;

        const currentInput = input.trim();

        /* 사용자 입력 메시지와 AI의 답변이 들어갈 빈(empty) 메시지 객체를 사전 생성 */
        const userMsg = {id: generateId(), role: "user", content: currentInput, ts: Date.now()};

        const assistantId = generateId();

        /* 대화방의 첫 질문인 경우, 해당 질문의 앞부분을 잘라 대화방 제목으로 자동 지정 */
        const isFirst = activeConv.messages.length === 0;

        const title = isFirst ? currentInput.slice(0, 30) + (currentInput.length > 30 ? "…" : "") : activeConv.title;

        /* 대화 내역에 사용자의 질문과 AI의 빈 응답칸을 즉시 렌더링하도록 상태 업데이트 (낙관적 UI 업데이트) */
        updateConv(activeId, c => ({
            ...c,
            title,
            messages: [...c.messages, userMsg, {
                id       : assistantId,
                role     : "assistant",
                content  : "",
                ts       : Date.now(),
                streaming: true
            }]
        }));
        setInput("");
        setIsStreaming(true);
        try {
            /* 새로운 통신 시작 전 취소 컨트롤러 초기화 (정지 버튼 클릭 시 이 객체의 abort()가 호출됨) */
            abortRef.current = new AbortController();
            const response = await fetch('/api/chat/stream', {
                method : 'POST',
                headers: {'Content-Type': 'application/json'},
                signal : abortRef.current.signal,
                body   : JSON.stringify({prompt: currentInput}),
            });
            if (!response.ok) throw new Error('서버 네트워크 에러');

            /* 서버로부터 들어오는 데이터 조각(Chunk)을 연속적으로 읽어들이기 위한 리더기 세팅 */
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            /* 데이터 스트림 수신 루프: 연결이 끊기거나 응답이 완료될 때까지 무한 반복 */
            while (true) {
                const {done, value} = await reader.read();
                if (done) break;/* 바이트(Byte) 배열을 사람이 읽을 수 있는 문자열로 디코딩 */
                const chunk = decoder.decode(value, {stream: true});
                const lines = chunk.split('\n');/* SSE(Server-Sent Events) 규격인 'data: ' 접두사를 찾아 실제 JSON 텍스트만 추출 */
                for (let line of lines) {
                    if (line.startsWith('data:')) {
                        const dataStr = line.substring(5).trim();
                        if (!dataStr) continue;
                        try {
                            /* 추출한 JSON 문자열을 객체로 파싱하여 실제 AI 답변 텍스트 확보 */
                            const jsonData = JSON.parse(dataStr);
                            const textContent = jsonData.response;
                            if (textContent) {
                                /* 방금 수신한 텍스트 조각을 화면의 AI 말풍선 기존 내용 뒤에 실시간으로 이어붙임 (타이핑 애니메이션 효과 발생) */
                                updateConv(activeId, c => {
                                    const newMessages = [...c.messages];
                                    const lastIndex = newMessages.length - 1;
                                    newMessages[lastIndex] = {
                                        ...newMessages[lastIndex],
                                        content: newMessages[lastIndex].content + textContent
                                    };
                                    return {...c, messages: newMessages};
                                });
                            }
                        } catch (e) {
                            /* 네트워크 지연 등으로 JSON 조각이 잘려서 도착한 경우 파싱 에러 발생. 다음 루프에서 합쳐지므로 안전하게 무시 */
                        }
                    }
                }
            }
        } catch (err) {
            /* 사용자가 '정지' 버튼을 눌러 강제 취소한(AbortError) 경우가 아니라면 통신 장애로 간주하여 에러 메시지 출력 */
            if (err.name !== "AbortError") {
                updateConv(activeId, c => {
                    const newMessages = [...c.messages];
                    const lastIndex = newMessages.length - 1;
                    newMessages[lastIndex] = {
                        ...newMessages[lastIndex],
                        content: newMessages[lastIndex].content + '\n\n[통신 오류가 발생했습니다.]',
                        error  : true
                    };
                    return {...c, messages: newMessages};
                });
            }
        } finally {
            /* 통신 성공/실패/강제취소 여부와 상관없이 스트리밍 상태를 종료하고 커서 깜빡임(streaming 속성) 제거 */
            updateConv(activeId, c => {
                const newMessages = [...c.messages];
                const lastIndex = newMessages.length - 1;
                newMessages[lastIndex] = {...newMessages[lastIndex], streaming: false};
                return {...c, messages: newMessages};
            });
            setIsStreaming(false);
        }
    };
    /* 현재 진행 중인 Fetch API 통신을 네트워크 단에서 강제로 끊어버리는 중단 함수 */
    const stopStreaming = () => {
        abortRef.current?.abort();
        setIsStreaming(false);
    };
    return {sendMessage, stopStreaming, isStreaming};
}