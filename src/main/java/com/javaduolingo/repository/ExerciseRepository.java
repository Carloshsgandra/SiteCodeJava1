package com.javaduolingo.repository;

import com.javaduolingo.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByLessonIdOrderByOrderIndexAsc(Long lessonId);
}
