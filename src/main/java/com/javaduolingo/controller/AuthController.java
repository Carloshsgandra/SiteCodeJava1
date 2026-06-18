package com.javaduolingo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/auth")
public class AuthController {

    @GetMapping("/login")
    public String loginPage(@RequestParam(required = false) String error,
                            Model model) {
        if (error != null) model.addAttribute("error", true);
        return "auth/login";
    }

    @GetMapping("/register")
    public String register() {
        return "redirect:/auth/login";
    }
}
