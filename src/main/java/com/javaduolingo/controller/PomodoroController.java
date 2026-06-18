package com.javaduolingo.controller;

import com.javaduolingo.model.User;
import com.javaduolingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class PomodoroController {

    private final UserRepository userRepo;

    @GetMapping("/pomodoro")
    public String pomodoroPage(Principal principal, Model model) {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        model.addAttribute("user", user);
        return "pomodoro";
    }
}
