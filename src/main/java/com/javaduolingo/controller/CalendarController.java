package com.javaduolingo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaduolingo.model.User;
import com.javaduolingo.model.UserProgress;
import com.javaduolingo.repository.UserProgressRepository;
import com.javaduolingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Controller
@RequiredArgsConstructor
public class CalendarController {

    private final UserRepository userRepo;
    private final UserProgressRepository progressRepo;

    @GetMapping("/calendar")
    public String calendarPage(Principal principal, Model model) throws Exception {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        List<UserProgress> allProgress = progressRepo.findByUserId(user.getId());

        Map<String, Integer> activityMap = new LinkedHashMap<>();
        for (UserProgress p : allProgress) {
            if (p.isCompleted() && p.getCompletedAt() != null) {
                String day = p.getCompletedAt().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
                activityMap.merge(day, 1, Integer::sum);
            }
        }

        long totalDays = activityMap.size();
        int maxInDay = activityMap.values().stream().mapToInt(Integer::intValue).max().orElse(1);

        model.addAttribute("user", user);
        model.addAttribute("activityJson", new ObjectMapper().writeValueAsString(activityMap));
        model.addAttribute("totalDays", totalDays);
        model.addAttribute("maxInDay", maxInDay);
        model.addAttribute("totalLessons", user.getTotalLessonsCompleted());
        model.addAttribute("streak", user.getStreakDays());
        return "calendar";
    }
}
