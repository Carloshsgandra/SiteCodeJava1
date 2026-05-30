package com.javaduolingo.repository;

import com.javaduolingo.model.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    List<ExamAttempt> findByUserIdAndExamIdOrderByCompletedAtDesc(Long userId, Long examId);
    Optional<ExamAttempt> findTopByUserIdAndExamIdOrderByScoreDesc(Long userId, Long examId);
}
