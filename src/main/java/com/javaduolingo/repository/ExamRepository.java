package com.javaduolingo.repository;

import com.javaduolingo.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findAllByOrderByOrderIndexAsc();
}
