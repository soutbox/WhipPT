package com.whippt.backend.controller;

import com.whippt.backend.dto.ChatRequest;
import com.whippt.backend.dto.OllamaResponse;
import com.whippt.backend.service.WhipPTService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WhipPTController {

    private final WhipPTService whipPTService;

    // produces = MediaType.TEXT_EVENT_STREAM_VALUE 가 SSE(Server-Sent Events)의 핵심입니다.
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
//    public Flux<String> streamChat(@RequestBody ChatRequest request) {
    public Flux<OllamaResponse> streamChat(@RequestBody ChatRequest request) {
        return whipPTService.getChatStream(request.getPrompt());
    }
}