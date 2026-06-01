package com.javaduolingo.controller;

import com.javaduolingo.model.LearningModule;
import com.javaduolingo.model.User;
import com.javaduolingo.service.DailyService;
import com.javaduolingo.service.LessonService;
import com.javaduolingo.service.MistakeService;
import com.javaduolingo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.*;

@Controller
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final LessonService lessonService;
    private final DailyService dailyService;
    private final MistakeService mistakeService;

    @GetMapping("/profile")
    public String profile(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = userService.getByUsername(userDetails.getUsername());

        List<Map<String, String>> allAchievements = List.of(
            // XP milestones
            Map.of("key","XP_100",      "title","Primeiros Passos",    "desc","Ganhe 100 XP",           "icon","🌱"),
            Map.of("key","XP_500",      "title","Em Evolução",          "desc","Ganhe 500 XP",           "icon","🌿"),
            Map.of("key","XP_1000",     "title","Desenvolvedor",        "desc","Ganhe 1.000 XP",         "icon","💻"),
            Map.of("key","XP_5000",     "title","Java Sênior",          "desc","Ganhe 5.000 XP",         "icon","🏆"),
            Map.of("key","XP_10000",    "title","Java Master",          "desc","Ganhe 10.000 XP",        "icon","🥇"),
            // Streak
            Map.of("key","STREAK_3",    "title","Iniciando Ritmo",      "desc","3 dias seguidos",        "icon","🔥"),
            Map.of("key","STREAK_7",    "title","Semana Perfeita",      "desc","7 dias seguidos",        "icon","⚡"),
            Map.of("key","STREAK_30",   "title","Mês de Dedicação",     "desc","30 dias seguidos",       "icon","💪"),
            Map.of("key","STREAK_60",   "title","Dois Meses!",          "desc","60 dias seguidos",       "icon","🚀"),
            Map.of("key","STREAK_100",  "title","Cem Dias de Java",     "desc","100 dias seguidos",      "icon","👑"),
            // Lições
            Map.of("key","LESSON_1",    "title","Primeira Lição",       "desc","Complete 1 lição",       "icon","📚"),
            Map.of("key","LESSON_5",    "title","Estudante Dedicado",   "desc","Complete 5 lições",      "icon","📖"),
            Map.of("key","LESSON_10",   "title","Meio Caminho",         "desc","Complete 10 lições",     "icon","🎯"),
            Map.of("key","LESSON_20",   "title","Quase Lá!",            "desc","Complete 20 lições",     "icon","🌟"),
            Map.of("key","LESSON_30",   "title","Curso Completo!",      "desc","Complete todas as 30 lições","icon","🎓"),
            // Perfeição
            Map.of("key","PERFECT_1",   "title","Sem Erros!",           "desc","Complete 1 lição perfeita",  "icon","✨"),
            Map.of("key","PERFECT_5",   "title","Perfeccionista",       "desc","5 lições sem erros",     "icon","💎"),
            Map.of("key","PERFECT_10",  "title","Elite Java",           "desc","10 lições sem erros",    "icon","🌈"),
            // Meta semanal
            Map.of("key","WEEKLY_GOAL", "title","Meta da Semana",       "desc","Alcance sua meta semanal de XP","icon","📅"),
            // Exercícios
            Map.of("key","EX_50",       "title","Praticante",           "desc","50 exercícios corretos", "icon","✅"),
            Map.of("key","EX_200",      "title","Executor",             "desc","200 exercícios corretos","icon","🎖️"),
            Map.of("key","EX_500",      "title","Veterano do Código",   "desc","500 exercícios corretos","icon","🏅")
        );

        List<LearningModule> modules = lessonService.getAllModules();
        Set<Long> completedIds = lessonService.getCompletedLessonIds(user.getId());
        List<String> moduleLabels = new ArrayList<>();
        List<Integer> modulePcts = new ArrayList<>();
        for (LearningModule m : modules) {
            moduleLabels.add(m.getTitle());
            int total = m.getLessons().size();
            long done = m.getLessons().stream().filter(l -> completedIds.contains(l.getId())).count();
            modulePcts.add(total > 0 ? (int)(done * 100 / total) : 0);
        }

        int accuracy = user.getTotalExercisesAttempted() > 0
                ? (user.getTotalExercisesCorrect() * 100 / user.getTotalExercisesAttempted())
                : 0;

        int weeklyPct = user.getWeeklyGoalXp() > 0
                ? Math.min(100, user.getWeeklyXp() * 100 / user.getWeeklyGoalXp())
                : 0;

        model.addAttribute("user", user);
        model.addAttribute("allAchievements", allAchievements);
        model.addAttribute("xpToNextLevel", 100 - (user.getXp() % 100));
        model.addAttribute("levelProgress", user.getXp() % 100);
        model.addAttribute("moduleLabels", moduleLabels);
        model.addAttribute("modulePcts", modulePcts);
        model.addAttribute("totalDailiesCorrect", dailyService.getTotalCorrect(user.getId()));
        model.addAttribute("accuracy", accuracy);
        model.addAttribute("weeklyPct", weeklyPct);
        model.addAttribute("mistakeCount", mistakeService.getMistakeCount(user.getId()));
        model.addAttribute("completedLessons", completedIds.size());
        model.addAttribute("totalLessons", modules.stream().mapToInt(m -> m.getLessons().size()).sum());
        return "profile";
    }

    @GetMapping("/leaderboard")
    public String leaderboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        User user = userService.getByUsername(userDetails.getUsername());
        List<User> top10 = userService.getLeaderboard();
        model.addAttribute("user", user);
        model.addAttribute("topUsers", top10);
        return "leaderboard";
    }
}
