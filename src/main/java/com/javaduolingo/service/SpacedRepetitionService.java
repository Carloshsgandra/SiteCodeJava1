package com.javaduolingo.service;

import com.javaduolingo.model.FlashcardProgress;
import com.javaduolingo.model.User;
import com.javaduolingo.repository.FlashcardProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SpacedRepetitionService {

    private final FlashcardProgressRepository progressRepository;

    /**
     * SM-2 algorithm: quality 0-5
     *  5 = resposta perfeita sem hesitação
     *  4 = resposta correta com leve hesitação
     *  3 = resposta correta com dificuldade
     *  2 = resposta errada, mas lembrou ao ver
     *  1 = resposta errada, parecia fácil
     *  0 = bloqueio total
     */
    @Transactional
    public FlashcardProgress rate(User user, Long exerciseId, int quality) {
        Optional<FlashcardProgress> opt = progressRepository
                .findByUserIdAndExerciseId(user.getId(), exerciseId);

        FlashcardProgress fp = opt.orElseGet(() -> FlashcardProgress.builder()
                .user(user)
                .exerciseId(exerciseId)
                .build());

        fp.setTotalReviews(fp.getTotalReviews() + 1);
        if (quality >= 3) fp.setCorrectReviews(fp.getCorrectReviews() + 1);

        if (quality < 3) {
            fp.setRepetitions(0);
            fp.setIntervalDays(1);
        } else {
            int rep = fp.getRepetitions();
            if (rep == 0) {
                fp.setIntervalDays(1);
            } else if (rep == 1) {
                fp.setIntervalDays(6);
            } else {
                fp.setIntervalDays((int) Math.round(fp.getIntervalDays() * fp.getEaseFactor()));
            }
            fp.setRepetitions(rep + 1);

            double ef = fp.getEaseFactor() + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            fp.setEaseFactor(Math.max(1.3, ef));
        }

        fp.setNextReviewDate(LocalDate.now().plusDays(fp.getIntervalDays()));
        return progressRepository.save(fp);
    }

    public List<FlashcardProgress> getDueCards(Long userId) {
        return progressRepository
                .findByUserIdAndNextReviewDateLessThanEqualOrderByNextReviewDate(userId, LocalDate.now());
    }

    public int getDueCount(Long userId) {
        return getDueCards(userId).size();
    }

    public int getMasteredCount(Long userId) {
        return progressRepository.countByUserIdAndCorrectReviewsGreaterThan(userId, 2);
    }
}
