package com.javaduolingo.repository;

import com.javaduolingo.model.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    Optional<UserProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    List<UserProgress> findByUserId(Long userId);

    @Query("SELECT p.lesson.id FROM UserProgress p WHERE p.user.id = :userId AND p.completed = true")
    Set<Long> findCompletedLessonIdsByUserId(Long userId);
}
