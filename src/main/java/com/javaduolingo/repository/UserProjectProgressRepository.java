package com.javaduolingo.repository;

import com.javaduolingo.model.UserProjectProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserProjectProgressRepository extends JpaRepository<UserProjectProgress, Long> {
    Optional<UserProjectProgress> findByUserIdAndProjectId(Long userId, Long projectId);
    List<UserProjectProgress> findByUserId(Long userId);
    long countByUserIdAndCompletedTrue(Long userId);
}
