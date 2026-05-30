package com.javaduolingo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaduolingo.model.Exercise;
import com.javaduolingo.model.User;
import com.javaduolingo.repository.ExerciseRepository;
import com.javaduolingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class FlashcardController {

    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/flashcards")
    public String flashcards(Authentication auth,
                              @RequestParam(defaultValue = "0") Long moduleId,
                              Model model) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        List<Exercise> exercises = exerciseRepository.findAll(Sort.by("id"));

        List<Map<String, Object>> cards = new ArrayList<>();
        for (Exercise ex : exercises) {
            try {
                List<?> opts = ex.getOptionsJson() != null
                        ? objectMapper.readValue(ex.getOptionsJson(), List.class)
                        : List.of();
                cards.add(Map.of(
                        "id", ex.getId(),
                        "question", ex.getQuestionText(),
                        "answer", ex.getCorrectAnswer(),
                        "explanation", ex.getExplanation() != null ? ex.getExplanation() : "",
                        "code", ex.getCodeSnippet() != null ? ex.getCodeSnippet() : "",
                        "options", opts
                ));
            } catch (Exception ignored) {}
        }

        Collections.shuffle(cards);

        try {
            model.addAttribute("user", user);
            model.addAttribute("cardsJson", objectMapper.writeValueAsString(cards));
            model.addAttribute("totalCards", cards.size());
        } catch (Exception e) {
            model.addAttribute("cardsJson", "[]");
            model.addAttribute("totalCards", 0);
        }
        return "flashcards";
    }
}
