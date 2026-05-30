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
        return RestClient.builder()
                .baseUrl("https://emkc.org/api/v2/piston")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
