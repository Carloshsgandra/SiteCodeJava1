package com.javaduolingo.controller;

import com.javaduolingo.dto.*;
import com.javaduolingo.model.*;
import com.javaduolingo.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@Controller
@RequiredArgsConstructor
public class LessonController {

    private final UserService userService;
    private final LessonService lessonService;
    private final ExerciseService exerciseService;

    @GetMapping("/lesson/{id}")
    public String lessonPage(@PathVariable Long id,
                             @AuthenticationPrincipal UserDetails userDetails,
                             Model model) {
        User user = userService.getByUsername(userDetails.getUsername());
        Lesson lesson = lessonService.getLessonById(id);
        Set<Long> completedIds = lessonService.getCompletedLessonIds(user.getId());

        if (!lessonService.isLessonUnlocked(user, lesson, completedIds)) {
            return "redirect:/dashboard";
        }

        List<Exercise> exercises = lessonService.getExercisesForLesson(id);
        UserProgress progress = lessonService.getOrCreateProgress(user, lesson);

        model.addAttribute("user", user);
        model.addAttribute("lesson", lesson);
        model.addAttribute("exercises", exercises);
        model.addAttribute("progress", progress);
        model.addAttribute("exercisesJson", buildExercisesJson(exercises));
        return "lesson";
    }

    @PostMapping("/api/exercise/submit")
    @ResponseBody
    public ResponseEntity<ExerciseResultResponse> submitExercise(
            @RequestBody ExerciseSubmitRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.getByUsername(userDetails.getUsername());
        Exercise exercise = exerciseService.getById(request.getExerciseId());
        Lesson lesson = lessonService.getLessonById(request.getLessonId());

        boolean correct = exerciseService.checkAnswer(exercise, request.getSubmittedAnswer());
        int xpEarned = 0;
        boolean lessonComplete = false;

        if (correct) {
            xpEarned = exercise.getXpReward();
            userService.addXp(user, xpEarned);
        } else {
            userService.deductHeart(user);
            user = userService.getByUsername(userDetails.getUsername());
        }

        boolean isLast = request.getExerciseIndex() >= request.getTotalExercises() - 1;
        if (correct && isLast) {
            lessonComplete = true;
            lessonService.completeLesson(user, lesson, 100, 5 - user.getHearts());
            userService.addXp(user, lesson.getXpReward());
            xpEarned += lesson.getXpReward();
        } else {
            lessonService.updateExerciseIndex(user, lesson, request.getExerciseIndex() + 1);
        }

        user = userService.getByUsername(userDetails.getUsername());

        return ResponseEntity.ok(ExerciseResultResponse.builder()
                .correct(correct)
                .explanation(exercise.getExplanation())
                .correctAnswer(exercise.getCorrectAnswer())
                .xpEarned(xpEarned)
                .heartsRemaining(user.getHearts())
                .lessonComplete(lessonComplete)
                .lessonId(lesson.getId())
                .totalXp(user.getXp())
                .build());
    }

    private String buildExercisesJson(List<Exercise> exercises) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < exercises.size(); i++) {
            Exercise e = exercises.get(i);
            if (i > 0) sb.append(",");
            sb.append("{")
              .append("\"id\":").append(e.getId()).append(",")
              .append("\"type\":\"").append(e.getType()).append("\",")
              .append("\"question\":").append(jsonString(e.getQuestionText())).append(",")
              .append("\"options\":").append(e.getOptionsJson() != null ? e.getOptionsJson() : "[]").append(",")
              .append("\"codeSnippet\":").append(jsonString(e.getCodeSnippet())).append(",")
              .append("\"xpReward\":").append(e.getXpReward())
              .append("}");
        }
        sb.append("]");
        return sb.toString();
    }

    private String jsonString(String s) {
        if (s == null) return "null";
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"")
                       .replace("\n", "\\n").replace("\r", "\\r") + "\"";
    }
}
