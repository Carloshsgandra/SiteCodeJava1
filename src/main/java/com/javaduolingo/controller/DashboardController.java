package com.javaduolingo.controller;

import com.javaduolingo.model.*;
import com.javaduolingo.repository.ExamAttemptRepository;
import com.javaduolingo.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.*;

@Controller
@RequiredArgsConstructor
public class DashboardController {

    private final UserService userService;
    private final LessonService lessonService;
    private final ExamService examService;
    private final ExamAttemptRepository examAttemptRepository;
    private final MistakeService mistakeService;
    private final SpacedRepetitionService srService;

    @GetMapping({"/", "/dashboard"})
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = userService.getByUsername(userDetails.getUsername());
        userService.updateStreak(user); // streak + corações + conquistas — tudo em uma transação
        user = userService.getByUsername(userDetails.getUsername());

        List<LearningModule> modules = lessonService.getAllModules();
        Set<Long> completedIds = lessonService.getCompletedLessonIds(user.getId());

        Map<Long, Boolean> unlockedMap = new HashMap<>();
        for (LearningModule mod : modules) {
            for (Lesson lesson : mod.getLessons()) {
                unlockedMap.put(lesson.getId(), lessonService.isLessonUnlocked(user, lesson, completedIds));
            }
        }

        int totalLessons = modules.stream().mapToInt(m -> m.getLessons().size()).sum();
        int completedCount = completedIds.size();
        int progressPct = totalLessons > 0 ? (completedCount * 100 / totalLessons) : 0;

        List<Exam> exams = examService.getAllExams();
        Map<Long, ExamAttempt> bestAttempts = new HashMap<>();
        for (Exam exam : exams) {
            examService.getBestAttempt(user.getId(), exam.getId())
                    .ifPresent(a -> bestAttempts.put(exam.getId(), a));
        }

        int weeklyPct = user.getWeeklyGoalXp() > 0
                ? Math.min(100, user.getWeeklyXp() * 100 / user.getWeeklyGoalXp())
                : 0;

        model.addAttribute("user", user);
        model.addAttribute("modules", modules);
        model.addAttribute("completedIds", completedIds);
        model.addAttribute("unlockedMap", unlockedMap);
        model.addAttribute("progressPct", progressPct);
        model.addAttribute("completedCount", completedCount);
        model.addAttribute("totalLessons", totalLessons);
        model.addAttribute("exams", exams);
        model.addAttribute("bestAttempts", bestAttempts);
        model.addAttribute("weeklyXp", user.getWeeklyXp());
        model.addAttribute("weeklyGoalXp", user.getWeeklyGoalXp());
        model.addAttribute("weeklyPct", weeklyPct);
        model.addAttribute("mistakeCount", mistakeService.getMistakeCount(user.getId()));
        model.addAttribute("dueFlashcards", srService.getDueCount(user.getId()));
        return "dashboard";
    }
}
