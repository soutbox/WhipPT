package com.whippt.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class OllamaConfig {

    private final OllamaProperties ollamaProperties;

    @Bean
    public WebClient ollamaWebClient() {
        return WebClient.builder()
                .baseUrl(ollamaProperties.getBaseUrl())
                .filter((request, next) -> {
                    log.info("Request: {} {}", request.method(), request.url());
                    return next.exchange(request)
                            .doOnNext(response -> log.info("Response: {}", response.statusCode()));
                })
                .build();
    }
}