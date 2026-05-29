package com.javaduolingo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExerciseResultResponse {
    private boolean correct;
    private String explanation;
    private String correctAnswer;
    private int xpEarned;
    private int heartsRemaining;
    private boolean lessonComplete;
    private Long lessonId;
    private int totalXp;
}
