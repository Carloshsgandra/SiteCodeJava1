package com.javaduolingo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "flashcard_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "exercise_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "exercise_id", nullable = false)
    private Long exerciseId;

    // SM-2 algorithm fields
    @Column(name = "ease_factor")
    @Builder.Default
    private double easeFactor = 2.5;

    @Column(name = "interval_days")
    @Builder.Default
    private int intervalDays = 1;

    @Column(name = "repetitions")
    @Builder.Default
    private int repetitions = 0;

    @Column(name = "next_review_date")
    @Builder.Default
    private LocalDate nextReviewDate = LocalDate.now();

    @Column(name = "total_reviews")
    @Builder.Default
    private int totalReviews = 0;

    @Column(name = "correct_reviews")
    @Builder.Default
    private int correctReviews = 0;
}
