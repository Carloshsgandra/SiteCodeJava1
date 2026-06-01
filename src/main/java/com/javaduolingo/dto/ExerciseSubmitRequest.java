package com.javaduolingo.dto;

import lombok.Data;

@Data
public class ExerciseSubmitRequest {
    private Long exerciseId;
    private Long lessonId;
    private String submittedAnswer;
    private int exerciseIndex;
    private int totalExercises;
    private Boolean practiceMode;
}
