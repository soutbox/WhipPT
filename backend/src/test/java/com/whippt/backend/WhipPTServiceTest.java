package com.whippt.backend;

import com.whippt.backend.dto.OllamaResponse;
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

import static org.assertj.core.api.Assertions.assertThat;

class WhipPTServiceTest {

    private MockWebServer mockWebServer;
    private WhipPTService whipPTService;

    @BeforeEach
    void setUp() throws IOException {
        // 1. 가짜 웹 서버 시작
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        // 2. 가짜 웹 서버의 URL을 바라보는 WebClient 생성
        WebClient webClient = WebClient.builder()
                .baseUrl(mockWebServer.url("/").toString())
                .build();

        // 3. 테스트할 Service 객체에 주입
        whipPTService = new WhipPTService(webClient);
    }

    @AfterEach
    void tearDown() throws IOException {
        // 테스트 종료 후 가짜 서버 종료
        mockWebServer.shutdown();
    }

    @Test
    @DisplayName("채팅 요청 중 AI 서버 통신 에러 발생 시 지정된 에러 메시지를 반환한다")
    void getChatStream_Error_ReturnsErrorMessage() {
        // given: 가짜 서버가 500 Internal Server Error를 반환하도록 세팅
        mockWebServer.enqueue(new MockResponse().setResponseCode(500));

        // when: 서비스 메서드 호출
        Flux<OllamaResponse> result = whipPTService.getChatStream("안녕?");

        // then: 비동기 스트림(Flux) 검증
        StepVerifier.create(result)
                .expectNextMatches(response ->
                        response.getResponse().equals("[에러: 메인 AI 서버와의 통신이 원활하지 않습니다.]") &&
                                response.isDone()
                )
                .verifyComplete(); // 스트림이 정상적으로 종료되었는지 확인
    }

    @Test
    @DisplayName("헬스체크 - AI 서버가 정상(200 OK)이면 true를 반환한다")
    void checkOllamaHealth_Success_ReturnsTrue() {
        // given: 가짜 서버가 200 OK를 반환하도록 세팅
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("Ollama is running"));

        // when
        Mono<Boolean> result = whipPTService.checkOllamaHealth();

        // then
        StepVerifier.create(result)
                .expectNext(true)
                .verifyComplete();
    }

    @Test
    @DisplayName("헬스체크 - AI 서버가 비정상(500 에러 등)이면 false를 반환한다")
    void checkOllamaHealth_Error_ReturnsFalse() {
        // given: 가짜 서버가 500 에러를 반환하도록 세팅
        mockWebServer.enqueue(new MockResponse().setResponseCode(500));

        // when
        Mono<Boolean> result = whipPTService.checkOllamaHealth();

        // then
        StepVerifier.create(result)
                .expectNext(false)
                .verifyComplete();
    }
}