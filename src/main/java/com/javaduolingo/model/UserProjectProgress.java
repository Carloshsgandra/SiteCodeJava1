package com.javaduolingo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_project_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "project_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProjectProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private GuidedProject project;

    @Column(nullable = false)
    @Builder.Default
    private int currentStep = 1;

    @Column(nullable = false)
    @Builder.Default
    private boolean completed = false;

    @Column
    private LocalDateTime startedAt;

    @Column
    private LocalDateTime completedAt;
}
