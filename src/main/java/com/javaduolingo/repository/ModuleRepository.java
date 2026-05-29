package com.javaduolingo.repository;

import com.javaduolingo.model.LearningModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuleRepository extends JpaRepository<LearningModule, Long> {
    List<LearningModule> findAllByOrderByOrderIndexAsc();
}
