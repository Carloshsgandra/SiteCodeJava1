package com.javaduolingo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_mistakes",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "exercise_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMistake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "exercise_id", nullable = false)
    private Long exerciseId;

    @Column(name = "question_text", columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "correct_answer", length = 500)
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "lesson_id")
    private Long lessonId;

    @Column(name = "lesson_title", length = 200)
    private String lessonTitle;

    @Column(name = "mistake_count")
    @Builder.Default
    private int mistakeCount = 1;

    @Column(name = "last_mistake_at")
    private LocalDateTime lastMistakeAt;
}
