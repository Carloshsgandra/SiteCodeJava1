package com.javaduolingo.repository;

import com.javaduolingo.model.GuidedProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuidedProjectRepository extends JpaRepository<GuidedProject, Long> {
    List<GuidedProject> findAllByOrderByOrderIndexAsc();
}
