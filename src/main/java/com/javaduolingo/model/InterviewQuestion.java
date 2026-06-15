package com.javaduolingo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String answer;

    @Column(nullable = false)
    private String difficulty; // FACIL, MEDIO, DIFICIL

    @Column(nullable = false)
    private String category; // Fundamentos, OOP, Collections, Streams, Exceptions, JVM

    @Column(columnDefinition = "TEXT")
    private String hint;

    @Column(columnDefinition = "TEXT")
    private String codeExample;

    @Column(nullable = false)
    private int orderIndex;
}
