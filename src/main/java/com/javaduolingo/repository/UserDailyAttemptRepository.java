package com.javaduolingo.repository;

import com.javaduolingo.model.UserDailyAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface UserDailyAttemptRepository extends JpaRepository<UserDailyAttempt, Long> {
    Optional<UserDailyAttempt> findByUserIdAndChallengeDate(Long userId, LocalDate date);
    long countByUserIdAndCorrectTrue(Long userId);
}
