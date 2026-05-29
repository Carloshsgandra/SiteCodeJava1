package com.javaduolingo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lesson_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false)
    @Builder.Default
    private boolean completed = false;

    @Column
    private LocalDateTime completedAt;

    @Column
    @Builder.Default
    private int score = 0;

    @Column
    @Builder.Default
    private int heartsUsed = 0;

    @Column
    @Builder.Default
    private int currentExerciseIndex = 0;
}
