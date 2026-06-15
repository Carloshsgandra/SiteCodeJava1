package com.javaduolingo.controller;

import com.javaduolingo.model.User;
import com.javaduolingo.service.LessonService;
import com.javaduolingo.service.ProjectService;
import com.javaduolingo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Set;

@Controller
@RequiredArgsConstructor
public class RoadmapController {

    private final UserService userService;
    private final LessonService lessonService;
    private final ProjectService projectService;

    @GetMapping("/roadmap")
    public String roadmap(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = userService.getByUsername(userDetails.getUsername());
        Set<Long> completedIds = lessonService.getCompletedLessonIds(user.getId());
        int totalLessons = 30;
        int completedLessons = completedIds.size();
        long completedProjects = projectService.countCompleted(user.getId());

        // Calculate "job readiness" score out of 100
        int lessonScore = (int) Math.min(40, (completedLessons * 40.0 / totalLessons));
        int projectScore = (int) Math.min(30, completedProjects * 6);
        int xpScore = (int) Math.min(20, (user.getXp() / 50));
        int streakScore = Math.min(10, user.getStreakDays() / 3);
        int jobReadiness = lessonScore + projectScore + xpScore + streakScore;

        model.addAttribute("user", user);
        model.addAttribute("completedLessons", completedLessons);
        model.addAttribute("totalLessons", totalLessons);
        model.addAttribute("completedProjects", completedProjects);
        model.addAttribute("jobReadiness", jobReadiness);
        model.addAttribute("lessonScore", lessonScore);
        model.addAttribute("projectScore", projectScore);
        model.addAttribute("xpScore", xpScore);
        model.addAttribute("streakScore", streakScore);
        return "roadmap";
    }
}
