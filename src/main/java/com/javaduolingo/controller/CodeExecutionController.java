package com.javaduolingo.controller;

import com.javaduolingo.service.JavaExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/code")
@RequiredArgsConstructor
public class CodeExecutionController {

    private final JavaExecutionService executionService;

    @PostMapping("/run")
    public ResponseEntity<Map<String, String>> runCode(@RequestBody Map<String, String> body) {
        String code = body.getOrDefault("code", "").trim();
        if (code.isBlank()) {
            return ResponseEntity.ok(Map.of("output", "Código vazio.", "type", "error"));
        }
        return ResponseEntity.ok(executionService.execute(code));
    }
}
