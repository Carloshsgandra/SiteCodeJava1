package com.javaduolingo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final RestClient geminiRestClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    private final AtomicLong lastCallTime = new AtomicLong(0);
    private static final long MIN_INTERVAL_MS = 2000;

    private static final String SYSTEM_PROMPT =
        "Você é JavaBot, um professor virtual amigável e paciente especializado em ensinar Java. " +
        "Responda sempre em português brasileiro, de forma clara e concisa. " +
        "Use exemplos de código quando necessário. " +
        "Adapte suas explicações para iniciantes e desenvolvedores júnior. " +
        "Seja encorajador e positivo.";

    public String askJavaBot(String question) {
        return askJavaBot(question, null, null);
    }

    public String askJavaBot(String question, String wrongAnswer, String exerciseContext) {
        // Simple rate limiting
        long now = System.currentTimeMillis();
        long last = lastCallTime.get();
        if (now - last < MIN_INTERVAL_MS) {
            return getFallbackResponse(question);
        }
        lastCallTime.set(now);

        try {
            String fullPrompt = buildPrompt(question, wrongAnswer, exerciseContext);
            Map<String, Object> body = buildRequestBody(fullPrompt);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = geminiRestClient.post()
                    .uri("?key=" + apiKey)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            return extractText(response);
        } catch (Exception e) {
            log.warn("Gemini API call failed: {}", e.getMessage());
            return getFallbackResponse(question);
        }
    }

    private String buildPrompt(String question, String wrongAnswer, String context) {
        StringBuilder sb = new StringBuilder(SYSTEM_PROMPT).append("\n\n");
        if (context != null) {
            sb.append("Exercício: ").append(context).append("\n");
        }
        if (wrongAnswer != null) {
            sb.append("O aluno respondeu incorretamente: ").append(wrongAnswer).append("\n");
            sb.append("Explique o erro e ajude o aluno a entender o conceito correto.\n\n");
        }
        sb.append("Pergunta: ").append(question);
        return sb.toString();
    }

    private Map<String, Object> buildRequestBody(String prompt) {
        Map<String, Object> text = new HashMap<>();
        text.put("text", prompt);

        Map<String, Object> part = new HashMap<>();
        part.put("parts", List.of(text));
        part.put("role", "user");

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(part));
        body.put("generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 512,
                "topP", 0.9
        ));
        return body;
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        if (response == null) return getFallbackResponse("null response");
        var candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) return getFallbackResponse("no candidates");
        var content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) return getFallbackResponse("no content");
        var parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) return getFallbackResponse("no parts");
        return String.valueOf(parts.get(0).get("text"));
    }

    private String getFallbackResponse(String topic) {
        return "Desculpe, estou com dificuldades para conectar ao servidor agora. " +
               "Tente revisar a documentação oficial do Java ou a lição novamente. " +
               "Configure sua GEMINI_API_KEY para habilitar respostas personalizadas!";
    }
}
