package com.javaduolingo.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "guided_projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuidedProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String difficulty; // INICIANTE, INTERMEDIARIO, AVANCADO

    @Column(nullable = false)
    private String icon;

    @Column(columnDefinition = "TEXT")
    private String techTopics; // comma-separated

    @Column(nullable = false)
    private int estimatedHours;

    @Column(nullable = false)
    private int xpReward;

    @Column(nullable = false)
    private int orderIndex;

    @Column(columnDefinition = "TEXT")
    private String learningGoals; // what you'll learn

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("stepNumber ASC")
    @Builder.Default
    private List<ProjectStep> steps = new ArrayList<>();
}
