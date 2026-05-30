package com.javaduolingo.controller;

import com.javaduolingo.dto.HintRequest;
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

    @PostMapping("/hint")
    public ResponseEntity<Map<String, String>> getHint(@RequestBody HintRequest request) {
        String response = geminiService.askJavaBot(
                request.getQuestion(),
                request.getWrongAnswer(),
                null
        );
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
}
