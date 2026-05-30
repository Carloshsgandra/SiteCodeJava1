package com.javaduolingo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_daily_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDailyAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "challenge_date", nullable = false)
    private LocalDate challengeDate;

    @Column(name = "exercise_id", nullable = false)
    private Long exerciseId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean correct = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
