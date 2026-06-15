package com.javaduolingo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_steps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private GuidedProject project;

    @Column(nullable = false)
    private int stepNumber;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String codeTemplate;

    @Column(columnDefinition = "TEXT")
    private String hint;

    @Column(columnDefinition = "TEXT")
    private String expectedOutput;
}
