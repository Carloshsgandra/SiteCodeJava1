package com.javaduolingo.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final RestClient geminiRestClient;

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.api.model:llama-3.3-70b-versatile}")
    private String model;

    private final AtomicLong lastCallTime = new AtomicLong(0);
    private static final long MIN_INTERVAL_MS = 2000;

    private static final String SYSTEM_PROMPT = "Você é JavaBot, um professor virtual amigável e paciente especializado em ensinar Java. "
            +
            "Responda sempre em português brasileiro, de forma clara e concisa. " +
            "Use exemplos de código quando necessário. " +
            "Adapte suas explicações para iniciantes e desenvolvedores júnior. " +
            "Seja encorajador e positivo.";

    public String askJavaBot(String question) {
        return askJavaBot(question, null, null);
    }

    public String askJavaBot(String question, String wrongAnswer, String exerciseContext) {
        if (apiKey == null || apiKey.isBlank()) {
            return getFallbackResponse(question);
        }

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
        StringBuilder sb = new StringBuilder();
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
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", List.of(
                Map.of("role", "system", "content", SYSTEM_PROMPT),
                Map.of("role", "user", "content", prompt)));
        body.put("max_tokens", 512);
        body.put("temperature", 0.7);
        return body;
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        if (response == null)
            return getFallbackResponse("null response");
        var choices = (List<Map<String, Object>>) response.get("choices");
        if (choices == null || choices.isEmpty())
            return getFallbackResponse("no choices");
        var message = (Map<String, Object>) choices.get(0).get("message");
        if (message == null)
            return getFallbackResponse("no message");
        return String.valueOf(message.get("content"));
    }

    private String getFallbackResponse(String topic) {
        return "Desculpe, estou com dificuldades para conectar ao servidor agora. " +
                "Tente revisar a documentação oficial do Java ou a lição novamente. " +
                "Configure sua GROQ_API_KEY para habilitar respostas personalizadas!";
    }

    public Map<String, String> simulateExecution(String code) {
        if (apiKey == null || apiKey.isBlank()) {
            return Map.of(
                "output", "⚠️ Compilador JDK indisponível e GROQ_API_KEY não configurada.\nConfigura a chave no Railway para habilitar execução via IA.",
                "type", "error"
            );
        }

        String systemPrompt = "Você é um simulador de runtime Java. " +
            "Dado um código Java, execute-o mentalmente e retorne SOMENTE a saída que o programa produziria no console " +
            "(o que System.out.println/print/printf imprimiria). " +
            "Não inclua explicações, não use markdown, não use blocos de código. " +
            "Se houver erro de compilação, responda: ERRO DE COMPILAÇÃO: <descrição curta>. " +
            "Se houver exceção em runtime, responda: ERRO EM RUNTIME: <tipo da exceção: mensagem>. " +
            "Se o programa não produz nenhuma saída, responda: (sem saída).";

        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", "Execute este código Java:\n\n" + code)
            ));
            body.put("max_tokens", 512);
            body.put("temperature", 0.0);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = geminiRestClient.post()
                .body(body)
                .retrieve()
                .body(Map.class);

            String output = extractText(response);
            boolean isError = output.startsWith("ERRO");
            return Map.of("output", output, "type", isError ? "error" : "success", "source", "ai");
        } catch (Exception e) {
            log.warn("AI simulation failed: {}", e.getMessage());
            return Map.of(
                "output", "Serviço de execução indisponível. Tente novamente mais tarde.",
                "type", "error"
            );
        }
    }
}
