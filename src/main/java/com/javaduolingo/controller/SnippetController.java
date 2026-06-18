package com.javaduolingo.controller;

import com.javaduolingo.model.CodeSnippet;
import com.javaduolingo.model.User;
import com.javaduolingo.repository.CodeSnippetRepository;
import com.javaduolingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@Controller
@RequiredArgsConstructor
public class SnippetController {

    private final CodeSnippetRepository snippetRepo;
    private final UserRepository userRepo;

    @GetMapping("/snippets")
    public String snippetsPage(Principal principal, Model model) {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        model.addAttribute("user", user);
        model.addAttribute("snippets", snippetRepo.findByUsernameOrderByCreatedAtDesc(principal.getName()));
        return "snippets";
    }

    @PostMapping("/api/snippets")
    @ResponseBody
    public Map<String, Object> saveSnippet(@RequestBody CodeSnippet snippet, Principal principal) {
        snippet.setId(null);
        snippet.setUsername(principal.getName());
        if (snippet.getLanguage() == null || snippet.getLanguage().isBlank()) snippet.setLanguage("Java");
        CodeSnippet saved = snippetRepo.save(snippet);
        return Map.of("id", saved.getId(), "success", true);
    }

    @DeleteMapping("/api/snippets/{id}")
    @ResponseBody
    public Map<String, Boolean> deleteSnippet(@PathVariable Long id, Principal principal) {
        snippetRepo.findById(id).ifPresent(s -> {
            if (s.getUsername().equals(principal.getName())) snippetRepo.delete(s);
        });
        return Map.of("success", true);
    }

    @GetMapping("/api/snippets")
    @ResponseBody
    public List<CodeSnippet> listSnippets(@RequestParam(required = false) String q, Principal principal) {
        if (q != null && !q.isBlank()) return snippetRepo.searchByUsername(principal.getName(), q);
        return snippetRepo.findByUsernameOrderByCreatedAtDesc(principal.getName());
    }
}
