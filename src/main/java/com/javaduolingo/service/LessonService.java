package com.javaduolingo.service;

import com.javaduolingo.model.*;
import com.javaduolingo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserProgressRepository progressRepository;
    private final ModuleRepository moduleRepository;

    public List<LearningModule> getAllModules() {
        return moduleRepository.findAllByOrderByOrderIndexAsc();
    }

    public Lesson getLessonById(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found: " + id));
    }

    public List<Exercise> getExercisesForLesson(Long lessonId) {
        return exerciseRepository.findByLessonIdOrderByOrderIndexAsc(lessonId);
    }

    public Set<Long> getCompletedLessonIds(Long userId) {
        return progressRepository.findCompletedLessonIdsByUserId(userId);
    }

    public UserProgress getOrCreateProgress(User user, Lesson lesson) {
        return progressRepository.findByUserIdAndLessonId(user.getId(), lesson.getId())
                .orElse(UserProgress.builder().user(user).lesson(lesson).build());
    }

    @Transactional
    public UserProgress completeLesson(User user, Lesson lesson, int score, int heartsUsed) {
        UserProgress progress = getOrCreateProgress(user, lesson);
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setScore(Math.max(progress.getScore(), score));
        progress.setHeartsUsed(heartsUsed);
        return progressRepository.save(progress);
    }

    @Transactional
    public void updateExerciseIndex(User user, Lesson lesson, int index) {
        UserProgress progress = getOrCreateProgress(user, lesson);
        progress.setCurrentExerciseIndex(index);
        progressRepository.save(progress);
    }

    public boolean isLessonUnlocked(User user, Lesson lesson, Set<Long> completedIds) {
        List<Lesson> moduleLessons = lessonRepository.findByModuleIdOrderByOrderIndexAsc(
                lesson.getModule().getId());
        if (moduleLessons.isEmpty()) return true;
        if (moduleLessons.get(0).getId().equals(lesson.getId())) {
            // First lesson in module — unlock if module is first or previous module complete
            LearningModule mod = lesson.getModule();
            if (mod.getOrderIndex() == 1) return true;
            List<LearningModule> allMods = moduleRepository.findAllByOrderByOrderIndexAsc();
            LearningModule prev = allMods.stream()
                    .filter(m -> m.getOrderIndex() == mod.getOrderIndex() - 1)
                    .findFirst().orElse(null);
            if (prev == null) return true;
            List<Lesson> prevLessons = lessonRepository.findByModuleIdOrderByOrderIndexAsc(prev.getId());
            return prevLessons.stream().allMatch(l -> completedIds.contains(l.getId()));
        }
        int idx = 0;
        for (int i = 0; i < moduleLessons.size(); i++) {
            if (moduleLessons.get(i).getId().equals(lesson.getId())) {
                idx = i;
                break;
            }
        }
        return completedIds.contains(moduleLessons.get(idx - 1).getId());
    }
}
