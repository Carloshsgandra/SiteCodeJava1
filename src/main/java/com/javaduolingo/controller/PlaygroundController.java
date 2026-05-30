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
public class PlaygroundController {

    private final UserRepository userRepository;

    @GetMapping("/playground")
    public String playground(Authentication auth, Model model) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        model.addAttribute("user", user);
        return "playground";
    }
}
