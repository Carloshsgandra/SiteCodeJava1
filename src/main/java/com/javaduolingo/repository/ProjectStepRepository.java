package com.javaduolingo.repository;

import com.javaduolingo.model.ProjectStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectStepRepository extends JpaRepository<ProjectStep, Long> {
    List<ProjectStep> findByProjectIdOrderByStepNumberAsc(Long projectId);
}
