package com.javaduolingo.controller;

import com.javaduolingo.model.User;
import com.javaduolingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class RankingController {

    private final UserRepository userRepository;

    @GetMapping("/ranking")
    public String rankingPage(Model model, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return "redirect:/auth/login";
        }
        User currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (currentUser == null) return "redirect:/auth/logout";

        List<User> top20 = userRepository.findTop20ByOrderByXpDesc();
        long userRank = userRepository.countByXpGreaterThan(currentUser.getXp()) + 1;

        model.addAttribute("user", currentUser);
        model.addAttribute("topUsers", top20);
        model.addAttribute("userRank", userRank);
        model.addAttribute("totalUsers", userRepository.count());
        return "ranking";
    }
}
