package com.whippt.backend.controller;

import com.whippt.backend.dto.ChatRequest;
import com.whippt.backend.dto.OllamaResponse;
import com.whippt.backend.dto.QueueStatusResponse;
import com.whippt.backend.service.WhipPTService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WhipPTController {
    private final WhipPTService whipPTService;

    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<OllamaResponse> chatStream(@RequestBody ChatRequest request) {
        return whipPTService.getChatStream(request.getPrompt());
    }

    @GetMapping("/health")
    public Mono<Boolean> healthCheck() {
        return whipPTService.checkOllamaHealth();
    }   

    @GetMapping("/queue/status")
    public QueueStatusResponse queueStatus() {
        return whipPTService.getQueueStatus();
    }
}