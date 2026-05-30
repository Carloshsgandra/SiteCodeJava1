package com.javaduolingo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Integer passingScore = 70;

    @Column(nullable = false)
    @Builder.Default
    private Integer timeLimitMinutes = 30;

    @Column(nullable = false)
    private Integer orderIndex;

    @Column(nullable = false)
    @Builder.Default
    private String icon = "📋";
}
