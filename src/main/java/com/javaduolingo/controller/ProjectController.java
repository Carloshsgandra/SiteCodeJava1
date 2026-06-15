package com.javaduolingo.controller;

import com.javaduolingo.model.*;
import com.javaduolingo.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class ProjectController {

    private final UserService userService;
    private final ProjectService projectService;

    @GetMapping("/projects")
    public String list(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = userService.getByUsername(userDetails.getUsername());
        List<GuidedProject> projects = projectService.getAllProjects();
        List<UserProjectProgress> userProgress = projectService.getUserProgress(user.getId());

        Map<Long, UserProjectProgress> progressMap = userProgress.stream()
                .collect(Collectors.toMap(p -> p.getProject().getId(), p -> p));

        long completedCount = userProgress.stream().filter(UserProjectProgress::isCompleted).count();

        model.addAttribute("user", user);
        model.addAttribute("projects", projects);
        model.addAttribute("progressMap", progressMap);
        model.addAttribute("completedCount", completedCount);
        return "projects";
    }

    @GetMapping("/projects/{id}")
    public String detail(@PathVariable Long id,
                         @AuthenticationPrincipal UserDetails userDetails,
                         Model model) {
        User user = userService.getByUsername(userDetails.getUsername());
        GuidedProject project = projectService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        List<ProjectStep> steps = projectService.getSteps(id);
        UserProjectProgress progress = projectService.startOrGetProgress(user, project);

        model.addAttribute("user", user);
        model.addAttribute("project", project);
        model.addAttribute("steps", steps);
        model.addAttribute("progress", progress);
        model.addAttribute("totalSteps", steps.size());
        return "project-detail";
    }

    @PostMapping("/projects/{id}/step/{stepNumber}/complete")
    public String completeStep(@PathVariable Long id,
                               @PathVariable int stepNumber,
                               @AuthenticationPrincipal UserDetails userDetails,
                               RedirectAttributes redirectAttrs) {
        User user = userService.getByUsername(userDetails.getUsername());
        projectService.markStepDone(user, id, stepNumber);
        redirectAttrs.addFlashAttribute("stepCompleted", stepNumber);
        return "redirect:/projects/" + id;
    }
}
