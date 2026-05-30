package com.javaduolingo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/code")
@RequiredArgsConstructor
@Slf4j
public class CodeExecutionController {

    private final RestClient pistonRestClient;

    @PostMapping("/run")
    public ResponseEntity<Map<String, String>> runCode(@RequestBody Map<String, String> body) {
        String code = body.getOrDefault("code", "").trim();
        if (code.isBlank()) {
            return ResponseEntity.ok(Map.of("output", "Código vazio.", "type", "error"));
        }

        String wrapped = wrapIfNeeded(code);

        Map<String, Object> request = Map.of(
                "language", "java",
                "version", "*",
                "files", List.of(Map.of("name", "Main.java", "content", wrapped))
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = pistonRestClient.post()
                    .uri("/execute")
                    .body(request)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                return ResponseEntity.ok(Map.of("output", "Sem resposta do servidor.", "type", "error"));
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> run = (Map<String, Object>) response.get("run");
            if (run == null) {
                return ResponseEntity.ok(Map.of("output", "Erro na execução.", "type", "error"));
            }

            String stdout = String.valueOf(run.getOrDefault("stdout", ""));
            String stderr  = String.valueOf(run.getOrDefault("stderr",  ""));

            if (!stderr.isBlank() && !"null".equals(stderr)) {
                return ResponseEntity.ok(Map.of("output", stderr.trim(), "type", "error"));
            }
            String output = stdout.isBlank() || "null".equals(stdout) ? "(sem saída)" : stdout.trim();
            return ResponseEntity.ok(Map.of("output", output, "type", "success"));

        } catch (Exception e) {
            log.warn("Piston API error: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("output", "Serviço de execução indisponível.", "type", "error"));
        }
    }

    private String wrapIfNeeded(String code) {
        if (code.contains("class ")) return code;
        String indented = code.replace("\n", "\n        ");
        return "public class Main {\n    public static void main(String[] args) {\n        "
                + indented + "\n    }\n}";
    }
}
