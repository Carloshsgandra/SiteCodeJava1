package com.javaduolingo.service;

import com.javaduolingo.model.*;
import com.javaduolingo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final GuidedProjectRepository projectRepository;
    private final ProjectStepRepository stepRepository;
    private final UserProjectProgressRepository progressRepository;
    private final UserService userService;

    public List<GuidedProject> getAllProjects() {
        return projectRepository.findAllByOrderByOrderIndexAsc();
    }

    public Optional<GuidedProject> findById(Long id) {
        return projectRepository.findById(id);
    }

    public List<ProjectStep> getSteps(Long projectId) {
        return stepRepository.findByProjectIdOrderByStepNumberAsc(projectId);
    }

    public Optional<UserProjectProgress> getProgress(Long userId, Long projectId) {
        return progressRepository.findByUserIdAndProjectId(userId, projectId);
    }

    public List<UserProjectProgress> getUserProgress(Long userId) {
        return progressRepository.findByUserId(userId);
    }

    public long countCompleted(Long userId) {
        return progressRepository.countByUserIdAndCompletedTrue(userId);
    }

    @Transactional
    public UserProjectProgress startOrGetProgress(User user, GuidedProject project) {
        return progressRepository.findByUserIdAndProjectId(user.getId(), project.getId())
                .orElseGet(() -> {
                    UserProjectProgress p = UserProjectProgress.builder()
                            .user(user)
                            .project(project)
                            .currentStep(1)
                            .startedAt(LocalDateTime.now())
                            .build();
                    return progressRepository.save(p);
                });
    }

    @Transactional
    public boolean advanceStep(User user, Long projectId, int stepNumber) {
        GuidedProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        UserProjectProgress progress = startOrGetProgress(user, project);

        if (stepNumber <= progress.getCurrentStep()) {
            int totalSteps = stepRepository.findByProjectIdOrderByStepNumberAsc(projectId).size();
            if (stepNumber >= totalSteps) {
                if (!progress.isCompleted()) {
                    progress.setCompleted(true);
                    progress.setCurrentStep(totalSteps);
                    progress.setCompletedAt(LocalDateTime.now());
                    progressRepository.save(progress);
                    userService.addXp(user, project.getXpReward());
                    return true; // just completed
                }
            } else {
                int next = stepNumber + 1;
                if (next > progress.getCurrentStep()) {
                    progress.setCurrentStep(next);
                    progressRepository.save(progress);
                }
            }
        }
        return false;
    }

    @Transactional
    public void markStepDone(User user, Long projectId, int stepNumber) {
        GuidedProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        UserProjectProgress progress = startOrGetProgress(user, project);

        List<ProjectStep> steps = stepRepository.findByProjectIdOrderByStepNumberAsc(projectId);
        int totalSteps = steps.size();

        if (stepNumber >= progress.getCurrentStep()) {
            int next = stepNumber + 1;
            if (next > totalSteps) {
                if (!progress.isCompleted()) {
                    progress.setCompleted(true);
                    progress.setCurrentStep(totalSteps);
                    progress.setCompletedAt(LocalDateTime.now());
                    progressRepository.save(progress);
                    userService.addXp(user, project.getXpReward());
                }
            } else {
                progress.setCurrentStep(next);
                progressRepository.save(progress);
            }
        }
    }
}
