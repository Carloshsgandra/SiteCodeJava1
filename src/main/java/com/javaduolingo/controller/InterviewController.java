package com.javaduolingo.controller;

import com.javaduolingo.model.InterviewQuestion;
import com.javaduolingo.model.User;
import com.javaduolingo.service.InterviewService;
import com.javaduolingo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class InterviewController {

    private final UserService userService;
    private final InterviewService interviewService;

    @GetMapping("/interview")
    public String interview(@AuthenticationPrincipal UserDetails userDetails,
                            @RequestParam(required = false) String category,
                            @RequestParam(required = false) String difficulty,
                            Model model) {
        User user = userService.getByUsername(userDetails.getUsername());

        List<InterviewQuestion> questions;
        if (category != null && !category.isBlank()) {
            questions = interviewService.getByCategory(category);
        } else if (difficulty != null && !difficulty.isBlank()) {
            questions = interviewService.getByDifficulty(difficulty);
        } else {
            questions = interviewService.getAll();
        }

        Map<String, List<InterviewQuestion>> grouped = interviewService.groupedByCategory();
        List<String> categories = interviewService.getCategories();

        model.addAttribute("user", user);
        model.addAttribute("questions", questions);
        model.addAttribute("grouped", grouped);
        model.addAttribute("categories", categories);
        model.addAttribute("selectedCategory", category);
        model.addAttribute("selectedDifficulty", difficulty);
        model.addAttribute("totalCount", interviewService.countTotal());
        return "interview";
    }
}
