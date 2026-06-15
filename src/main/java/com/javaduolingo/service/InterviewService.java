package com.javaduolingo.service;

import com.javaduolingo.model.InterviewQuestion;
import com.javaduolingo.repository.InterviewQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewQuestionRepository questionRepository;

    public List<InterviewQuestion> getAll() {
        return questionRepository.findAllByOrderByOrderIndexAsc();
    }

    public List<InterviewQuestion> getByCategory(String category) {
        return questionRepository.findByCategoryOrderByOrderIndexAsc(category);
    }

    public List<InterviewQuestion> getByDifficulty(String difficulty) {
        return questionRepository.findByDifficultyOrderByOrderIndexAsc(difficulty);
    }

    public List<String> getCategories() {
        return questionRepository.findAllByOrderByOrderIndexAsc().stream()
                .map(InterviewQuestion::getCategory)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public Map<String, List<InterviewQuestion>> groupedByCategory() {
        List<InterviewQuestion> all = questionRepository.findAllByOrderByOrderIndexAsc();
        Map<String, List<InterviewQuestion>> grouped = new LinkedHashMap<>();
        for (InterviewQuestion q : all) {
            grouped.computeIfAbsent(q.getCategory(), k -> new ArrayList<>()).add(q);
        }
        return grouped;
    }

    public Optional<InterviewQuestion> findById(Long id) {
        return questionRepository.findById(id);
    }

    public long countTotal() {
        return questionRepository.count();
    }
}
