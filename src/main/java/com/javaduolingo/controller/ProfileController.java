package com.javaduolingo.controller;

import com.javaduolingo.model.User;
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

        model.addAttribute("user", user);
        model.addAttribute("allAchievements", allAchievements);
        model.addAttribute("xpToNextLevel", 100 - (user.getXp() % 100));
        model.addAttribute("levelProgress", user.getXp() % 100);
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
