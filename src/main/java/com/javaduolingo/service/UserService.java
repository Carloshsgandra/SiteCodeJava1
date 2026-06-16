package com.javaduolingo.service;

import com.javaduolingo.model.User;
import com.javaduolingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User register(String username, String email, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        String[] colors = {"#58CC02", "#FF4B4B", "#1CB0F6", "#FF9600", "#CE82FF"};
        String color = colors[(int)(Math.random() * colors.length)];

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .avatarColor(color)
                .build();
        return userRepository.save(user);
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    /**
     * Atualiza a sequência diária do usuário. Idempotente — chamadas múltiplas no mesmo dia
     * não alteram nada. Restaura corações e reseta XP semanal ao início de cada novo dia.
     * Seguro para chamar de qualquer controller (lição, desafio, dashboard).
     */
    @Transactional
    public void updateStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDate last = user.getLastActivityDate();

        // Já processado hoje — não faz nada (evita stale-version em chamadas duplas)
        if (last != null && last.equals(today)) {
            return;
        }

        if (last == null) {
            user.setStreakDays(1);
        } else if (last.equals(today.minusDays(1))) {
            user.setStreakDays(user.getStreakDays() + 1);
        } else {
            // Um ou mais dias pulados — zera sequência
            user.setStreakDays(1);
        }

        user.setLastActivityDate(today);
        user.setHearts(5); // restaura corações ao início de cada novo dia
        resetWeeklyXpIfNeeded(user, today);
        checkAchievements(user);   // dispara conquistas de streak
        userRepository.save(user);
    }

    private void resetWeeklyXpIfNeeded(User user, LocalDate today) {
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        if (user.getWeekStartDate() == null || user.getWeekStartDate().isBefore(weekStart)) {
            user.setWeeklyXp(0);
            user.setWeekStartDate(weekStart);
        }
    }

    @Transactional
    public void addXp(User user, int amount) {
        user.addXp(amount);
        resetWeeklyXpIfNeeded(user, LocalDate.now());
        user.setWeeklyXp(user.getWeeklyXp() + amount);
        checkAchievements(user);
        userRepository.save(user);
    }

    @Transactional
    public boolean deductHeart(User user) {
        boolean deducted = user.deductHeart();
        userRepository.save(user);
        return deducted;
    }

    @Transactional
    public void restoreHearts(User user) {
        user.restoreHearts();
        userRepository.save(user);
    }

    @Transactional
    public void recordLessonComplete(User user, boolean perfect) {
        user.setTotalLessonsCompleted(user.getTotalLessonsCompleted() + 1);
        if (perfect) user.setTotalPerfectLessons(user.getTotalPerfectLessons() + 1);
        checkAchievements(user);
        userRepository.save(user);
    }

    @Transactional
    public void recordExerciseAttempt(User user, boolean correct) {
        user.setTotalExercisesAttempted(user.getTotalExercisesAttempted() + 1);
        if (correct) user.setTotalExercisesCorrect(user.getTotalExercisesCorrect() + 1);
        userRepository.save(user);
    }

    public List<User> getLeaderboard() {
        return userRepository.findTop10ByOrderByXpDesc();
    }

    private void checkAchievements(User user) {
        // XP milestones
        addIfAbsent(user, "XP_100",    user.getXp() >= 100);
        addIfAbsent(user, "XP_500",    user.getXp() >= 500);
        addIfAbsent(user, "XP_1000",   user.getXp() >= 1000);
        addIfAbsent(user, "XP_5000",   user.getXp() >= 5000);
        addIfAbsent(user, "XP_10000",  user.getXp() >= 10000);

        // Streak milestones
        addIfAbsent(user, "STREAK_3",  user.getStreakDays() >= 3);
        addIfAbsent(user, "STREAK_7",  user.getStreakDays() >= 7);
        addIfAbsent(user, "STREAK_30", user.getStreakDays() >= 30);
        addIfAbsent(user, "STREAK_60", user.getStreakDays() >= 60);
        addIfAbsent(user, "STREAK_100",user.getStreakDays() >= 100);

        // Lesson milestones
        addIfAbsent(user, "LESSON_1",  user.getTotalLessonsCompleted() >= 1);
        addIfAbsent(user, "LESSON_5",  user.getTotalLessonsCompleted() >= 5);
        addIfAbsent(user, "LESSON_10", user.getTotalLessonsCompleted() >= 10);
        addIfAbsent(user, "LESSON_20", user.getTotalLessonsCompleted() >= 20);
        addIfAbsent(user, "LESSON_30", user.getTotalLessonsCompleted() >= 30);

        // Perfeição
        addIfAbsent(user, "PERFECT_1",  user.getTotalPerfectLessons() >= 1);
        addIfAbsent(user, "PERFECT_5",  user.getTotalPerfectLessons() >= 5);
        addIfAbsent(user, "PERFECT_10", user.getTotalPerfectLessons() >= 10);

        // Meta semanal
        addIfAbsent(user, "WEEKLY_GOAL", user.getWeeklyXp() >= user.getWeeklyGoalXp());

        // Exercícios resolvidos
        addIfAbsent(user, "EX_50",  user.getTotalExercisesCorrect() >= 50);
        addIfAbsent(user, "EX_200", user.getTotalExercisesCorrect() >= 200);
        addIfAbsent(user, "EX_500", user.getTotalExercisesCorrect() >= 500);
    }

    private void addIfAbsent(User user, String key, boolean condition) {
        if (condition && !user.getAchievements().contains(key)) {
            user.getAchievements().add(key);
        }
    }
}
