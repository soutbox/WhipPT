package com.whippt.backend.controller;

import com.whippt.backend.dto.ChatRequest;
import com.whippt.backend.dto.OllamaResponse;
import com.whippt.backend.service.WhipPTService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WhipPTController {
    private final WhipPTService whipPTService;

    /* 채팅 스트리밍 엔드포인트 */
    @PostMapping("/chat/stream")
    public Flux<OllamaResponse> chatStream(@RequestBody ChatRequest request) {
        return whipPTService.getChatStream(request.getPrompt());
    }

    /* 프론트엔드에서 상태 UI 표시 및 렌더링 분기를 위해 호출할 헬스체크 API 엔드포인트 */
    @GetMapping("/health")
    public Mono<Boolean> healthCheck() {
        return whipPTService.checkOllamaHealth();
    }
}