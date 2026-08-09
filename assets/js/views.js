import { curriculum } from './data.js';
import { store } from './store.js';
import { clamp, dayKey, daysAgo, escapeHtml, formatDate, formatNumber, percent, seededIndex, unique } from './utils.js';

const byId = (rows, id) => rows.find((item) => Number(item.id) === Number(id));
const exercisesForLesson = (lessonId) => curriculum.exercises.filter((item) => item.lesson_id === Number(lessonId)).sort((a, b) => a.order_index - b.order_index);
const stepsForProject = (projectId) => curriculum.projectSteps.filter((item) => item.project_id === Number(projectId)).sort((a, b) => a.step_number - b.step_number);
const questionsForExam = (examId) => curriculum.examQuestions.filter((item) => item.exam_id === Number(examId)).sort((a, b) => a.order_index - b.order_index);

export function stats() {
  const state = store.state;
  const activeMistakes = state.mistakes.filter((item) => !item.mastered);
  const dueCards = curriculum.exercises.filter((exercise) => {
    const card = state.flashcards[exercise.id];
    return !card || !card.due || new Date(card.due) <= new Date();
  });
  const nextLesson = curriculum.lessons.find((lesson) => !state.completedLessons.includes(lesson.id)) ?? curriculum.lessons[0];
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => dayKey(daysAgo(index)));
  const weeklyXp = lastSevenDays.reduce((sum, day) => sum + (state.activity[day]?.xp ?? 0), 0);
  return {
    activeMistakes,
    dueCards,
    nextLesson,
    weeklyXp,
    accuracy: percent(state.user.totalCorrect, state.user.totalAttempted),
    courseProgress: percent(state.completedLessons.length, curriculum.lessons.length),
    level: Math.floor(state.user.xp / 100) + 1,
    levelProgress: state.user.xp % 100,
  };
}

function pageHead(eyebrow, title, description, action = '') {
  return `<header class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${action}</header>`;
}

function progressBar(value, className = '') {
  return `<div class="progress ${className}" aria-label="${value}%"><span style="--progress:${clamp(value, 0, 100)}%"></span></div>`;
}

function emptyState(icon, title, text, action = '') {
  return `<div class="card empty-state"><div class="empty-icon">${icon}</div><h2>${title}</h2><p>${text}</p>${action}</div>`;
}

function lessonUnlocked(lesson) {
  if (lesson.id === 1) return true;
  return store.state.completedLessons.includes(lesson.id - 1) || store.state.completedLessons.includes(lesson.id);
}

function dailyRecommendations() {
  const { activeMistakes, dueCards, nextLesson } = stats();
  return [
    { icon: '↻', label: 'Revisão ativa', value: `${Math.min(activeMistakes.length, 8)} erros`, route: 'review', ready: activeMistakes.length > 0 },
    { icon: '▤', label: 'Repetição espaçada', value: `${Math.min(dueCards.length, 12)} cards`, route: 'flashcards', ready: dueCards.length > 0 },
    { icon: '◫', label: 'Próxima lição', value: nextLesson.title, route: `lesson/${nextLesson.id}`, ready: true },
    { icon: '◷', label: 'Foco profundo', value: '25 minutos', route: 'focus', ready: true },
  ];
}

export function dashboardView() {
  const state = store.state;
  const computed = stats();
  const firstName = escapeHtml(state.user.name.split(' ')[0]);
  const recommendations = dailyRecommendations();
  const dailyDone = state.daily[dayKey()]?.completed;
  const goalPct = percent(computed.weeklyXp, state.user.weeklyGoal);

  return `<section class="page">
    <div class="hero">
      <div class="hero-content">
        <div class="eyebrow">Seu sistema de aprendizagem</div>
        <h1>Olá, ${firstName}.<br><em>Seu cérebro tem uma missão.</em></h1>
        <p>O plano de hoje combina recuperação ativa, repetição espaçada e prática deliberada para atacar exatamente os pontos que mais precisam de atenção.</p>
        <div class="hero-actions">
          <a class="button button-light" href="#/${computed.activeMistakes.length ? 'review' : `lesson/${computed.nextLesson.id}`}">${computed.activeMistakes.length ? '↻ Começar revisão' : '▶ Continuar trilha'}</a>
          <a class="button button-ghost" style="color:white;background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.15)" href="#/daily">✦ Missão diária</a>
        </div>
      </div>
      <div class="hero-panel">
        <div class="card-head"><div><h3>Plano de alta retenção</h3><p style="color:#9fa9bd">${dailyDone ? 'Missão concluída. Excelente trabalho.' : 'Uma sequência curta e intencional.'}</p></div><span class="badge badge-green">${dailyDone ? 'Concluído' : 'Hoje'}</span></div>
        ${recommendations.map((item) => `<a class="plan-line" href="#/${item.route}" style="text-decoration:none"><span>${item.icon} ${item.label}</span><strong>${escapeHtml(item.value)}</strong></a>`).join('')}
      </div>
    </div>

    <div class="grid grid-4 metrics-mobile" style="margin-top:18px">
      <div class="card metric"><div class="metric-top"><span>Domínio do curso</span><span class="metric-icon">◫</span></div><div class="metric-value">${computed.courseProgress}%</div>${progressBar(computed.courseProgress)}<div class="metric-detail">${state.completedLessons.length} de ${curriculum.lessons.length} lições dominadas</div></div>
      <div class="card metric"><div class="metric-top"><span>Precisão</span><span class="metric-icon" style="background:var(--green-soft);color:var(--green)">◎</span></div><div class="metric-value">${computed.accuracy}%</div>${progressBar(computed.accuracy, 'green')}<div class="metric-detail">${state.user.totalCorrect} respostas corretas</div></div>
      <div class="card metric"><div class="metric-top"><span>Meta semanal</span><span class="metric-icon" style="background:var(--orange-soft);color:var(--orange)">⚡</span></div><div class="metric-value">${formatNumber(computed.weeklyXp)}</div>${progressBar(goalPct)}<div class="metric-detail">de ${formatNumber(state.user.weeklyGoal)} XP planejados</div></div>
      <div class="card metric"><div class="metric-top"><span>Sequência</span><span class="metric-icon" style="background:var(--red-soft);color:var(--red)">🔥</span></div><div class="metric-value">${state.user.streak} dias</div><div class="metric-detail"><span class="trend-up">Consistência vence intensidade.</span></div></div>
    </div>

    <div class="layout-main" style="margin-top:18px">
      <div class="stack">
        <div class="card card-pad">
          <div class="card-head"><div><h2>Próximas ações</h2><p>Ordenadas pelo impacto provável na retenção.</p></div><a class="button button-ghost button-sm" href="#/learn">Ver trilha</a></div>
          <div class="grid grid-2">
            ${recommendations.map((item, index) => `<a class="card quick-card" href="#/${item.route}"><span class="quick-icon">${item.icon}</span><span><strong>${item.label}</strong><small>${escapeHtml(item.value)} · ${index === 0 ? 'prioridade alta' : 'recomendado'}</small></span><span>›</span></a>`).join('')}
          </div>
        </div>
        ${knowledgeCard()}
      </div>
      <aside class="stack">
        <div class="card card-pad">
          <div class="card-head"><div><h3>Próximo marco</h3><p>Nível ${computed.level + 1}</p></div><span class="badge badge-purple">${computed.levelProgress}/100 XP</span></div>
          ${progressBar(computed.levelProgress)}
          <p class="muted small" style="margin:13px 0 0">Complete “${escapeHtml(computed.nextLesson.title)}” para avançar na trilha.</p>
        </div>
        <div class="card card-pad">
          <div class="card-head"><div><h3>Atalhos de prática</h3><p>Ferramentas para sair da leitura passiva.</p></div></div>
          <div class="stack" style="gap:8px">
            <a class="quick-card card" href="#/playground"><span class="quick-icon">&lt;/&gt;</span><span><strong>Testar código</strong><small>Playground Java</small></span><span>›</span></a>
            <a class="quick-card card" href="#/coach"><span class="quick-icon">✦</span><span><strong>Pedir uma pista</strong><small>Coach contextual</small></span><span>›</span></a>
            <a class="quick-card card" href="#/projects"><span class="quick-icon">⌘</span><span><strong>Construir projeto</strong><small>Aprender fazendo</small></span><span>›</span></a>
          </div>
        </div>
      </aside>
    </div>
  </section>`;
}

