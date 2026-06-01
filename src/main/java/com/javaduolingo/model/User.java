package com.javaduolingo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    @Builder.Default
    private int xp = 0;

    @Column(nullable = false)
    @Builder.Default
    private int streakDays = 0;

    @Column
    private LocalDate lastActivityDate;

    @Column(nullable = false)
    @Builder.Default
    private int hearts = 5;

    @Column(nullable = false)
    @Builder.Default
    private String role = "ROLE_USER";

    @Column(nullable = false)
    @Builder.Default
    private String avatarColor = "#58CC02";

    @Version
    private Long version;

    @Column(columnDefinition = "integer default 0")
    @Builder.Default
    private int weeklyXp = 0;

    @Column(columnDefinition = "integer default 200")
    @Builder.Default
    private int weeklyGoalXp = 200;

    @Column
    private LocalDate weekStartDate;

    @Column(columnDefinition = "integer default 0")
    @Builder.Default
    private int totalLessonsCompleted = 0;

    @Column(columnDefinition = "integer default 0")
    @Builder.Default
    private int totalPerfectLessons = 0;

    @Column(columnDefinition = "integer default 0")
    @Builder.Default
    private int totalExercisesAttempted = 0;

    @Column(columnDefinition = "integer default 0")
    @Builder.Default
    private int totalExercisesCorrect = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_achievements", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "achievement_key")
    @Builder.Default
    private Set<String> achievements = new HashSet<>();

    public void addXp(int amount) {
        this.xp += amount;
    }

    public boolean deductHeart() {
        if (this.hearts > 0) {
            this.hearts--;
            return true;
        }
        return false;
    }

    public void restoreHearts() {
        this.hearts = 5;
    }

    public int getLevel() {
        return (xp / 100) + 1;
    }
}
