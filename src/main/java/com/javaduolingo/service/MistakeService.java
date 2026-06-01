package com.javaduolingo.service;

import com.javaduolingo.model.*;
import com.javaduolingo.repository.UserMistakeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MistakeService {

    private final UserMistakeRepository mistakeRepository;

    @Transactional
    public void recordMistake(User user, Exercise exercise, Lesson lesson) {
        Optional<UserMistake> existing = mistakeRepository
                .findByUserIdAndExerciseId(user.getId(), exercise.getId());

        if (existing.isPresent()) {
            UserMistake m = existing.get();
            m.setMistakeCount(m.getMistakeCount() + 1);
            m.setLastMistakeAt(LocalDateTime.now());
            mistakeRepository.save(m);
        } else {
            UserMistake m = UserMistake.builder()
                    .user(user)
                    .exerciseId(exercise.getId())
                    .questionText(exercise.getQuestionText())
                    .correctAnswer(exercise.getCorrectAnswer())
                    .explanation(exercise.getExplanation())
                    .lessonId(lesson.getId())
                    .lessonTitle(lesson.getTitle())
                    .lastMistakeAt(LocalDateTime.now())
                    .build();
            mistakeRepository.save(m);
        }
    }

    @Transactional
    public void clearMistake(Long userId, Long exerciseId) {
        mistakeRepository.findByUserIdAndExerciseId(userId, exerciseId)
                .ifPresent(mistakeRepository::delete);
    }

    public List<UserMistake> getMistakesForUser(Long userId) {
        return mistakeRepository
                .findByUserIdOrderByMistakeCountDescLastMistakeAtDesc(userId);
    }

    public int getMistakeCount(Long userId) {
        return mistakeRepository.countByUserId(userId);
    }
}
