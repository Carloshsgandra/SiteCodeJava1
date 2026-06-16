package com.javaduolingo.controller;

import com.javaduolingo.dto.HintRequest;
import com.javaduolingo.model.Exercise;
import com.javaduolingo.repository.ExerciseRepository;
import com.javaduolingo.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/javabot")
@RequiredArgsConstructor
public class JavaBotController {

    private final GeminiService geminiService;
    private final ExerciseRepository exerciseRepository;

    @PostMapping("/hint")
    public ResponseEntity<Map<String, String>> getHint(@RequestBody HintRequest request) {
        String response = geminiService.askJavaBot(
                request.getQuestion(),
                request.getWrongAnswer(),
                null
        );
        return ResponseEntity.ok(Map.of("hint", response));
    }

    @PostMapping("/hint-level")
    public ResponseEntity<Map<String, String>> getLeveledHint(@RequestBody Map<String, Object> body) {
        Long exerciseId = Long.valueOf(body.get("exerciseId").toString());
        int level = Integer.parseInt(body.getOrDefault("level", "1").toString());

        Exercise ex = exerciseRepository.findById(exerciseId).orElse(null);
        if (ex == null) {
            return ResponseEntity.ok(Map.of("hint", "Exercício não encontrado."));
        }

        String prompt = buildLeveledPrompt(ex, level);
        String response = geminiService.askJavaBot(prompt);
        return ResponseEntity.ok(Map.of("hint", response));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> body) {
        String question = body.getOrDefault("message", "");
        String response = geminiService.askJavaBot(question);
        return ResponseEntity.ok(Map.of("response", response));
    }

    @PostMapping("/review")
    public ResponseEntity<Map<String, String>> reviewCode(@RequestBody Map<String, String> body) {
        String code = body.getOrDefault("code", "").trim();
        if (code.isBlank()) {
            return ResponseEntity.ok(Map.of("review", "Nenhum código para revisar."));
        }
        String prompt = "Você é um professor de Java revisando o código de um estudante.\n\n"
                + "Revise este código Java e forneça:\n"
                + "1. ✅ O que está correto\n"
                + "2. ❌ Erros ou problemas encontrados\n"
                + "3. 💡 Sugestões de melhoria\n"
                + "4. 📚 Conceitos relacionados para estudar\n\n"
                + "Seja didático e encorajador. Código:\n\n```java\n" + code + "\n```";
        String response = geminiService.askJavaBot(prompt);
        return ResponseEntity.ok(Map.of("review", response));
    }

    @PostMapping("/explain")
    public ResponseEntity<Map<String, String>> explainCode(@RequestBody Map<String, String> body) {
        String code = body.getOrDefault("code", "").trim();
        if (code.isBlank()) return ResponseEntity.ok(Map.of("result", "Nenhum código para explicar."));
        return ResponseEntity.ok(Map.of("result", geminiService.explainCode(code)));
    }

    @PostMapping("/debug")
    public ResponseEntity<Map<String, String>> debugCode(@RequestBody Map<String, String> body) {
        String code = body.getOrDefault("code", "").trim();
        String error = body.getOrDefault("error", "").trim();
        if (code.isBlank()) return ResponseEntity.ok(Map.of("result", "Nenhum código fornecido."));
        return ResponseEntity.ok(Map.of("result", geminiService.debugCode(code, error)));
    }

    @PostMapping("/challenge")
    public ResponseEntity<Map<String, String>> generateChallenge(@RequestBody Map<String, String> body) {
        String topic = body.getOrDefault("topic", "variáveis");
        String difficulty = body.getOrDefault("difficulty", "Iniciante");
        return ResponseEntity.ok(Map.of("result", geminiService.generateChallenge(topic, difficulty)));
    }

    @PostMapping("/pseudocode")
    public ResponseEntity<Map<String, String>> pseudocodeToJava(@RequestBody Map<String, String> body) {
        String pseudocode = body.getOrDefault("pseudocode", "").trim();
        if (pseudocode.isBlank()) return ResponseEntity.ok(Map.of("result", "Nenhum pseudocódigo fornecido."));
        return ResponseEntity.ok(Map.of("result", geminiService.pseudocodeToJava(pseudocode)));
    }

    @PostMapping("/optimize")
    public ResponseEntity<Map<String, String>> optimizeCode(@RequestBody Map<String, String> body) {
        String code = body.getOrDefault("code", "").trim();
        if (code.isBlank()) return ResponseEntity.ok(Map.of("result", "Nenhum código para otimizar."));
        return ResponseEntity.ok(Map.of("result", geminiService.optimizeCode(code)));
    }

    @PostMapping("/fun-explain")
    public ResponseEntity<Map<String, String>> funExplain(@RequestBody Map<String, String> body) {
        String concept = body.getOrDefault("concept", "").trim();
        if (concept.isBlank()) return ResponseEntity.ok(Map.of("result", "Qual conceito você quer aprender?"));
        return ResponseEntity.ok(Map.of("result", geminiService.funExplain(concept)));
    }

    @PostMapping("/cafe-chat")
    public ResponseEntity<Map<String, String>> cafeChat(@RequestBody Map<String, String> body) {
        String message = body.getOrDefault("message", "").trim();
        if (message.isBlank()) return ResponseEntity.ok(Map.of("response", "Oi! Me pergunta algo sobre Java!"));
        return ResponseEntity.ok(Map.of("response", geminiService.javaCafeChat(message)));
    }

    @PostMapping("/quiz")
    public ResponseEntity<Map<String, String>> generateQuiz(@RequestBody Map<String, String> body) {
        String topic = body.getOrDefault("topic", "orientação a objetos");
        return ResponseEntity.ok(Map.of("result", geminiService.generateQuiz(topic)));
    }

    @PostMapping("/facts")
    public ResponseEntity<Map<String, String>> javaFacts(@RequestBody(required = false) Map<String, String> body) {
        return ResponseEntity.ok(Map.of("result", geminiService.javaFacts()));
    }

    private String buildLeveledPrompt(Exercise ex, int level) {
        String question = ex.getQuestionText();
        String answer = ex.getCorrectAnswer();
        switch (level) {
            case 1 -> {
                return "Dê uma dica MUITO SUTIL (nível 1 de 3) para esta questão de Java. "
                        + "NÃO revele a resposta. Apenas direcione o raciocínio com 1-2 frases curtas.\n\n"
                        + "Pergunta: " + question;
            }
            case 2 -> {
                return "Dê uma dica MODERADA (nível 2 de 3) para esta questão de Java. "
                        + "Explique o conceito envolvido sem revelar a resposta direta. "
                        + "Use no máximo 3-4 frases.\n\n"
                        + "Pergunta: " + question;
            }
            default -> {
                return "Explique completamente (nível 3 de 3) como resolver esta questão de Java. "
                        + "Mostre o raciocínio passo a passo. A resposta correta é: " + answer + "\n\n"
                        + "Pergunta: " + question + "\n\n"
                        + "Explique POR QUE essa resposta está correta e o que o estudante precisa aprender.";
            }
        }
    }
}
