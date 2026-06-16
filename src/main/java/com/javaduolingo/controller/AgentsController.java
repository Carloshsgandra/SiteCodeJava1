package com.javaduolingo.controller;

import com.javaduolingo.model.User;
import com.javaduolingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class AgentsController {

    private final UserRepository userRepository;

    @GetMapping("/agents")
    public String agentsPage(Model model, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).orElseThrow();
        model.addAttribute("user", user);
        return "agents";
    }
}