function moduleMastery(module) {
  const lessons = curriculum.lessons.filter((lesson) => lesson.module_id === module.id);
  const scores = lessons.map((lesson) => store.state.lessonScores[lesson.id] ?? 0);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / Math.max(1, lessons.length));
}

function knowledgeCard() {
  const modules = curriculum.modules.map((module) => ({ ...module, mastery: moduleMastery(module) })).sort((a, b) => a.mastery - b.mastery);
  return `<div class="card card-pad"><div class="card-head"><div><h2>Mapa de domínio</h2><p>Domínio real por tópico, não apenas XP acumulado.</p></div><span class="badge badge-purple">Adaptativo</span></div><div class="knowledge-list">${modules.map((module) => `<div class="knowledge-row"><strong>${module.icon} ${escapeHtml(module.title)}</strong>${progressBar(module.mastery, module.mastery >= 70 ? 'green' : '')}<span>${module.mastery}%</span></div>`).join('')}</div></div>`;
}

export function learnView() {
  const computed = stats();
  return `<section class="page">${pageHead('Trilha Java', 'Aprenda em camadas', `São ${curriculum.lessons.length} lições, ${curriculum.exercises.length} exercícios e um mapa de domínio que reage ao seu desempenho.`, `<a class="button button-primary" href="#/lesson/${computed.nextLesson.id}">▶ Continuar</a>`)}
    <div class="module-list">${curriculum.modules.map((module) => {
      const lessons = curriculum.lessons.filter((lesson) => lesson.module_id === module.id);
      const completed = lessons.filter((lesson) => store.state.completedLessons.includes(lesson.id)).length;
      return `<article class="card module-card"><header class="module-head" style="--module-color:${module.color}"><span class="module-icon">${module.icon}</span><div><h2>Módulo ${module.order_index}: ${escapeHtml(module.title)}</h2><p>${escapeHtml(module.description)}</p></div><div class="module-progress"><strong>${completed}/${lessons.length}</strong>lições</div></header><div class="lesson-list">${lessons.map((lesson) => {
        const done = store.state.completedLessons.includes(lesson.id);
        const unlocked = lessonUnlocked(lesson);
        const score = store.state.lessonScores[lesson.id];
        return `<a class="lesson-row ${done ? 'completed' : ''} ${!unlocked ? 'locked' : ''}" href="${unlocked ? `#/lesson/${lesson.id}` : '#/learn'}" ${!unlocked ? 'data-locked="true"' : ''}><span class="lesson-node">${done ? '✓' : unlocked ? lesson.order_index : '⌁'}</span><span><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.description)}</p></span><span class="lesson-meta"><strong>+${lesson.xp_reward} XP</strong><small>${score != null ? `${score}% domínio` : `${exercisesForLesson(lesson.id).length} exercícios`}</small></span></a>`;
      }).join('')}</div></article>`;
    }).join('')}</div>
  </section>`;
}

function answerArea(exercise, selectedAnswer = '') {
  if (['MULTIPLE_CHOICE', 'TRUE_FALSE', 'CODE_CHALLENGE'].includes(exercise.type)) {
    return `<div class="answers">${exercise.options.map((option, index) => `<button class="answer-option ${String(selectedAnswer) === String(option) ? 'selected' : ''}" type="button" data-answer="${escapeHtml(option)}"><span class="answer-key">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(option)}</span></button>`).join('')}</div>`;
  }
  if (exercise.type === 'CODE_ORDER') {
    return `<div class="answers">${exercise.options.map((option, index) => `<button class="answer-option" type="button" data-order-token="${escapeHtml(option)}"><span class="answer-key">${index + 1}</span><code>${escapeHtml(option)}</code></button>`).join('')}</div><input class="text-answer" id="exercise-answer" value="${escapeHtml(selectedAnswer)}" placeholder="A ordem escolhida aparecerá aqui" readonly>`;
  }
  return `<input class="text-answer" id="exercise-answer" value="${escapeHtml(selectedAnswer)}" placeholder="Digite sua resposta" autocomplete="off">`;
}

