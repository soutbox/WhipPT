import {useState, useEffect} from "react";

export function useAiHealth(pollMs = 30_000) {
    const [isAiOnline, setIsAiOnline] = useState(true);

    useEffect(() => {
        let active = true;

        const poll = async () => {
            try {
                const res = await fetch('/api/health');
                const isOk = await res.json();
                if (active) setIsAiOnline(isOk);
            } catch {
                if (active) setIsAiOnline(false);
            }
        };

        const initialId = setTimeout(() => void poll(), 0);
        const intervalId = setInterval(() => void poll(), pollMs);
        const onFocus = () => void poll();
        window.addEventListener('focus', onFocus);

        return () => {
            active = false;
            clearTimeout(initialId);
            clearInterval(intervalId);
            window.removeEventListener('focus', onFocus);
        };
    }, [pollMs]);

    return isAiOnline;
}
