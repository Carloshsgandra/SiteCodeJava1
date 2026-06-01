package com.javaduolingo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaduolingo.model.Exercise;
import com.javaduolingo.model.FlashcardProgress;
import com.javaduolingo.model.User;
import com.javaduolingo.repository.ExerciseRepository;
import com.javaduolingo.repository.UserRepository;
import com.javaduolingo.service.SpacedRepetitionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Controller
@RequiredArgsConstructor
@Slf4j
public class FlashcardController {

    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final SpacedRepetitionService srService;

    @GetMapping("/flashcards")
    public String flashcards(Authentication auth,
                              @RequestParam(defaultValue = "spaced") String mode,
                              Model model) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        List<Exercise> allExercises = exerciseRepository.findAll(Sort.by("id"));

        List<Exercise> exercises;
        String modeLabel;

        if ("all".equals(mode)) {
            exercises = allExercises;
            modeLabel = "Todos os Cartões";
        } else {
            // Spaced repetition: cards due today first, then new cards
            List<FlashcardProgress> due = srService.getDueCards(user.getId());
            Set<Long> dueIds = new HashSet<>();
            due.forEach(fp -> dueIds.add(fp.getExerciseId()));

            List<Exercise> dueExercises = allExercises.stream()
                    .filter(e -> dueIds.contains(e.getId()))
                    .toList();
            List<Exercise> newExercises = allExercises.stream()
                    .filter(e -> !dueIds.contains(e.getId()))
                    .limit(20)
                    .toList();

            exercises = new ArrayList<>();
            exercises.addAll(dueExercises);
            exercises.addAll(newExercises);
            modeLabel = "Revisão Inteligente";
        }

        List<Map<String, Object>> cards = buildCards(exercises);
        Collections.shuffle(cards);

        int dueCount = srService.getDueCount(user.getId());
        int masteredCount = srService.getMasteredCount(user.getId());

        try {
            model.addAttribute("user", user);
            model.addAttribute("cardsJson", objectMapper.writeValueAsString(cards));
            model.addAttribute("totalCards", cards.size());
            model.addAttribute("dueCount", dueCount);
            model.addAttribute("masteredCount", masteredCount);
            model.addAttribute("totalExercises", allExercises.size());
            model.addAttribute("mode", mode);
            model.addAttribute("modeLabel", modeLabel);
        } catch (Exception e) {
            model.addAttribute("cardsJson", "[]");
            model.addAttribute("totalCards", 0);
        }
        return "flashcards";
    }

    @PostMapping("/api/flashcards/rate")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> rateCard(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        Long exerciseId = Long.valueOf(body.get("exerciseId").toString());
        int quality = Integer.parseInt(body.get("quality").toString());

        FlashcardProgress fp = srService.rate(user, exerciseId, quality);
        return ResponseEntity.ok(Map.of(
                "nextReview", fp.getNextReviewDate().toString(),
                "interval", fp.getIntervalDays(),
                "mastered", fp.getCorrectReviews() > 2
        ));
    }

    private List<Map<String, Object>> buildCards(List<Exercise> exercises) {
        List<Map<String, Object>> cards = new ArrayList<>();
        for (Exercise ex : exercises) {
            try {
                List<?> opts = ex.getOptionsJson() != null
                        ? objectMapper.readValue(ex.getOptionsJson(), List.class)
                        : List.of();
                Map<String, Object> card = new HashMap<>();
                card.put("id", ex.getId());
                card.put("question", ex.getQuestionText());
                card.put("answer", ex.getCorrectAnswer());
                card.put("explanation", ex.getExplanation() != null ? ex.getExplanation() : "");
                card.put("code", ex.getCodeSnippet() != null ? ex.getCodeSnippet() : "");
                card.put("options", opts);
                cards.add(card);
            } catch (Exception ignored) {}
        }
        return cards;
    }
}
