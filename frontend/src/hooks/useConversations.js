import {useState, useCallback} from "react";
import {generateId} from "../utils/formatters";

/* 사이드바의 대화방 목록 전체 데이터와 현재 활성화된 대화방의 상태를 전역적으로 관리하는 커스텀 훅 */
export function useConversations() {
    /* 전체 대화방 목록 배열을 관리하는 상태. 초기값으로 빈 '새 대화' 객체를 1개 생성 */
    const [conversations, setConversations] = useState([{
        id       : "default",
        title    : "새 대화",
        messages : [],
        createdAt: Date.now()
    }]);

    /* 현재 사용자가 보고 있는 대화방의 고유 ID 상태 */
    const [activeId, setActiveId] = useState("default");

    /* 화면에 그리기 위해, 전체 목록 중에서 현재 선택된(active) 대화방 객체만 찾아낸 파생 변수 */
    const activeConv = conversations.find(c => c.id === activeId);

    /* 특정 대화방(id)의 내부 데이터(제목, 메시지 등)만 불변성을 유지하며 교체(업데이트)하는 유틸리티 함수 */
    const updateConv = useCallback((id, updater) => {
        setConversations(prev => prev.map(c => c.id === id ? updater(c) : c));
    }, []);

    /* 새로운 빈 대화방 객체를 생성하여 목록의 가장 앞부분에 추가하고, 화면을 해당 대화방으로 포커스 전환 */
    const newConversation = () => {
        const id = generateId();
        setConversations(prev => [{id, title: "새 대화", messages: [], createdAt: Date.now()}, ...prev]);
        setActiveId(id);
    };

    /* 대화방 삭제 처리 및 예외 상황(마지막 방 삭제, 현재 보고 있는 방 삭제)에 대한 Fallback 라우팅 역할 */
    const deleteConversation = (id, e) => {
        e?.stopPropagation();
        setConversations(prev => {
            const next = prev.filter(c => c.id !== id);/* 목록의 마지막 남은 방을 지웠을 경우, 앱이 빈 화면이 되지 않도록 새로운 껍데기 대화방을 자동 생성 */
            if (next.length === 0) {
                const newId = generateId();
                setActiveId(newId);
                return [{id: newId, title: "새 대화", messages: [], createdAt: Date.now()}];
            }

            /* 현재 내가 열어두고 있던 방을 지웠을 경우, 엉뚱한 에러가 나지 않도록 목록의 가장 첫 번째 방으로 자동 포커스 이동 */
            if (activeId === id) setActiveId(next[0].id);
            return next;
        });
    };
    return {conversations, activeId, setActiveId, activeConv, updateConv, newConversation, deleteConversation};
}