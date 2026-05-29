package com.javaduolingo.controller;

import com.javaduolingo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @GetMapping("/login")
    public String loginPage(@RequestParam(required = false) String error,
                            @RequestParam(required = false) String logout,
                            Model model) {
        if (error != null) model.addAttribute("error", "Usuário ou senha incorretos.");
        if (logout != null) model.addAttribute("message", "Logout realizado com sucesso!");
        return "auth/login";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "auth/register";
    }

    @PostMapping("/register")
    public String register(@RequestParam String username,
                           @RequestParam String email,
                           @RequestParam String password,
                           @RequestParam String confirmPassword,
                           RedirectAttributes redirectAttributes) {
        if (!password.equals(confirmPassword)) {
            redirectAttributes.addFlashAttribute("error", "As senhas não coincidem.");
            return "redirect:/auth/register";
        }
        if (password.length() < 6) {
            redirectAttributes.addFlashAttribute("error", "A senha deve ter pelo menos 6 caracteres.");
            return "redirect:/auth/register";
        }
        try {
            userService.register(username, email, password);
            redirectAttributes.addFlashAttribute("success", "Conta criada! Faça login para começar.");
            return "redirect:/auth/login";
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/auth/register";
        }
    }
}
