import {useState, useCallback, useEffect, useMemo, useRef} from "react";
import {generateId} from "../utils/formatters";

const STORAGE_KEY_CONV = "whippt:conversations";
const STORAGE_KEY_ACTIVE = "whippt:activeId";

function createDraft() {
    return {
        id: generateId(),
        title: "새 대화",
        messages: [],
        createdAt: Date.now()
    };
}

function loadConversations() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_CONV);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(c => Array.isArray(c.messages) && c.messages.length > 0);
    } catch {
        return [];
    }
}

function loadActiveId(conversations, draftId) {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
        if (saved && conversations.some(c => c.id === saved)) {
            return saved;
        }
    } catch {
        // ignore
    }
    return draftId;
}

function buildInitialState() {
    const conversations = loadConversations();
    const draft = createDraft();
    return {
        conversations,
        draft,
        activeId: loadActiveId(conversations, draft.id)
    };
}

export function useConversations() {
    const [initial] = useState(buildInitialState);
    const [conversations, setConversations] = useState(initial.conversations);
    const [draft, setDraft] = useState(initial.draft);
    const [activeId, setActiveId] = useState(initial.activeId);

    const conversationsRef = useRef(conversations);
    const draftRef = useRef(draft);

    useEffect(() => {
        conversationsRef.current = conversations;
        draftRef.current = draft;
    }, [conversations, draft]);

    const activeConv = useMemo(() => {
        return conversations.find(c => c.id === activeId)
            ?? (activeId === draft.id ? draft : null);
    }, [conversations, activeId, draft]);

    const listedConversations = useMemo(
        () => conversations.filter(c => c.messages.length > 0),
        [conversations]
    );

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_CONV, JSON.stringify(conversations));
    }, [conversations]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_ACTIVE, activeId);
    }, [activeId]);

    const updateConv = useCallback((id, updater) => {
        if (conversationsRef.current.some(c => c.id === id)) {
            setConversations(prev =>
                prev.map(c => (c.id === id ? updater(c) : c))
            );
            return;
        }

        if (draftRef.current.id !== id) return;

        const updated = updater(draftRef.current);
        const newConversations = [updated, ...conversationsRef.current];
        const newDraft = createDraft();

        conversationsRef.current = newConversations;
        draftRef.current = newDraft;

        setConversations(newConversations);
        setDraft(newDraft);
    }, []);

    const goHome = useCallback(() => {
        const newDraft = createDraft();
        draftRef.current = newDraft;
        setDraft(newDraft);
        setActiveId(newDraft.id);
    }, []);

    const startNewDraft = useCallback(() => {
        const newDraft = createDraft();
        draftRef.current = newDraft;
        setDraft(newDraft);
        setActiveId(newDraft.id);
    }, []);

    const deleteConversation = useCallback((id, e) => {
        e?.stopPropagation();
        setConversations(prev => {
            const next = prev.filter(c => c.id !== id);
            conversationsRef.current = next;
            if (activeId === id) {
                if (next.length > 0) {
                    setActiveId(next[0].id);
                } else {
                    const newDraft = createDraft();
                    draftRef.current = newDraft;
                    setDraft(newDraft);
                    setActiveId(newDraft.id);
                }
            }
            return next;
        });
    }, [activeId]);

    return {
        conversations: listedConversations,
        activeId,
        setActiveId,
        activeConv,
        updateConv,
        goHome,
        startNewDraft,
        deleteConversation
    };
}