export function exerciseView(session) {
  const exercise = session.exercises[session.index];
  const progress = percent(session.index, session.exercises.length);
  const lesson = session.lessonId ? byId(curriculum.lessons, session.lessonId) : null;
  return `<section class="page lesson-shell">
    <div class="lesson-top"><a class="button button-ghost button-sm" href="#/${session.exitRoute || 'learn'}">× Sair</a>${progressBar(progress)}<span class="badge ${session.mode === 'review' ? 'badge-red' : 'badge-purple'}">${session.index + 1}/${session.exercises.length}</span></div>
    <article class="card question-card">
      <div class="card-head"><div><span class="badge badge-purple">${typeLabel(exercise.type)}</span>${lesson ? `<span class="badge" style="margin-left:6px">${escapeHtml(lesson.title)}</span>` : ''}</div><span class="badge badge-green">+${exercise.xp_reward ?? 10} XP</span></div>
      <h2>${escapeHtml(exercise.question_text)}</h2>
      ${exercise.code_snippet ? `<pre class="code-block"><code>${escapeHtml(exercise.code_snippet)}</code></pre>` : ''}
      ${answerArea(exercise, session.answer)}
      ${session.hint ? `<div class="feedback"><strong>💡 Pista ${session.hintLevel}</strong><p>${escapeHtml(session.hint)}</p></div>` : ''}
      ${session.checked ? `<div class="feedback ${session.correct ? 'correct' : 'wrong'}"><strong>${session.correct ? '✓ Resposta correta' : `Resposta correta: ${escapeHtml(exercise.correct_answer)}`}</strong><p>${escapeHtml(exercise.explanation)}</p></div>` : ''}
      <div class="lesson-actions"><button class="button button-ghost" type="button" data-action="exercise-hint" ${session.checked ? 'disabled' : ''}>💡 Pedir pista</button>${session.checked ? `<button class="button button-primary" type="button" data-action="exercise-next">${session.index + 1 === session.exercises.length ? 'Ver resultado' : 'Próxima questão →'}</button>` : `<button class="button button-primary" type="button" data-action="exercise-check">Verificar resposta</button>`}</div>
    </article>
  </section>`;
}

function typeLabel(type) {
  return ({ MULTIPLE_CHOICE: 'Múltipla escolha', TRUE_FALSE: 'Verdadeiro ou falso', FILL_BLANK: 'Complete o código', CODE_CHALLENGE: 'Leia e preveja', CODE_ORDER: 'Ordene o código' })[type] ?? 'Resposta livre';
}

export function sessionResultView(session) {
  const score = percent(session.correctCount, session.exercises.length);
  const lesson = session.lessonId ? byId(curriculum.lessons, session.lessonId) : null;
  return `<section class="page lesson-shell">${emptyState(score >= 80 ? '🏆' : score >= 60 ? '✓' : '↻', session.mode === 'review' ? 'Sessão de revisão concluída' : session.mode === 'daily' ? 'Missão diária concluída' : 'Lição concluída', `Você acertou ${session.correctCount} de ${session.exercises.length} questões (${score}%). ${score < 80 ? 'Revise as explicações e tente novamente em breve.' : 'Ótimo nível de recuperação ativa.'}`, `<div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap"><a class="button button-ghost" href="#/${session.exitRoute || 'learn'}">Voltar</a>${lesson ? `<a class="button button-primary" href="#/lesson/${lesson.id}">Praticar novamente</a>` : `<a class="button button-primary" href="#/dashboard">Ir ao painel</a>`}</div>`)}</section>`;
}

export function dailyView() {
  const today = dayKey();
  const completed = store.state.daily[today]?.completed;
  const index = seededIndex(today, curriculum.exercises.length - 5);
  const set = curriculum.exercises.slice(index, index + 5);
  return `<section class="page">${pageHead('Missão diária', 'Cinco minutos que movem a curva', 'Uma dose intercalada de questões para manter conceitos antigos acessíveis e detectar esquecimentos cedo.')}
    <div class="layout-main"><div class="card card-pad"><div class="eyebrow">Missão de ${formatDate(new Date(), { weekday: 'long', day: '2-digit', month: 'long' })}</div><h2 style="font-size:27px;margin:5px 0">${completed ? 'Missão concluída ✓' : 'Recupere antes de reler'}</h2><p class="muted">As perguntas misturam assuntos diferentes. Essa dificuldade desejável melhora a retenção e aproxima a prática das situações reais.</p><div class="grid grid-3" style="margin:22px 0"><div class="card metric"><div class="metric-top">Questões</div><div class="metric-value">${set.length}</div></div><div class="card metric"><div class="metric-top">Recompensa</div><div class="metric-value">50 XP</div></div><div class="card metric"><div class="metric-top">Sequência</div><div class="metric-value">${store.state.user.streak} 🔥</div></div></div><button class="button button-primary" data-action="start-daily" type="button">${completed ? 'Praticar novamente' : 'Começar missão'}</button></div>${knowledgeCard()}</div>
  </section>`;
}

export function reviewView() {
  const mistakes = stats().activeMistakes;
  if (!mistakes.length) return `<section class="page">${pageHead('Revisão inteligente', 'Caderno de erros', 'Cada erro vira uma oportunidade programada de recuperação.')}${emptyState('✓', 'Seu caderno está limpo', 'Novos erros aparecerão aqui automaticamente. Enquanto isso, use os flashcards para fortalecer a memória.', '<a class="button button-primary" href="#/flashcards">Revisar flashcards</a>')}</section>`;
  return `<section class="page">${pageHead('Revisão inteligente', 'Transforme erros em domínio', `${mistakes.length} exercícios pedem uma nova tentativa. Um item sai da fila após duas recuperações corretas.`, '<button class="button button-primary" data-action="start-review" type="button">↻ Revisar agora</button>')}
    <div class="grid grid-2">${mistakes.map((mistake) => {
      const exercise = byId(curriculum.exercises, mistake.exerciseId);
      const lesson = byId(curriculum.lessons, mistake.lessonId);
      if (!exercise) return '';
      return `<article class="card card-pad"><div class="card-head"><div><span class="badge badge-red">${mistake.attempts} erro${mistake.attempts > 1 ? 's' : ''}</span><span class="badge" style="margin-left:5px">${escapeHtml(lesson?.title ?? 'Revisão')}</span></div><span class="small muted">${mistake.correctReviews ?? 0}/2 acertos</span></div><h3 style="font-size:14px">${escapeHtml(exercise.question_text)}</h3><p class="muted small">Sua última resposta: ${escapeHtml(mistake.answer || '—')}</p><button class="button button-ghost button-sm" data-action="review-one" data-id="${exercise.id}" type="button">Tentar novamente</button></article>`;
    }).join('')}</div>
  </section>`;
}

