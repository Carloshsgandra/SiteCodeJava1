package com.javaduolingo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.Map;

@RestController
@RequestMapping("/api/code")
@RequiredArgsConstructor
@Slf4j
public class CodeExecutionController {

    private final RestClient pistonRestClient;

    // Java language ID no Judge0
    private static final int JAVA_LANG_ID = 62;

    @PostMapping("/run")
    public ResponseEntity<Map<String, String>> runCode(@RequestBody Map<String, String> body) {
        String code = body.getOrDefault("code", "").trim();
        if (code.isBlank()) {
            return ResponseEntity.ok(Map.of("output", "Código vazio.", "type", "error"));
        }

        String wrapped = wrapIfNeeded(code);

        Map<String, Object> request = Map.of(
                "source_code", wrapped,
                "language_id", JAVA_LANG_ID,
                "stdin", ""
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = pistonRestClient.post()
                    .uri("/submissions?base64_encoded=false&wait=true")
                    .body(request)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                return ResponseEntity.ok(Map.of("output", "Sem resposta do servidor.", "type", "error"));
            }

            String stdout        = nullToEmpty(response.get("stdout"));
            String stderr        = nullToEmpty(response.get("stderr"));
            String compileOutput = nullToEmpty(response.get("compile_output"));
            Object statusObj     = response.get("status");
            int statusId = 3;
            if (statusObj instanceof Map<?,?> statusMap) {
                Object sid = statusMap.get("id");
                if (sid instanceof Number n) statusId = n.intValue();
            }

            // Compilation error
            if (statusId == 6) {
                String msg = compileOutput.isBlank() ? "Erro de compilação." : compileOutput.trim();
                return ResponseEntity.ok(Map.of("output", msg, "type", "error"));
            }

            // Runtime error / TLE
            if (statusId >= 7 || statusId == 5) {
                String msg = stderr.isBlank() ? "Erro em tempo de execução." : stderr.trim();
                return ResponseEntity.ok(Map.of("output", msg, "type", "error"));
            }

            if (!stderr.isBlank()) {
                return ResponseEntity.ok(Map.of("output", stderr.trim(), "type", "error"));
            }

            String output = stdout.isBlank() ? "(sem saída)" : stdout.trim();
            return ResponseEntity.ok(Map.of("output", output, "type", "success"));

        } catch (Exception e) {
            log.warn("Judge0 API error: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("output", "Serviço de execução indisponível.", "type", "error"));
        }
    }

    private String nullToEmpty(Object val) {
        if (val == null || "null".equals(val)) return "";
        return String.valueOf(val);
    }

    private String wrapIfNeeded(String code) {
        if (code.contains("class ")) return code;
        String indented = code.replace("\n", "\n        ");
        return "public class Main {\n    public static void main(String[] args) {\n        "
                + indented + "\n    }\n}";
    }
}
