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

    public String explainCode(String code) {
        if (apiKey == null || apiKey.isBlank()) return getFallbackResponse("explain");
        String prompt = "Você é um professor de Java explicando código para um iniciante.\n\n"
            + "Explique o código Java abaixo linha por linha, de forma clara e didática.\n"
            + "Use o formato:\n"
            + "**Linha X:** [código] → [explicação simples]\n\n"
            + "Ao final, dê um resumo do que o código faz como um todo.\n\n"
            + "```java\n" + code + "\n```";
        return callWithSystemPrompt(prompt, SYSTEM_PROMPT, 1024);
    }

    public String debugCode(String code, String error) {
        if (apiKey == null || apiKey.isBlank()) return getFallbackResponse("debug");
        String prompt = "Você é um debugger de Java especialista.\n\n"
            + "O aluno está com este erro:\n```\n" + error + "\n```\n\n"
            + "No seguinte código:\n```java\n" + code + "\n```\n\n"
            + "Responda em formato estruturado:\n"
            + "🔴 **Problema:** [descrição clara do erro]\n"
            + "🔍 **Causa:** [por que acontece]\n"
            + "✅ **Solução:** [código corrigido]\n"
            + "📚 **Conceito:** [conceito Java envolvido para estudar]";
        return callWithSystemPrompt(prompt, SYSTEM_PROMPT, 1024);
    }

    public String generateChallenge(String topic, String difficulty) {
        if (apiKey == null || apiKey.isBlank()) return getFallbackResponse("challenge");
        String prompt = "Crie um desafio de programação Java sobre o tópico: **" + topic + "**\n"
            + "Nível de dificuldade: **" + difficulty + "**\n\n"
            + "Formato obrigatório:\n"
            + "## 🎯 Desafio: [título criativo]\n\n"
            + "**Descrição:** [enunciado claro do que deve ser feito]\n\n"
            + "**Entrada:** [o que o programa recebe]\n\n"
            + "**Saída esperada:** [exemplos de entrada/saída]\n\n"
            + "**Dica:** [uma dica sutil para começar]\n\n"
            + "```java\n// Código inicial para o aluno completar\npublic class Desafio {\n    public static void main(String[] args) {\n        // seu código aqui\n    }\n}\n```";
        return callWithSystemPrompt(prompt, SYSTEM_PROMPT, 1024);
    }

    public String pseudocodeToJava(String pseudocode) {
        if (apiKey == null || apiKey.isBlank()) return getFallbackResponse("pseudocode");
        String prompt = "Converta o seguinte pseudocódigo/descrição de algoritmo para Java:\n\n"
            + pseudocode + "\n\n"
            + "Retorne:\n"
            + "1. O código Java completo e funcional\n"
            + "2. Breve explicação das escolhas de implementação\n"
            + "Use boas práticas Java e adicione comentários explicativos.";
        return callWithSystemPrompt(prompt, SYSTEM_PROMPT, 1024);
    }

    public String optimizeCode(String code) {
        if (apiKey == null || apiKey.isBlank()) return getFallbackResponse("optimize");
        String prompt = "Você é um especialista em otimização de código Java.\n\n"
            + "Analise e melhore o código abaixo:\n```java\n" + code + "\n```\n\n"
            + "Forneça:\n"
            + "✨ **Código Otimizado:**\n```java\n[versão melhorada]\n```\n\n"
            + "📋 **Melhorias aplicadas:**\n"
            + "- [lista das melhorias com explicação]\n\n"
            + "Foco em: legibilidade, performance, boas práticas Java e design patterns quando aplicável.";
        return callWithSystemPrompt(prompt, SYSTEM_PROMPT, 1024);
    }

    private String callWithSystemPrompt(String userPrompt, String systemPrompt, int maxTokens) {
        long now = System.currentTimeMillis();
        long last = lastCallTime.get();
        if (now - last < MIN_INTERVAL_MS) {
            try { Thread.sleep(MIN_INTERVAL_MS - (now - last)); } catch (InterruptedException ignored) {}
        }
        lastCallTime.set(System.currentTimeMillis());

        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)));
            body.put("max_tokens", maxTokens);
            body.put("temperature", 0.7);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = geminiRestClient.post()
                .body(body).retrieve().body(Map.class);

            return extractText(response);
        } catch (Exception e) {
            log.warn("AI agent call failed: {}", e.getMessage());
            return getFallbackResponse(userPrompt.substring(0, Math.min(40, userPrompt.length())));
        }
    }

    public String funExplain(String concept) {
        if (apiKey == null || apiKey.isBlank()) return getFallbackResponse("fun-explain");
        String systemPrompt = "Você é o JavaCafé, um amigo descontraído que adora ensinar Java de forma divertida. "
            + "Explique conceitos usando analogias do dia a dia, humor leve e exemplos absurdos mas memoráveis. "
            + "Use linguagem informal, como se estivesse conversando no WhatsApp. "
            + "Quando possível, use emojis para deixar mais animado. "
            + "Faça o estudante sorrir enquanto aprende!";
        String prompt = "Explique de forma descontraída e divertida o seguinte conceito de Java: " + concept + "\n\n"
            + "Use: 1 analogia criativa, 1 exemplo de código simples, 1 fact curiosa sobre o conceito.";
        return callWithSystemPrompt(prompt, systemPrompt, 1024);
    }

    public String javaCafeChat(String message) {
        if (apiKey == null || apiKey.isBlank()) return getFallbackResponse("cafe-chat");
        String systemPrompt = "Você é o JavaCafé, um professor informal de Java. "
            + "Responda em português, de forma casual, amigável e bem-humorada. "
            + "Use analogias criativas (compare código com coisas do cotidiano). "
            + "Seja encorajador, use emojis com moderação e faça o aprendizado parecer uma conversa entre amigos. "
            + "Se a pergunta não for sobre Java, traga ela de volta pro Java de forma engraçada.";
        return callWithSystemPrompt(message, systemPrompt, 800);
    }

    public String generateQuiz(String topic) {
        if (apiKey == null || apiKey.isBlank()) return getFallbackResponse("quiz");
        String prompt = "Crie um quiz rápido e divertido com 5 perguntas de múltipla escolha sobre **" + topic + "** em Java.\n\n"
            + "Formato para cada pergunta:\n"
            + "🤔 **Pergunta X:** [texto da pergunta]\n"
            + "A) [opção]\n"
            + "B) [opção]\n"
            + "C) [opção]\n"
            + "D) [opção]\n"
            + "✅ **Resposta:** [letra] — [breve explicação divertida]\n\n"
            + "Use linguagem informal e adicione curiosidades nas explicações!";
        return callWithSystemPrompt(prompt, "Você é um professor divertido de Java que cria quizzes engajantes. Use linguagem casual em português.", 1200);
    }

    public String javaFacts() {
        if (apiKey == null || apiKey.isBlank()) return getFallbackResponse("facts");
        String prompt = "Me dê 5 fatos curiosos e surpreendentes sobre Java (a linguagem de programação). "
            + "Inclua: história, estatísticas malucas, curiosidades técnicas e fatos que fariam qualquer dev dizer 'nossa, não sabia!'. "
            + "Use emojis, linguagem descontraída e faça parecer um thread viral do Twitter!";
        return callWithSystemPrompt(prompt, "Você compartilha fatos fascinantes sobre Java de forma viral e divertida.", 800);
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
