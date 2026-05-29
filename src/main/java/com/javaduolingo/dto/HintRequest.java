package com.javaduolingo.dto;

import lombok.Data;

@Data
public class HintRequest {
    private Long exerciseId;
    private String question;
    private String wrongAnswer;
}
