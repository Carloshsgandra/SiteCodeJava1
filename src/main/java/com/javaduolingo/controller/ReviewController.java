package com.javaduolingo.controller;

import com.javaduolingo.model.User;
import com.javaduolingo.model.UserMistake;
import com.javaduolingo.service.MistakeService;
import com.javaduolingo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ReviewController {

    private final UserService userService;
    private final MistakeService mistakeService;

    @GetMapping("/review")
    public String review(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = userService.getByUsername(userDetails.getUsername());
        List<UserMistake> mistakes = mistakeService.getMistakesForUser(user.getId());
        model.addAttribute("user", user);
        model.addAttribute("mistakes", mistakes);
        model.addAttribute("totalMistakes", mistakes.size());
        return "review";
    }
}
