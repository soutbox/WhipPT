package com.whippt.backend.service;

import com.whippt.backend.config.OllamaProperties;
import com.whippt.backend.dto.QueueStatusResponse;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ChatQueueService {

    private final Semaphore semaphore;
    private final AtomicInteger activeJobs = new AtomicInteger(0);
    private final AtomicInteger waitingJobs = new AtomicInteger(0);

    public ChatQueueService(OllamaProperties ollamaProperties) {
        this.semaphore = new Semaphore(ollamaProperties.getMaxConcurrent(), true);
    }

    /**
     * Ollama 처리 슬롯을 획득한다. 반환값은 대기열 진입 시점의 대기 순번(1부터).
     */
    public Mono<Integer> acquireSlot() {
        return Mono.fromCallable(() -> {
            int position = waitingJobs.incrementAndGet();
            semaphore.acquire();
            waitingJobs.decrementAndGet();
            activeJobs.incrementAndGet();
            return position;
        }).subscribeOn(Schedulers.boundedElastic());
    }

    public void releaseSlot() {
        activeJobs.decrementAndGet();
        semaphore.release();
    }

    public QueueStatusResponse getStatus() {
        return new QueueStatusResponse(activeJobs.get(), waitingJobs.get());
    }
}
