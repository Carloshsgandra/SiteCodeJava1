package com.javaduolingo.service;

import com.javaduolingo.model.User;
import com.javaduolingo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public void updateStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDate last = user.getLastActivityDate();
        if (last == null) {
            user.setStreakDays(1);
        } else if (last.equals(today.minusDays(1))) {
            user.setStreakDays(user.getStreakDays() + 1);
        } else if (!last.equals(today)) {
            user.setStreakDays(1);
        }
        user.setLastActivityDate(today);
        userRepository.save(user);
    }

    @Transactional
    public void addXp(User user, int amount) {
        user.addXp(amount);
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

    public List<User> getLeaderboard() {
        return userRepository.findTop10ByOrderByXpDesc();
    }

    private void checkAchievements(User user) {
        if (user.getXp() >= 100 && !user.getAchievements().contains("XP_100")) {
            user.getAchievements().add("XP_100");
        }
        if (user.getXp() >= 500 && !user.getAchievements().contains("XP_500")) {
            user.getAchievements().add("XP_500");
        }
        if (user.getXp() >= 1000 && !user.getAchievements().contains("XP_1000")) {
            user.getAchievements().add("XP_1000");
        }
        if (user.getXp() >= 5000 && !user.getAchievements().contains("XP_5000")) {
            user.getAchievements().add("XP_5000");
        }
        if (user.getStreakDays() >= 7 && !user.getAchievements().contains("STREAK_7")) {
            user.getAchievements().add("STREAK_7");
        }
        if (user.getStreakDays() >= 30 && !user.getAchievements().contains("STREAK_30")) {
            user.getAchievements().add("STREAK_30");
        }
    }
}
