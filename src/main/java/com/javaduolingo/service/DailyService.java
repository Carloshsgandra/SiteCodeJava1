package com.javaduolingo.service;

import com.javaduolingo.model.Exercise;
import com.javaduolingo.model.User;
import com.javaduolingo.model.UserDailyAttempt;
import com.javaduolingo.repository.ExerciseRepository;
import com.javaduolingo.repository.UserDailyAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DailyService {

    private final ExerciseRepository exerciseRepository;
    private final UserDailyAttemptRepository dailyAttemptRepository;

    public Exercise getTodayExercise() {
        List<Exercise> all = exerciseRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
        if (all.isEmpty()) return null;
        int idx = (int) (LocalDate.now().toEpochDay() % all.size());
        return all.get(idx);
    }

    public Optional<UserDailyAttempt> getTodayAttempt(Long userId) {
        return dailyAttemptRepository.findByUserIdAndChallengeDate(userId, LocalDate.now());
    }

    public UserDailyAttempt saveAttempt(User user, Long exerciseId, boolean correct) {
        UserDailyAttempt attempt = UserDailyAttempt.builder()
                .user(user)
                .challengeDate(LocalDate.now())
                .exerciseId(exerciseId)
                .correct(correct)
                .completedAt(LocalDateTime.now())
                .build();
        return dailyAttemptRepository.save(attempt);
    }

    public long getTotalCorrect(Long userId) {
        return dailyAttemptRepository.countByUserIdAndCorrectTrue(userId);
    }
}
