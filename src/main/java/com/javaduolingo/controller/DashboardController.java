package com.javaduolingo.controller;

import com.javaduolingo.model.*;
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

    @GetMapping({"/", "/dashboard"})
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = userService.getByUsername(userDetails.getUsername());
        userService.updateStreak(user);

        List<LearningModule> modules = lessonService.getAllModules();
        Set<Long> completedIds = lessonService.getCompletedLessonIds(user.getId());

        // Build unlock status for each lesson
        Map<Long, Boolean> unlockedMap = new HashMap<>();
        for (LearningModule mod : modules) {
            for (Lesson lesson : mod.getLessons()) {
                boolean unlocked = lessonService.isLessonUnlocked(user, lesson, completedIds);
                unlockedMap.put(lesson.getId(), unlocked);
            }
        }

        int totalLessons = modules.stream().mapToInt(m -> m.getLessons().size()).sum();
        int completedCount = completedIds.size();
        int progressPct = totalLessons > 0 ? (completedCount * 100 / totalLessons) : 0;

        model.addAttribute("user", user);
        model.addAttribute("modules", modules);
        model.addAttribute("completedIds", completedIds);
        model.addAttribute("unlockedMap", unlockedMap);
        model.addAttribute("progressPct", progressPct);
        model.addAttribute("completedCount", completedCount);
        model.addAttribute("totalLessons", totalLessons);
        return "dashboard";
    }
}
