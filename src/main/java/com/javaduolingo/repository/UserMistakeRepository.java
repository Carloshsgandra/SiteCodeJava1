package com.javaduolingo.repository;

import com.javaduolingo.model.UserMistake;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserMistakeRepository extends JpaRepository<UserMistake, Long> {

    List<UserMistake> findByUserIdOrderByMistakeCountDescLastMistakeAtDesc(Long userId);

    Optional<UserMistake> findByUserIdAndExerciseId(Long userId, Long exerciseId);

    int countByUserId(Long userId);

    @Query("SELECT SUM(m.mistakeCount) FROM UserMistake m WHERE m.user.id = :userId")
    Long sumMistakeCountByUserId(Long userId);

    void deleteByUserIdAndExerciseId(Long userId, Long exerciseId);
}
