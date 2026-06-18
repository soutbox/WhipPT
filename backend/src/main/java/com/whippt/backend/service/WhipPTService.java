package com.whippt.backend.service;

import com.whippt.backend.dto.OllamaRequest;
import com.whippt.backend.dto.OllamaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class WhipPTService {

    private final WebClient ollamaWebClient;

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
}