package com.javaduolingo.controller;

import com.javaduolingo.model.LearningModule;
import com.javaduolingo.model.User;
import com.javaduolingo.service.DailyService;
import com.javaduolingo.service.LessonService;
import com.javaduolingo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.*;

@Controller
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final LessonService lessonService;
    private final DailyService dailyService;

    @GetMapping("/profile")
    public String profile(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = userService.getByUsername(userDetails.getUsername());

        List<Map<String, String>> allAchievements = List.of(
            Map.of("key", "XP_100",    "title", "Primeiros Passos",    "desc", "Ganhe 100 XP",      "icon", "🌱"),
            Map.of("key", "XP_500",    "title", "Em Evolução",         "desc", "Ganhe 500 XP",      "icon", "🌿"),
            Map.of("key", "XP_1000",   "title", "Desenvolvedor",       "desc", "Ganhe 1000 XP",     "icon", "💻"),
            Map.of("key", "XP_5000",   "title", "Java Master",         "desc", "Ganhe 5000 XP",     "icon", "🏆"),
            Map.of("key", "STREAK_7",  "title", "Semana Perfeita",     "desc", "7 dias seguidos",   "icon", "🔥"),
            Map.of("key", "STREAK_30", "title", "Mês de Dedicação",    "desc", "30 dias seguidos",  "icon", "⚡")
        );

        // Chart data: module completion
        List<LearningModule> modules = lessonService.getAllModules();
        Set<Long> completedIds = lessonService.getCompletedLessonIds(user.getId());
        List<String> moduleLabels = new ArrayList<>();
        List<Integer> modulePcts = new ArrayList<>();
        for (LearningModule m : modules) {
            moduleLabels.add(m.getTitle());
            int total = m.getLessons().size();
            long done = m.getLessons().stream().filter(l -> completedIds.contains(l.getId())).count();
            modulePcts.add(total > 0 ? (int)(done * 100 / total) : 0);
        }

        model.addAttribute("user", user);
        model.addAttribute("allAchievements", allAchievements);
        model.addAttribute("xpToNextLevel", 100 - (user.getXp() % 100));
        model.addAttribute("levelProgress", user.getXp() % 100);
        model.addAttribute("moduleLabels", moduleLabels);
        model.addAttribute("modulePcts", modulePcts);
        model.addAttribute("totalDailiesCorrect", dailyService.getTotalCorrect(user.getId()));
        return "profile";
    }

    @GetMapping("/leaderboard")
    public String leaderboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = userService.getByUsername(userDetails.getUsername());
        List<User> top10 = userService.getLeaderboard();
        model.addAttribute("user", user);
        model.addAttribute("topUsers", top10);
        return "leaderboard";
    }
}