export function flashcardsView() {
  const due = stats().dueCards;
  const mastered = Object.values(store.state.flashcards).filter((card) => card.repetitions >= 3).length;
  return `<section class="page">${pageHead('Repetição espaçada', 'Flashcards que sabem quando voltar', 'Avalie a dificuldade honestamente. O intervalo de cada cartão se ajusta à força da sua memória.', '<button class="button button-primary" data-action="start-flashcards" type="button">▤ Iniciar revisão</button>')}
    <div class="grid grid-3"><div class="card metric"><div class="metric-top">Para revisar agora</div><div class="metric-value">${due.length}</div><div class="metric-detail">Prioridade da sessão</div></div><div class="card metric"><div class="metric-top">Em aprendizagem</div><div class="metric-value">${Object.keys(store.state.flashcards).length - mastered}</div><div class="metric-detail">Intervalos ainda curtos</div></div><div class="card metric"><div class="metric-top">Maduros</div><div class="metric-value">${mastered}</div><div class="metric-detail">Três ou mais recuperações</div></div></div>
    <div class="card card-pad" style="margin-top:16px"><div class="card-head"><div><h2>Como usar</h2><p>Vire o cartão apenas depois de tentar recuperar a resposta.</p></div></div><div class="grid grid-4"><div class="quick-card card"><span class="quick-icon">↻</span><span><strong>Errei</strong><small>Volta hoje</small></span></div><div class="quick-card card"><span class="quick-icon">◷</span><span><strong>Difícil</strong><small>Intervalo curto</small></span></div><div class="quick-card card"><span class="quick-icon">✓</span><span><strong>Bom</strong><small>Intervalo normal</small></span></div><div class="quick-card card"><span class="quick-icon">⚡</span><span><strong>Fácil</strong><small>Intervalo maior</small></span></div></div></div>
  </section>`;
}

export function flashcardSessionView(session) {
  const exercise = session.cards[session.index];
  if (!exercise) return `<section class="page flashcard-stage">${emptyState('✓', 'Revisão concluída', `Você revisou ${session.index} cartões. Os próximos retornos já foram programados.`, '<a class="button button-primary" href="#/dashboard">Voltar ao painel</a>')}</section>`;
  return `<section class="page flashcard-stage"><div class="lesson-top"><a class="button button-ghost button-sm" href="#/flashcards">× Sair</a>${progressBar(percent(session.index, session.cards.length))}<span class="badge badge-purple">${session.index + 1}/${session.cards.length}</span></div><article class="card flashcard" data-action="flip-card"><span class="label">${session.revealed ? 'Resposta' : 'Tente recuperar'}</span><h2>${session.revealed ? escapeHtml(exercise.correct_answer) : escapeHtml(exercise.question_text)}</h2>${session.revealed ? `<div class="flashcard-answer"><p>${escapeHtml(exercise.explanation)}</p></div>` : '<p class="muted small">Formule sua resposta em voz alta e depois clique para revelar.</p>'}</article>${session.revealed ? `<div class="rating-row"><button class="button button-danger" data-rate="again">Errei<small>hoje</small></button><button class="button button-ghost" data-rate="hard">Difícil<small>curto</small></button><button class="button button-success" data-rate="good">Bom<small>normal</small></button><button class="button button-primary" data-rate="easy">Fácil<small>longo</small></button></div>` : ''}</section>`;
}

export function examsView() {
  return `<section class="page">${pageHead('Provas', 'Teste sob condições reais', 'Cronômetro, nota de corte e diagnóstico por tentativa. Faça uma prova quando quiser medir transferência, não apenas reconhecimento.')}
    <div class="grid grid-3">${curriculum.exams.map((exam) => {
      const attempts = store.state.examAttempts.filter((item) => item.examId === exam.id);
      const best = attempts.sort((a, b) => b.score - a.score)[0];
      return `<article class="card exam-card"><span class="project-icon-lg">${exam.icon}</span><h3>${escapeHtml(exam.title)}</h3><p>${escapeHtml(exam.description)}</p><div class="card-meta"><span>◷ ${exam.time_limit_minutes} min</span><span>✓ corte ${exam.passing_score}%</span><span>▤ ${questionsForExam(exam.id).length} questões</span></div>${best ? `<div class="badge ${best.passed ? 'badge-green' : 'badge-red'}" style="margin-bottom:12px">Melhor nota: ${best.score}%</div>` : ''}<a class="button button-primary button-block" href="#/exam/${exam.id}">${attempts.length ? 'Nova tentativa' : 'Iniciar prova'}</a></article>`;
    }).join('')}</div>
  </section>`;
}

export function examIntroView(exam) {
  const count = questionsForExam(exam.id).length;
  return `<section class="page lesson-shell">${pageHead('Avaliação', escapeHtml(exam.title), escapeHtml(exam.description))}<div class="card card-pad"><div class="grid grid-3"><div class="metric"><div class="metric-top">Questões</div><div class="metric-value">${count}</div></div><div class="metric"><div class="metric-top">Tempo</div><div class="metric-value">${exam.time_limit_minutes}m</div></div><div class="metric"><div class="metric-top">Nota mínima</div><div class="metric-value">${exam.passing_score}%</div></div></div><p class="muted small">Responda sem consultar materiais. Ao finalizar, você verá explicações e os tópicos que merecem reforço.</p><button class="button button-primary button-block" data-action="start-exam" data-id="${exam.id}" type="button">Começar agora</button></div></section>`;
}

