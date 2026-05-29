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
}
