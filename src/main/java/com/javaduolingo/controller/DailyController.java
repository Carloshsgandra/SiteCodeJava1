package com.javaduolingo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaduolingo.model.Exercise;
import com.javaduolingo.model.User;
import com.javaduolingo.model.UserDailyAttempt;
import com.javaduolingo.repository.UserRepository;
import com.javaduolingo.service.DailyService;
import com.javaduolingo.service.ExerciseService;
import com.javaduolingo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class DailyController {

    private final DailyService dailyService;
    private final ExerciseService exerciseService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/daily")
    public String dailyPage(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = userService.getByUsername(userDetails.getUsername());
        Exercise exercise = dailyService.getTodayExercise();
        Optional<UserDailyAttempt> attempt = dailyService.getTodayAttempt(user.getId());

        model.addAttribute("user", user);
        model.addAttribute("exercise", exercise);
        model.addAttribute("attempt", attempt.orElse(null));
        model.addAttribute("totalCorrect", dailyService.getTotalCorrect(user.getId()));

        if (exercise != null) {
            try {
                List<?> opts = objectMapper.readValue(exercise.getOptionsJson(), List.class);
                model.addAttribute("options", opts);
            } catch (Exception e) {
                model.addAttribute("options", List.of());
            }
        }
        return "daily";
    }

    @PostMapping("/api/daily/submit")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> submitDaily(
            @RequestBody Map<String, String> body,
            Authentication auth) {

        User user = userRepository.findByUsername(auth.getName()).orElseThrow();

        if (dailyService.getTodayAttempt(user.getId()).isPresent()) {
            return ResponseEntity.ok(Map.of("alreadyCompleted", true));
        }

        Long exerciseId = Long.parseLong(body.getOrDefault("exerciseId", "0"));
        String answer = body.getOrDefault("answer", "");
        Exercise exercise = exerciseService.getById(exerciseId);

        boolean correct = exerciseService.checkAnswer(exercise, answer);
        int bonusXp = correct ? 50 : 10;
        userService.addXp(user, bonusXp);

        dailyService.saveAttempt(user, exerciseId, correct);
        user = userRepository.findByUsername(auth.getName()).orElseThrow();

        return ResponseEntity.ok(Map.of(
                "correct", correct,
                "correctAnswer", exercise.getCorrectAnswer(),
                "explanation", exercise.getExplanation() != null ? exercise.getExplanation() : "",
                "bonusXp", bonusXp,
                "totalXp", user.getXp()
        ));
    }
}
