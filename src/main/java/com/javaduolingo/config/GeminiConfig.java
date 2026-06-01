package com.javaduolingo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class GeminiConfig {

    @Value("${groq.api.url}")
    private String groqUrl;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Bean
    public RestClient geminiRestClient() {
        return RestClient.builder()
                .baseUrl(groqUrl)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Authorization", "Bearer " + groqApiKey)
                .build();
    }

    @Bean
    public RestClient pistonRestClient() {
        // Piston ficou whitelist-only em fev/2026 — usando Judge0 CE
        return RestClient.builder()
                .baseUrl("https://ce.judge0.com")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
