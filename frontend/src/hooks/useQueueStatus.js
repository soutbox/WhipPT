import {useState, useEffect, useRef} from "react";

const POLL_BUSY_MS = 1500;
const POLL_IDLE_MS = 5000;

export function useQueueStatus(isAiOnline, isStreaming) {
    const [status, setStatus] = useState({activeJobs: 0, waitingJobs: 0});
    const waitingJobsRef = useRef(0);

    useEffect(() => {
        if (!isAiOnline) {
            setStatus({activeJobs: 0, waitingJobs: 0});
            waitingJobsRef.current = 0;
            return;
        }

        let active = true;
        let timeoutId;

        const poll = async () => {
            try {
                const res = await fetch('/api/queue/status');
                if (!res.ok) return;
                const data = await res.json();
                if (active) {
                    const waitingJobs = data.waitingJobs ?? 0;
                    waitingJobsRef.current = waitingJobs;
                    setStatus({
                        activeJobs: data.activeJobs ?? 0,
                        waitingJobs,
                    });
                }
            } catch {
                // ignore transient network errors
            }
        };

        const scheduleNext = () => {
            const busy = isStreaming || waitingJobsRef.current > 0;
            const ms = busy ? POLL_BUSY_MS : POLL_IDLE_MS;
            timeoutId = setTimeout(async () => {
                await poll();
                if (active) scheduleNext();
            }, ms);
        };

        void poll();
        scheduleNext();

        const onFocus = () => void poll();
        window.addEventListener('focus', onFocus);

        return () => {
            active = false;
            clearTimeout(timeoutId);
            window.removeEventListener('focus', onFocus);
        };
    }, [isAiOnline, isStreaming]);

    return status;
}
