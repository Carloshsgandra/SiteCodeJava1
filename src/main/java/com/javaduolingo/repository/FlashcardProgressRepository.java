package com.javaduolingo.repository;

import com.javaduolingo.model.FlashcardProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FlashcardProgressRepository extends JpaRepository<FlashcardProgress, Long> {

    Optional<FlashcardProgress> findByUserIdAndExerciseId(Long userId, Long exerciseId);

    List<FlashcardProgress> findByUserIdAndNextReviewDateLessThanEqualOrderByNextReviewDate(Long userId, LocalDate date);

    int countByUserId(Long userId);

    int countByUserIdAndCorrectReviewsGreaterThan(Long userId, int threshold);
}