export function examSessionView(session) {
  const question = session.questions[session.index];
  const remaining = Math.max(0, session.endsAt - Date.now());
  const minutes = String(Math.floor(remaining / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
  return `<section class="page lesson-shell"><div class="lesson-top"><button class="button button-ghost button-sm" data-action="finish-exam" type="button">Finalizar</button>${progressBar(percent(session.index, session.questions.length))}<span class="badge badge-orange" id="exam-clock">${minutes}:${seconds}</span></div><article class="card question-card"><span class="badge badge-purple">Questão ${session.index + 1} de ${session.questions.length}</span><h2>${escapeHtml(question.question_text)}</h2>${question.code_snippet ? `<pre class="code-block"><code>${escapeHtml(question.code_snippet)}</code></pre>` : ''}${answerArea({ ...question, type: question.type }, session.answers[question.id] ?? '')}<div class="lesson-actions"><button class="button button-ghost" data-action="exam-prev" ${session.index === 0 ? 'disabled' : ''} type="button">← Anterior</button><button class="button button-primary" data-action="exam-next" type="button">${session.index === session.questions.length - 1 ? 'Finalizar prova' : 'Próxima →'}</button></div></article></section>`;
}

export function examResultView(session) {
  const score = percent(session.correctCount, session.questions.length);
  const passed = score >= session.exam.passing_score;
  return `<section class="page lesson-shell">${emptyState(passed ? '🏆' : '↻', passed ? 'Você foi aprovado' : 'Ainda não desta vez', `Resultado: ${session.correctCount}/${session.questions.length} (${score}%). A nota mínima era ${session.exam.passing_score}%.`, `<div style="display:flex;gap:9px;justify-content:center"><a class="button button-ghost" href="#/exams">Todas as provas</a><a class="button button-primary" href="#/exam/${session.exam.id}">Tentar novamente</a></div>`)}</section>`;
}

export function projectsView() {
  return `<section class="page">${pageHead('Projetos guiados', 'Construa antes de se sentir pronto', 'Cinco projetos progressivos quebrados em passos, com requisitos, pistas, modelos iniciais e saída esperada.')}
    <div class="grid grid-3">${curriculum.projects.map((project) => {
      const steps = stepsForProject(project.id);
      const progress = store.state.projectProgress[project.id] ?? { completedSteps: [] };
      const pct = percent(progress.completedSteps?.length ?? 0, steps.length);
      return `<article class="card project-card"><span class="project-icon-lg">${project.icon}</span><div style="margin-top:12px"><span class="badge ${project.difficulty === 'INICIANTE' ? 'badge-green' : project.difficulty === 'INTERMEDIARIO' ? 'badge-orange' : 'badge-red'}">${project.difficulty}</span></div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p><div class="card-meta"><span>◷ ${project.estimated_hours}h</span><span>⚡ ${project.xp_reward} XP</span><span>▤ ${steps.length} passos</span></div>${progressBar(pct, 'green')}<a class="button button-primary button-block" style="margin-top:14px" href="#/project/${project.id}">${pct ? progress.completed ? 'Rever projeto' : 'Continuar projeto' : 'Começar projeto'}</a></article>`;
    }).join('')}</div>
  </section>`;
}

export function projectView(project, stepNumber = 1) {
  const steps = stepsForProject(project.id);
  const progress = store.state.projectProgress[project.id] ?? { currentStep: 1, completedSteps: [] };
  const current = byId(steps.map((item) => ({ ...item, id: item.step_number })), stepNumber) ?? steps[0];
  return `<section class="page">${pageHead(`${project.icon} Projeto guiado`, escapeHtml(project.title), escapeHtml(project.description), '<a class="button button-ghost" href="#/projects">Todos os projetos</a>')}
    <div class="layout-main"><div class="stack"><div class="card card-pad"><div class="card-head"><div><span class="badge badge-purple">Passo ${current.step_number}/${steps.length}</span></div><span class="badge badge-green">${progress.completedSteps?.includes(current.step_number) ? 'Concluído' : 'Em andamento'}</span></div><h2>${escapeHtml(current.title)}</h2><p class="muted">${escapeHtml(current.description)}</p>${current.code_template ? `<pre class="code-block"><code>${escapeHtml(current.code_template)}</code></pre>` : ''}<details><summary class="button button-ghost button-sm">Mostrar pista</summary><p class="feedback" style="margin-top:10px">${escapeHtml(current.hint || 'Divida o passo em operações menores.')}</p></details>${current.expected_output ? `<div><div class="eyebrow" style="margin-top:18px">Saída esperada</div><pre class="code-block">${escapeHtml(current.expected_output)}</pre></div>` : ''}<div class="lesson-actions"><a class="button button-ghost" href="#/playground">Abrir no playground</a><button class="button button-primary" data-action="complete-project-step" data-project="${project.id}" data-step="${current.step_number}" type="button">Marcar passo concluído</button></div></div></div><aside class="card card-pad"><div class="card-head"><div><h3>Roteiro do projeto</h3><p>${progress.completedSteps?.length ?? 0} de ${steps.length} concluídos</p></div></div><div class="roadmap-line">${steps.map((step) => `<a href="#/project/${project.id}?step=${step.step_number}" class="roadmap-item ${progress.completedSteps?.includes(step.step_number) ? 'done' : Number(step.step_number) === Number(current.step_number) ? 'current' : ''}" style="text-decoration:none"><span class="roadmap-dot"></span><h3>${escapeHtml(step.title)}</h3><p>Passo ${step.step_number}</p></a>`).join('')}</div></aside></div>
  </section>`;
}

export function interviewView(filters = {}) {
  const categories = unique(curriculum.interviewQuestions.map((question) => question.category));
  const query = (filters.query ?? '').toLocaleLowerCase('pt-BR');
  const rows = curriculum.interviewQuestions.filter((question) => (!filters.category || question.category === filters.category) && (!filters.difficulty || question.difficulty === filters.difficulty) && (!query || `${question.question} ${question.answer}`.toLocaleLowerCase('pt-BR').includes(query)));
  return `<section class="page">${pageHead('Preparação profissional', 'Banco de entrevistas Java', `${curriculum.interviewQuestions.length} perguntas reais organizadas por assunto e dificuldade. Tente responder antes de revelar.`)}
    <div class="filter-row"><input class="input search-input" id="interview-search" value="${escapeHtml(filters.query ?? '')}" placeholder="Buscar pergunta..."><button class="chip ${!filters.category ? 'active' : ''}" data-filter-category="">Todas</button>${categories.map((category) => `<button class="chip ${filters.category === category ? 'active' : ''}" data-filter-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('')}</div>
    <div class="grid grid-2">${rows.map((question) => `<article class="card interview-card"><div class="card-head"><span class="badge">${escapeHtml(question.category)}</span><span class="badge ${question.difficulty === 'FACIL' ? 'badge-green' : question.difficulty === 'MEDIO' ? 'badge-orange' : 'badge-red'}">${question.difficulty}</span></div><h3>${escapeHtml(question.question)}</h3><p>💡 ${escapeHtml(question.hint)}</p><button class="button button-ghost button-sm" data-action="toggle-interview" type="button">Revelar resposta</button><div class="interview-answer" hidden><p>${escapeHtml(question.answer)}</p>${question.code_example ? `<pre class="code-block"><code>${escapeHtml(question.code_example)}</code></pre>` : ''}</div></article>`).join('')}</div>
  </section>`;
}

const starterCode = `public class Main {
    public static void main(String[] args) {
        String trilha = "JavaFlow";
        int minutos = 25;
        System.out.println("Estudando com " + trilha);
        System.out.println("Foco: " + minutos + " minutos");
    }
}`;

export function playgroundView(code = starterCode) {
  return `<section class="page">${pageHead('Laboratório', 'Playground Java', 'Escreva, teste e salve experimentos. Sem executor configurado, uma prévia local segura cobre saídas e expressões simples.', '<button class="button button-ghost" data-action="runner-settings" type="button">⚙ Configurar executor</button>')}
    <div class="card editor-layout"><div class="editor-pane"><div class="editor-toolbar"><strong class="small">Main.java</strong><div><button class="button button-ghost button-sm" data-action="save-playground-snippet" type="button">Salvar</button> <button class="button button-primary button-sm" data-action="run-code" type="button">▶ Executar</button></div></div><textarea class="code-input" id="playground-code" spellcheck="false">${escapeHtml(code)}</textarea></div><div><div class="console-toolbar"><strong class="small">Console</strong><span class="badge" id="runner-mode">Prévia local</span></div><pre class="console-output" id="console-output">Pronto. Execute o programa para ver a saída.</pre><div style="padding:12px;border-top:1px solid var(--line)"><label class="small muted" for="stdin">Entrada padrão (uma linha por valor)</label><textarea class="textarea" id="stdin" style="min-height:80px;margin-top:6px" placeholder="Dados para Scanner..."></textarea></div></div></div>
  </section>`;
}

export function snippetsView(query = '') {
  const normalized = query.toLocaleLowerCase('pt-BR');
  const snippets = store.state.snippets.filter((item) => !normalized || `${item.title} ${item.description} ${item.tags} ${item.code}`.toLocaleLowerCase('pt-BR').includes(normalized));
  return `<section class="page">${pageHead('Biblioteca pessoal', 'Snippets de código', 'Salve padrões úteis, exemplos mínimos e soluções que você queira reencontrar.', '<button class="button button-primary" data-action="new-snippet" type="button">+ Novo snippet</button>')}
    <div class="filter-row"><input class="input search-input" id="snippet-search" value="${escapeHtml(query)}" placeholder="Buscar nos snippets..."><span class="badge">${store.state.snippets.length} salvos</span></div>
    ${snippets.length ? `<div class="grid grid-3">${snippets.map((snippet) => `<article class="card snippet-card"><div class="card-head"><div><h3>${escapeHtml(snippet.title)}</h3><p>${escapeHtml(snippet.tags || snippet.language)}</p></div><span class="badge badge-purple">${escapeHtml(snippet.language)}</span></div><p class="muted small">${escapeHtml(snippet.description)}</p><pre><code>${escapeHtml(snippet.code)}</code></pre><div class="snippet-actions"><button class="button button-ghost button-sm" data-action="copy-snippet" data-id="${snippet.id}" type="button">Copiar</button><button class="button button-ghost button-sm" data-action="edit-snippet" data-id="${snippet.id}" type="button">Editar</button><button class="button button-danger button-sm" data-action="delete-snippet" data-id="${snippet.id}" type="button">Excluir</button></div></article>`).join('')}</div>` : emptyState('⌑', 'Nenhum snippet encontrado', 'Crie seu primeiro snippet ou ajuste o termo da busca.', '<button class="button button-primary" data-action="new-snippet" type="button">Criar snippet</button>')}
  </section>`;
}

export function focusView(timer) {
  const totalMinutes = store.state.focusSessions.reduce((sum, item) => sum + item.minutes, 0);
  const todayMinutes = store.state.activity[dayKey()]?.minutes ?? 0;
  const progress = timer ? percent(timer.remaining, timer.total) : 100;
  const remaining = timer?.remaining ?? store.state.settings.focusMinutes * 60;
  return `<section class="page">${pageHead('Foco profundo', 'Pomodoro conectado ao aprendizado', 'Associe cada ciclo a uma tarefa concreta. O calendário registra automaticamente o tempo de estudo.')}
    <div class="layout-main"><div class="card timer-card"><div class="tabs" style="margin:auto;max-width:350px"><button class="tab ${!timer?.break ? 'active' : ''}" data-action="timer-focus">Foco</button><button class="tab ${timer?.break ? 'active' : ''}" data-action="timer-break">Pausa</button></div><div class="timer-ring" style="--timer-progress:${progress}%"><div class="timer-content"><div class="timer-time" id="timer-time">${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}</div><div class="timer-label">${timer?.break ? 'Recuperação' : 'Foco profundo'}</div></div></div><input class="input" id="focus-task" value="${escapeHtml(timer?.task ?? '')}" placeholder="Em que você vai trabalhar?"><div class="timer-controls" style="margin-top:16px"><button class="button button-ghost" data-action="timer-reset" type="button">↺ Reiniciar</button><button class="button button-primary" data-action="timer-toggle" type="button">${timer?.running ? 'Ⅱ Pausar' : '▶ Começar'}</button></div></div><aside class="stack"><div class="card metric"><div class="metric-top">Hoje</div><div class="metric-value">${todayMinutes} min</div><div class="metric-detail">Tempo de foco registrado</div></div><div class="card metric"><div class="metric-top">Total acumulado</div><div class="metric-value">${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m</div><div class="metric-detail">${store.state.focusSessions.length} sessões concluídas</div></div><div class="card card-pad"><div class="card-head"><div><h3>Últimas sessões</h3></div></div><div class="day-list">${store.state.focusSessions.slice(0, 5).map((item) => `<div class="day-row"><span>${formatDate(item.at)}</span><span>${escapeHtml(item.task || 'Estudo livre')}</span><strong>${item.minutes}m</strong></div>`).join('') || '<p class="muted small">Nenhuma sessão concluída.</p>'}</div></div></aside></div>
  </section>`;
}

export function calendarView() {
  const cells = Array.from({ length: 154 }, (_, index) => {
    const date = daysAgo(153 - index);
    const key = dayKey(date);
    const activity = store.state.activity[key];
    const score = (activity?.exercises ?? 0) + Math.ceil((activity?.minutes ?? 0) / 10) + (activity?.lessons ?? 0) * 2;
    const level = score === 0 ? 0 : score < 3 ? 1 : score < 6 ? 2 : score < 10 ? 3 : 4;
    return `<span class="heat-cell" data-level="${level}" title="${formatDate(date, { day: '2-digit', month: 'long' })}: ${score ? `${score} ações` : 'sem estudo'}"></span>`;
  }).join('');
  const totalMinutes = store.state.focusSessions.reduce((sum, item) => sum + item.minutes, 0);
  return `<section class="page">${pageHead('Histórico', 'Calendário de consistência', 'Visualize a frequência, não apenas picos de intensidade. Cada quadrado registra lições, exercícios ou foco.')}
    <div class="grid grid-3"><div class="card metric"><div class="metric-top">Dias ativos</div><div class="metric-value">${Object.keys(store.state.activity).length}</div></div><div class="card metric"><div class="metric-top">Tempo focado</div><div class="metric-value">${Math.floor(totalMinutes / 60)}h</div></div><div class="card metric"><div class="metric-top">Maior sequência atual</div><div class="metric-value">${store.state.user.streak} dias</div></div></div>
    <div class="card card-pad" style="margin-top:16px"><div class="card-head"><div><h2>Últimos cinco meses</h2><p>Quanto mais escuro, maior a atividade.</p></div><div class="small muted">Menos ▪ ▪ ▪ ▪ Mais</div></div><div class="heatmap-scroll"><div class="heatmap">${cells}</div></div></div>
    <div class="card card-pad" style="margin-top:16px"><div class="card-head"><div><h2>Dias recentes</h2></div></div><div class="day-list">${Object.entries(store.state.activity).sort(([a], [b]) => b.localeCompare(a)).slice(0, 12).map(([date, item]) => `<div class="day-row"><span>${formatDate(`${date}T12:00:00`)}</span><span>${item.exercises} exercícios · ${item.lessons} lições · ${item.minutes} min</span><strong>+${item.xp} XP</strong></div>`).join('') || '<p class="muted small">Sua atividade aparecerá aqui.</p>'}</div></div>
  </section>`;
}

export function roadmapView() {
  return `<section class="page">${pageHead('Mapa de carreira', 'Do primeiro println ao backend profissional', 'Um roteiro conectado às lições, projetos e competências cobradas no mercado.')}
    <div class="layout-main"><div class="card card-pad"><div class="roadmap-line">${curriculum.modules.map((module) => {
      const mastery = moduleMastery(module);
      return `<a href="#/learn" class="roadmap-item ${mastery >= 80 ? 'done' : mastery > 0 ? 'current' : ''}" style="text-decoration:none"><span class="roadmap-dot"></span><h3>${module.icon} ${escapeHtml(module.title)}</h3><p>${escapeHtml(module.description)} · ${mastery}% de domínio</p></a>`;
    }).join('')}</div></div><aside class="stack"><div class="card card-pad"><div class="card-head"><div><h3>Próxima competência</h3><p>Baseada no seu domínio atual</p></div></div><h2>${escapeHtml(stats().nextLesson.title)}</h2><p class="muted small">${escapeHtml(stats().nextLesson.description)}</p><a class="button button-primary button-block" href="#/lesson/${stats().nextLesson.id}">Estudar agora</a></div><div class="card card-pad"><div class="card-head"><div><h3>Portfólio</h3><p>Projetos completos comprovam aplicação.</p></div></div>${curriculum.projects.map((project) => `<a class="quick-card" href="#/project/${project.id}"><span class="quick-icon">${project.icon}</span><span><strong>${escapeHtml(project.title)}</strong><small>${project.difficulty}</small></span><span>›</span></a>`).join('')}</div></aside></div>
  </section>`;
}

export function rankingView() {
  const names = ['Marina Code', 'Lucas JVM', 'Bia Backend', 'Rafael Streams', 'Ana Byte', 'Caio Spring', 'Lia Lambda', 'Pedro API', 'Nina Dev'];
  const seeded = names.map((name, index) => ({ name, xp: Math.max(120, 1850 - index * 143), streak: 21 - index, color: ['#6d4aff', '#1687e8', '#16a66a', '#ed8b20'][index % 4] }));
  seeded.push({ name: store.state.user.name, xp: store.state.user.xp, streak: store.state.user.streak, color: store.state.user.avatarColor, current: true });
  seeded.sort((a, b) => b.xp - a.xp);
  return `<section class="page">${pageHead('Liga semanal', 'Ranking de constância', 'Uma referência leve de motivação. Domínio e retenção continuam sendo as métricas principais.')}
    <div class="layout-main"><div class="card card-pad"><div class="card-head"><div><h2>Liga JVM</h2><p>Reinicia na segunda-feira.</p></div><span class="badge badge-purple">Top ${seeded.findIndex((item) => item.current) + 1}</span></div>${seeded.map((item, index) => `<div class="ranking-row ${item.current ? 'current' : ''}"><span class="rank-position">${index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}</span><span class="avatar" style="background:${item.color}">${escapeHtml(item.name[0])}</span><span><strong>${escapeHtml(item.name)}${item.current ? ' · você' : ''}</strong><small>🔥 ${item.streak} dias</small></span><span class="ranking-xp">${formatNumber(item.xp)} XP</span></div>`).join('')}</div><aside class="stack"><div class="card card-pad"><div class="card-head"><div><h3>Sua estratégia</h3></div></div><p class="muted small">Ganhe XP com ações que também aumentam domínio: lições, provas, revisão de erros e foco registrado.</p><a class="button button-primary button-block" href="#/daily">Fazer missão diária</a></div><div class="card metric"><div class="metric-top">Seu XP semanal</div><div class="metric-value">${stats().weeklyXp}</div><div class="metric-detail">Meta: ${store.state.user.weeklyGoal} XP</div></div></aside></div>
  </section>`;
}

const achievements = [
  ['first-step', '🌱', 'Primeiro passo'], ['streak-3', '🔥', 'Trinca de foco'], ['streak-7', '⚡', 'Semana firme'], ['xp-100', '💯', '100 XP'], ['xp-500', '🚀', '500 XP'], ['focus-60', '◷', 'Hora profunda'], ['mistake-slayer', '↻', 'Caçador de erros'], ['exam-pass', '🏆', 'Aprovado'], ['builder', '⌘', 'Construtor'],
];

export function profileView() {
  const computed = stats();
  const totalMinutes = store.state.focusSessions.reduce((sum, item) => sum + item.minutes, 0);
  return `<section class="page">${pageHead('Perfil e dados', 'Seu progresso, sob seu controle', 'Acompanhe domínio, personalize metas e exporte todo o histórico local.', '<button class="button button-primary" data-action="edit-profile" type="button">Editar perfil</button>')}
    <div class="card profile-hero"><span class="avatar" style="background:${store.state.user.avatarColor}">${escapeHtml(store.state.user.name[0]?.toUpperCase() ?? 'D')}</span><div><h1>${escapeHtml(store.state.user.name)}</h1><p>${escapeHtml(store.state.user.email || 'Perfil local neste dispositivo')}</p><span class="badge badge-purple">Nível ${computed.level} · ${formatNumber(store.state.user.xp)} XP</span></div></div>
    <div class="grid grid-4 metrics-mobile" style="margin-top:16px"><div class="card metric"><div class="metric-top">Precisão</div><div class="metric-value">${computed.accuracy}%</div></div><div class="card metric"><div class="metric-top">Lições</div><div class="metric-value">${store.state.completedLessons.length}/${curriculum.lessons.length}</div></div><div class="card metric"><div class="metric-top">Foco</div><div class="metric-value">${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m</div></div><div class="card metric"><div class="metric-top">Provas</div><div class="metric-value">${store.state.examAttempts.length}</div></div></div>
    <div class="layout-main" style="margin-top:16px"><div class="stack">${knowledgeCard()}<div class="card card-pad"><div class="card-head"><div><h2>Conquistas</h2><p>${store.state.achievements.length} de ${achievements.length} desbloqueadas.</p></div></div><div class="achievement-grid">${achievements.map(([key, icon, title]) => `<div class="achievement ${store.state.achievements.includes(key) ? 'earned' : ''}"><span>${icon}</span><strong>${title}</strong></div>`).join('')}</div></div></div><aside class="stack"><div class="card card-pad"><div class="card-head"><div><h3>Meta semanal</h3><p>${stats().weeklyXp}/${store.state.user.weeklyGoal} XP</p></div></div>${progressBar(percent(stats().weeklyXp, store.state.user.weeklyGoal))}<button class="button button-ghost button-block" style="margin-top:13px" data-action="edit-settings" type="button">Ajustar preferências</button></div><div class="card card-pad"><div class="card-head"><div><h3>Dados protegidos</h3><p>Salvamento automático em duas cópias locais.</p></div><span class="badge badge-green">Ativo</span></div><p class="muted small">Seu progresso sobrevive ao fechamento de abas e do navegador neste dispositivo.</p></div><div class="card card-pad"><div class="card-head"><div><h3>Portabilidade</h3><p>Backup independente em arquivo JSON.</p></div></div><div class="stack" style="gap:8px"><button class="button button-ghost button-block" data-action="export-data" type="button">↓ Exportar progresso</button><button class="button button-ghost button-block" data-action="import-data" type="button">↑ Importar backup</button><button class="button button-danger button-block" data-action="reset-data" type="button">Reiniciar dados</button></div></div></aside></div>
  </section>`;
}

const agents = [
  ['mentor', '✦', 'Mentor Java', 'Conceitos e dúvidas'],
  ['debugger', '🐛', 'Debugger', 'Diagnóstico de erros'],
  ['challenge', '◎', 'Desafios', 'Prática adaptativa'],
  ['reviewer', '⌕', 'Code reviewer', 'Qualidade e design'],
  ['interview', '♟', 'Entrevistador', 'Simulação técnica'],
];

export function coachView(chat) {
  return `<section class="page">${pageHead('Agentes de estudo', 'Coach Java contextual', 'Funciona localmente e pode usar uma API compatível com OpenAI configurada por você.', '<button class="button button-ghost" data-action="ai-settings" type="button">⚙ Integração</button>')}
    <div class="card coach-layout"><aside class="agent-list">${agents.map(([key, icon, name, desc]) => `<button class="agent-button ${chat.agent === key ? 'active' : ''}" data-agent="${key}" type="button"><span>${icon}</span><span><strong>${name}</strong><small>${desc}</small></span></button>`).join('')}</aside><div class="chat-panel"><div class="messages" id="messages">${chat.messages.map((message) => `<div class="message ${message.role}">${escapeHtml(message.text)}</div>`).join('')}</div><form class="chat-form" id="chat-form"><textarea class="textarea" id="chat-input" style="min-height:48px;max-height:130px" placeholder="Pergunte, cole um erro ou envie seu código..."></textarea><button class="button button-primary" type="submit">Enviar</button></form></div></div>
  </section>`;
}

export const dataAccess = { byId, exercisesForLesson, questionsForExam, stepsForProject, starterCode };
