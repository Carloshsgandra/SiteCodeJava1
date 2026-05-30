package com.javaduolingo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaduolingo.model.Exam;
import com.javaduolingo.model.ExamAttempt;
import com.javaduolingo.model.ExamQuestion;
import com.javaduolingo.model.User;
import com.javaduolingo.repository.ExamAttemptRepository;
import com.javaduolingo.repository.ExamQuestionRepository;
import com.javaduolingo.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final ObjectMapper objectMapper;

    public List<Exam> getAllExams() {
        return examRepository.findAllByOrderByOrderIndexAsc();
    }

    public Exam getExam(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prova não encontrada: " + id));
    }

    public List<ExamQuestion> getQuestions(Long examId) {
        return examQuestionRepository.findByExamIdOrderByOrderIndexAsc(examId);
    }

    public List<String> parseOptions(ExamQuestion question) {
        try {
            return objectMapper.readValue(question.getOptionsJson(), new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    public ExamAttempt submit(User user, Long examId, Map<String, String> answers) {
        Exam exam = getExam(examId);
        List<ExamQuestion> questions = getQuestions(examId);

        int correct = 0;
        for (ExamQuestion q : questions) {
            String submitted = answers.getOrDefault(String.valueOf(q.getId()), "").trim();
            if (submitted.equalsIgnoreCase(q.getCorrectAnswer().trim())) {
                correct++;
            }
        }

        int total = questions.size();
        int score = total > 0 ? (correct * 100 / total) : 0;

        String answersJson = "{}";
        try {
            answersJson = objectMapper.writeValueAsString(answers);
        } catch (Exception ignored) {}

        ExamAttempt attempt = ExamAttempt.builder()
                .user(user)
                .exam(exam)
                .score(score)
                .passed(score >= exam.getPassingScore())
                .correctAnswers(correct)
                .totalQuestions(total)
                .answersJson(answersJson)
                .completedAt(LocalDateTime.now())
                .build();

        return examAttemptRepository.save(attempt);
    }

    public Optional<ExamAttempt> getBestAttempt(Long userId, Long examId) {
        return examAttemptRepository.findTopByUserIdAndExamIdOrderByScoreDesc(userId, examId);
    }

    public List<ExamAttempt> getHistory(Long userId, Long examId) {
        return examAttemptRepository.findByUserIdAndExamIdOrderByCompletedAtDesc(userId, examId);
    }
}
