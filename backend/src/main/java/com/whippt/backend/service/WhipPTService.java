package com.whippt.backend.service;

import com.whippt.backend.dto.OllamaRequest;
import com.whippt.backend.dto.OllamaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class WhipPTService {

    private final WebClient ollamaWebClient;

    /**
     * 사용자의 프롬프트를 받아 Ollama API로 전달하고 스트리밍 응답을 반환하는 메서드
     */
    public Flux<OllamaResponse> getChatStream(String prompt) {
        OllamaRequest request = new OllamaRequest("gemma4", prompt, true);

        return ollamaWebClient.post()
                .uri("/api/generate")
                .bodyValue(request)
                .retrieve()
                .bodyToFlux(OllamaResponse.class)
                .onErrorResume(e -> {
                    OllamaResponse errorResponse = new OllamaResponse();
                    errorResponse.setResponse("[에러: 메인 AI 서버와의 통신이 원활하지 않습니다.]");
                    errorResponse.setDone(true);
                    return Flux.just(errorResponse);
                });
    }

    /**
     * PC의 Ollama 서버가 켜져 있는지 확인하는 초경량 헬스체크 메서드.
     * 3초 안에 응답이 없거나 예외 발생 시 PC가 꺼진 것으로 간주(false)
     */
    public Mono<Boolean> checkOllamaHealth() {
        return ollamaWebClient.get()
                .uri("/")
                .retrieve()
                .toBodilessEntity()
                .map(response -> true)
                .timeout(Duration.ofSeconds(3))
                .onErrorReturn(false);
    }
}