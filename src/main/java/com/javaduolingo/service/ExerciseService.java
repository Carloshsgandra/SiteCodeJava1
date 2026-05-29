package com.javaduolingo.service;

import com.javaduolingo.model.Exercise;
import com.javaduolingo.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public Exercise getById(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found: " + id));
    }

    public boolean checkAnswer(Exercise exercise, String submitted) {
        if (submitted == null) return false;
        String correct = exercise.getCorrectAnswer().trim().toLowerCase();
        String answer = submitted.trim().toLowerCase();
        return correct.equals(answer);
    }
}
