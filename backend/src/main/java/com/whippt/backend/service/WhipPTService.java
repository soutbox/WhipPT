package com.whippt.backend.service;

import com.whippt.backend.config.OllamaProperties;
import com.whippt.backend.dto.OllamaRequest;
import com.whippt.backend.dto.OllamaResponse;
import com.whippt.backend.dto.QueueStatusResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class WhipPTService {

    private static final String OFFLINE_MESSAGE = "AI 서버가 오프라인입니다. 잠시 후 다시 시도해주세요.";

    private final WebClient ollamaWebClient;
    private final OllamaProperties ollamaProperties;
    private final ChatQueueService chatQueueService;

    public Flux<OllamaResponse> getChatStream(String prompt) {
        return chatQueueService.acquireSlot()
                .flatMapMany(queuePosition -> {
                    Flux<OllamaResponse> queueEvent = queuePosition > 1
                            ? Flux.just(queueEvent(queuePosition))
                            : Flux.empty();

                    return queueEvent.concatWith(
                            checkOllamaHealth().flatMapMany(healthy -> {
                                if (!healthy) {
                                    log.warn("Ollama 오프라인 — 채팅 요청 거부");
                                    return offlineResponse();
                                }
                                return streamFromOllama(prompt);
                            })
                    );
                })
                .doFinally(signal -> chatQueueService.releaseSlot());
    }

    public Mono<Boolean> checkOllamaHealth() {
        return ollamaWebClient.get()
                .uri("/")
                .retrieve()
                .toBodilessEntity()
                .map(response -> true)
                .timeout(Duration.ofSeconds(ollamaProperties.getHealthTimeoutSeconds()))
                .onErrorReturn(false);
    }

    public QueueStatusResponse getQueueStatus() {
        return chatQueueService.getStatus();
    }

    private Flux<OllamaResponse> streamFromOllama(String prompt) {
        OllamaRequest request = new OllamaRequest(
                ollamaProperties.getModel(), prompt, true);
        log.info("채팅 요청 시작: model={}, prompt={}", ollamaProperties.getModel(), prompt);

        return ollamaWebClient.post()
                .uri("/api/generate")
                .bodyValue(request)
                .retrieve()
                .bodyToFlux(OllamaResponse.class)
                .map(response -> {
                    response.setSource("ollama");
                    return response;
                })
                .onErrorResume(e -> {
                    log.error("Ollama 통신 에러", e);
                    return offlineResponse();
                });
    }

    private Flux<OllamaResponse> offlineResponse() {
        OllamaResponse response = new OllamaResponse();
        response.setResponse(OFFLINE_MESSAGE);
        response.setDone(true);
        response.setSource("offline");
        return Flux.just(response);
    }

    private OllamaResponse queueEvent(int queuePosition) {
        OllamaResponse response = new OllamaResponse();
        response.setQueuePosition(queuePosition);
        response.setDone(false);
        response.setSource("queue");
        return response;
    }
}
