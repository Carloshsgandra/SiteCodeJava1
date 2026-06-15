package com.javaduolingo.repository;

import com.javaduolingo.model.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findAllByOrderByOrderIndexAsc();
    List<InterviewQuestion> findByCategoryOrderByOrderIndexAsc(String category);
    List<InterviewQuestion> findByDifficultyOrderByOrderIndexAsc(String difficulty);
    List<String> findDistinctCategoryBy();
}
