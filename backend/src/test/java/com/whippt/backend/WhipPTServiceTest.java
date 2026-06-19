package com.whippt.backend;

import com.whippt.backend.config.OllamaProperties;
import com.whippt.backend.dto.OllamaResponse;
import com.whippt.backend.service.ChatQueueService;
import com.whippt.backend.service.WhipPTService;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.io.IOException;

class WhipPTServiceTest {

    private MockWebServer mockWebServer;
    private WhipPTService whipPTService;
    private ChatQueueService chatQueueService;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        OllamaProperties properties = new OllamaProperties();
        properties.setBaseUrl(mockWebServer.url("/").toString());
        properties.setModel("gemma4");
        properties.setHealthTimeoutSeconds(3);
        properties.setMaxConcurrent(1);

        WebClient webClient = WebClient.builder()
                .baseUrl(properties.getBaseUrl())
                .build();

        chatQueueService = new ChatQueueService(properties);
        whipPTService = new WhipPTService(webClient, properties, chatQueueService);
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    @DisplayName("Ollama 오프라인 시 오프라인 안내 메시지를 반환한다")
    void getChatStream_Offline_ReturnsOfflineMessage() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(500));

        Flux<OllamaResponse> result = whipPTService.getChatStream("안녕?");

        StepVerifier.create(result)
                .expectNextMatches(response ->
                        response.getResponse().equals("AI 서버가 오프라인입니다. 잠시 후 다시 시도해주세요.") &&
                                response.isDone() &&
                                "offline".equals(response.getSource())
                )
                .verifyComplete();
    }

    @Test
    @DisplayName("Ollama 통신 에러 시 오프라인 안내 메시지를 반환한다")
    void getChatStream_OllamaError_ReturnsOfflineMessage() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(200));
        mockWebServer.enqueue(new MockResponse().setResponseCode(500));

        Flux<OllamaResponse> result = whipPTService.getChatStream("안녕?");

        StepVerifier.create(result)
                .expectNextMatches(response ->
                        response.getResponse().equals("AI 서버가 오프라인입니다. 잠시 후 다시 시도해주세요.") &&
                                response.isDone()
                )
                .verifyComplete();
    }

    @Test
    @DisplayName("헬스체크 - AI 서버가 정상(200 OK)이면 true를 반환한다")
    void checkOllamaHealth_Success_ReturnsTrue() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("Ollama is running"));

        Mono<Boolean> result = whipPTService.checkOllamaHealth();

        StepVerifier.create(result)
                .expectNext(true)
                .verifyComplete();
    }

    @Test
    @DisplayName("헬스체크 - AI 서버가 비정상이면 false를 반환한다")
    void checkOllamaHealth_Error_ReturnsFalse() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(500));

        Mono<Boolean> result = whipPTService.checkOllamaHealth();

        StepVerifier.create(result)
                .expectNext(false)
                .verifyComplete();
    }
}
