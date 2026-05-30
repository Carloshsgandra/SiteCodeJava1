package com.javaduolingo.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaduolingo.model.Exam;
import com.javaduolingo.model.ExamAttempt;
import com.javaduolingo.model.ExamQuestion;
import com.javaduolingo.model.User;
import com.javaduolingo.repository.ExamAttemptRepository;
import com.javaduolingo.repository.UserRepository;
import com.javaduolingo.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.*;

@Controller
@RequestMapping("/exam")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;
    private final UserRepository userRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/{id}")
    public String examInfo(@PathVariable Long id, Model model, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        Exam exam = examService.getExam(id);
        int questionCount = examService.getQuestions(id).size();
        ExamAttempt bestAttempt = examService.getBestAttempt(user.getId(), id).orElse(null);
        List<ExamAttempt> history = examService.getHistory(user.getId(), id);

        model.addAttribute("user", user);
        model.addAttribute("exam", exam);
        model.addAttribute("questionCount", questionCount);
        model.addAttribute("bestAttempt", bestAttempt);
        model.addAttribute("history", history);
        return "exam-info";
    }

    @GetMapping("/{id}/take")
    public String takeExam(@PathVariable Long id, Model model, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        Exam exam = examService.getExam(id);
        List<ExamQuestion> questions = examService.getQuestions(id);

        Map<Long, List<String>> optionsMap = new LinkedHashMap<>();
        for (ExamQuestion q : questions) {
            optionsMap.put(q.getId(), examService.parseOptions(q));
        }

        model.addAttribute("user", user);
        model.addAttribute("exam", exam);
        model.addAttribute("questions", questions);
        model.addAttribute("optionsMap", optionsMap);
        return "exam-take";
    }

    @PostMapping("/{id}/submit")
    public String submitExam(@PathVariable Long id,
                             @RequestParam Map<String, String> params,
                             Authentication auth,
                             RedirectAttributes ra) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();

        Map<String, String> answers = new HashMap<>();
        params.forEach((key, value) -> {
            if (key.startsWith("q_")) {
                answers.put(key.substring(2), value);
            }
        });

        ExamAttempt attempt = examService.submit(user, id, answers);
        return "redirect:/exam/result/" + attempt.getId();
    }

    @GetMapping("/result/{attemptId}")
    public String examResult(@PathVariable Long attemptId, Model model, Authentication auth) {
        ExamAttempt attempt = examAttemptRepository.findById(attemptId).orElseThrow();
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();

        if (!attempt.getUser().getId().equals(user.getId())) {
            return "redirect:/dashboard";
        }

        List<ExamQuestion> questions = examService.getQuestions(attempt.getExam().getId());

        Map<String, String> submittedAnswers = new HashMap<>();
        try {
            if (attempt.getAnswersJson() != null) {
                submittedAnswers = objectMapper.readValue(
                        attempt.getAnswersJson(), new TypeReference<>() {});
            }
        } catch (Exception ignored) {}

        Map<Long, List<String>> optionsMap = new LinkedHashMap<>();
        for (ExamQuestion q : questions) {
            optionsMap.put(q.getId(), examService.parseOptions(q));
        }

        model.addAttribute("user", user);
        model.addAttribute("attempt", attempt);
        model.addAttribute("exam", attempt.getExam());
        model.addAttribute("questions", questions);
        model.addAttribute("submittedAnswers", submittedAnswers);
        model.addAttribute("optionsMap", optionsMap);
        return "exam-result";
    }
}
