package com.whippt.backend.service;

import com.whippt.backend.config.OllamaProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

class ChatQueueServiceTest {

    @Test
    @DisplayName("maxConcurrent=1일 때 두 번째 요청은 대기열에 진입한다")
    void acquireSlot_whenAtCapacity_secondRequestWaits() throws InterruptedException {
        OllamaProperties properties = new OllamaProperties();
        properties.setMaxConcurrent(1);
        ChatQueueService queue = new ChatQueueService(properties);

        queue.acquireSlot().block();
        assertThat(queue.getStatus().getActiveJobs()).isEqualTo(1);

        CountDownLatch secondAcquired = new CountDownLatch(1);
        Thread waiting = new Thread(() -> {
            queue.acquireSlot().block();
            secondAcquired.countDown();
        });
        waiting.start();

        boolean sawWaiting = false;
        for (int i = 0; i < 25; i++) {
            if (queue.getStatus().getWaitingJobs() >= 1) {
                sawWaiting = true;
                break;
            }
            Thread.sleep(20);
        }
        assertThat(sawWaiting).isTrue();

        queue.releaseSlot();
        assertThat(secondAcquired.await(3, TimeUnit.SECONDS)).isTrue();
        queue.releaseSlot();

        assertThat(queue.getStatus().getActiveJobs()).isEqualTo(0);
        assertThat(queue.getStatus().getWaitingJobs()).isEqualTo(0);
    }
}
