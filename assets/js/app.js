import { curriculum } from './data.js';
import { englishCurriculum, englishDashboardView, englishExerciseById, englishExerciseView, englishLearnView, englishLessonExercises, englishResultView, englishReviewView, englishStats, englishWordsView } from './english.js';
import { askCoach, runJava } from './services.js';
import { store } from './store.js';
import { calendarView, coachView, dailyView, dashboardView, dataAccess, examIntroView, examResultView, examSessionView, examsView, exerciseView, flashcardSessionView, flashcardsView, focusView, interviewView, learnView, playgroundView, profileView, projectView, projectsView, rankingView, reviewView, roadmapView, sessionResultView, snippetsView, stats } from './views.js';
import { closeModal, copyText, dayKey, downloadFile, escapeHtml, go, normalizeAnswer, openModal, percent, routeParts, seededIndex, toast } from './utils.js';

const view = document.getElementById('view');
let exerciseSession = null;
let englishSession = null;
let flashcardSession = null;
let examSession = null;
let examTicker = null;
let focusTimer = null;
let focusTicker = null;
let interviewFilters = { query: '', category: '', difficulty: '' };
let snippetQuery = '';
let playgroundCode = dataAccess.starterCode;
let chat = {
  agent: 'mentor',
  messages: [{ role: 'assistant', text: 'Olá! Eu sou seu mentor Java. Posso explicar conceitos, diagnosticar erros, revisar código, criar desafios e simular entrevistas. Em que você está trabalhando?' }],
};

function render() {
  const route = routeParts();
  const [root, id] = route.parts;

  if (root === 'english' && route.parts[1] === 'session' && englishSession) {
    view.innerHTML = englishExerciseView(englishSession);
  } else if (root === 'english' && route.parts[1] === 'result' && englishSession?.finished) {
    view.innerHTML = englishResultView(englishSession);
  } else if (exerciseSession?.finished && root === 'session-result') {
    view.innerHTML = sessionResultView(exerciseSession);
  } else if (flashcardSession && root === 'flashcard-session') {
    view.innerHTML = flashcardSessionView(flashcardSession);
  } else if (examSession?.finished && root === 'exam-result') {
    view.innerHTML = examResultView(examSession);
  } else if (examSession && root === 'exam-session') {
    view.innerHTML = examSessionView(examSession);
  } else if (exerciseSession && root === 'study-session') {
    view.innerHTML = exerciseView(exerciseSession);
  } else {
    switch (root) {
      case 'dashboard': view.innerHTML = dashboardView(); break;
      case 'learn': view.innerHTML = learnView(); break;
      case 'daily': view.innerHTML = dailyView(); break;
      case 'review': view.innerHTML = reviewView(); break;
      case 'flashcards': view.innerHTML = flashcardsView(); break;
      case 'exams': view.innerHTML = examsView(); break;
      case 'exam': {
        const exam = dataAccess.byId(curriculum.exams, id);
        view.innerHTML = exam ? examIntroView(exam) : notFoundView();
        break;
      }
      case 'projects': view.innerHTML = projectsView(); break;
      case 'project': {
        const project = dataAccess.byId(curriculum.projects, id);
        view.innerHTML = project ? projectView(project, Number(route.query.get('step')) || (store.state.projectProgress[project.id]?.currentStep ?? 1)) : notFoundView();
        break;
      }
      case 'interview': view.innerHTML = interviewView(interviewFilters); break;
      case 'playground': view.innerHTML = playgroundView(playgroundCode); break;
      case 'snippets': view.innerHTML = snippetsView(snippetQuery); break;
      case 'focus': view.innerHTML = focusView(focusTimer); break;
      case 'calendar': view.innerHTML = calendarView(); break;
      case 'roadmap': view.innerHTML = roadmapView(); break;
      case 'ranking':
      case 'leaderboard': view.innerHTML = rankingView(); break;
      case 'profile': view.innerHTML = profileView(); break;
      case 'coach':
      case 'agents':
      case 'chat': view.innerHTML = coachView(chat); requestAnimationFrame(scrollMessages); break;
      case 'lesson': startLesson(Number(id)); return;
      case 'english': renderEnglishRoute(route.parts); break;
      default: view.innerHTML = notFoundView();
    }
  }

  updateChrome(root);
  wireViewForms();
  window.scrollTo({ top: 0, behavior: store.state.settings.reducedMotion ? 'auto' : 'smooth' });
}

function renderEnglishRoute(parts) {
  const page = parts[1] ?? 'dashboard';
  if (page === 'dashboard') view.innerHTML = englishDashboardView();
  else if (page === 'learn') view.innerHTML = englishLearnView();
  else if (page === 'review') view.innerHTML = englishReviewView();
  else if (page === 'words') view.innerHTML = englishWordsView();
  else if (page === 'lesson') {
    startEnglishLesson(Number(parts[2]));
    return;
  } else view.innerHTML = notFoundView();
}

function startEnglishLesson(id) {
  const lesson = englishCurriculum.lessons.find((item) => item.id === id);
  if (!lesson) return go('english');
  englishSession = { mode: 'lesson', lessonId: id, exercises: englishLessonExercises(id), index: 0, correctCount: 0, checked: false, correct: false, answer: '', hint: '', exitRoute: 'learn', finished: false, xpEarned: 0 };
  go('english/session');
}

function startEnglishSet(exercises, mode, exitRoute) {
  if (!exercises.length) return toast('Complete uma lição para liberar esta prática.', 'error');
  englishSession = { mode, lessonId: null, exercises, index: 0, correctCount: 0, checked: false, correct: false, answer: '', hint: '', exitRoute, finished: false, xpEarned: 0 };
  go('english/session');
}

function englishAnswer() {
  return document.getElementById('english-answer')?.value ?? englishSession?.answer ?? '';
}

function normalizeEnglish(value) {
  return normalizeAnswer(value).replace(/[?.!,;:'“”]/g, '');
}

function checkEnglishExercise() {
  if (!englishSession || englishSession.checked) return;
  const exercise = englishSession.exercises[englishSession.index];
  const answer = englishAnswer();
  if (!answer.trim()) return toast('Escolha, monte ou fale uma resposta antes de verificar.', 'error');
  const correct = normalizeEnglish(answer) === normalizeEnglish(exercise.correct_answer);
  Object.assign(englishSession, { answer, correct, checked: true });
  if (correct) {
    englishSession.correctCount += 1;
    englishSession.xpEarned += exercise.xp_reward ?? 8;
  }
  store.recordEnglishAnswer(exercise.id, correct, answer, exercise.lesson_id, correct ? exercise.xp_reward : 0);
  render();
}

function nextEnglishExercise() {
  if (!englishSession?.checked) return;
  const exercise = englishSession.exercises[englishSession.index];
  if (englishSession.mode === 'review') store.rateEnglishCard(exercise.id, englishSession.correct ? 'good' : 'again');
  if (englishSession.index + 1 >= englishSession.exercises.length) return finishEnglishSession();
  englishSession.index += 1;
  Object.assign(englishSession, { checked: false, correct: false, answer: '', hint: '' });
  render();
}

function finishEnglishSession() {
  const score = percent(englishSession.correctCount, englishSession.exercises.length);
  if (englishSession.mode === 'lesson') {
    const lesson = englishCurriculum.lessons.find((item) => item.id === englishSession.lessonId);
    if (store.completeEnglishLesson(lesson.id, score, lesson.xp_reward)) englishSession.xpEarned += lesson.xp_reward;
  }
  if (englishSession.mode === 'daily') store.update((state) => { state.english.daily[dayKey()] = { completed: true, score, at: new Date().toISOString() }; });
  englishSession.finished = true;
  go('english/result');
}

function speakEnglish(text) {
  if (!('speechSynthesis' in window)) return toast('O áudio não está disponível neste navegador.', 'error');
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.82;
  const voice = speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith('en'));
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

function recognizeEnglish() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return toast('Reconhecimento de voz não disponível. Você ainda pode digitar a resposta.', 'error');
  const recognition = new Recognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.onstart = () => toast('Ouvindo… fale em inglês.');
  recognition.onerror = () => toast('Não consegui ouvir. Tente novamente em um lugar silencioso.', 'error');
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    englishSession.answer = transcript;
    const input = document.getElementById('english-answer');
    if (input) input.value = transcript;
    toast(`Entendi: “${transcript}”`);
  };
  recognition.start();
}

function notFoundView() {
  return `<section class="page"><div class="card empty-state"><div class="empty-icon">⌕</div><h2>Página não encontrada</h2><p>Este endereço não corresponde a nenhum módulo do JavaFlow.</p><a class="button button-primary" href="#/dashboard">Voltar ao início</a></div></section>`;
}

function startLesson(id) {
  const lesson = dataAccess.byId(curriculum.lessons, id);
  if (!lesson) {
    view.innerHTML = notFoundView();
    return;
  }
  exerciseSession = {
    mode: 'lesson', lessonId: id, exercises: dataAccess.exercisesForLesson(id), index: 0,
    correctCount: 0, checked: false, correct: false, answer: '', hint: '', hintLevel: 0, exitRoute: 'learn', finished: false,
  };
  go('study-session');
}

function startExerciseSet(exercises, mode, exitRoute, lessonId = null) {
  exerciseSession = {
    mode, lessonId, exercises, index: 0, correctCount: 0, checked: false,
    correct: false, answer: '', hint: '', hintLevel: 0, exitRoute, finished: false,
  };
  go('study-session');
}

function currentExerciseAnswer() {
  const input = document.getElementById('exercise-answer');
  return input ? input.value : exerciseSession?.answer ?? '';
}

function checkExercise() {
  if (!exerciseSession || exerciseSession.checked) return;
  const exercise = exerciseSession.exercises[exerciseSession.index];
  const answer = currentExerciseAnswer();
  if (!String(answer).trim()) return toast('Escolha ou digite uma resposta antes de verificar.', 'error');
  const correct = normalizeAnswer(answer) === normalizeAnswer(exercise.correct_answer);
  exerciseSession.answer = answer;
  exerciseSession.correct = correct;
  exerciseSession.checked = true;
  if (correct) exerciseSession.correctCount += 1;
  store.recordAnswer(exercise.id, correct, answer, exercise.lesson_id, correct ? (exercise.xp_reward ?? 10) : 0);
  render();
}

function nextExercise() {
  if (!exerciseSession?.checked) return;
  if (exerciseSession.index + 1 >= exerciseSession.exercises.length) {
    finishExerciseSession();
    return;
  }
  exerciseSession.index += 1;
  Object.assign(exerciseSession, { checked: false, correct: false, answer: '', hint: '', hintLevel: 0 });
  render();
}

function finishExerciseSession() {
  const score = percent(exerciseSession.correctCount, exerciseSession.exercises.length);
  if (exerciseSession.mode === 'lesson') {
    const lesson = dataAccess.byId(curriculum.lessons, exerciseSession.lessonId);
    store.completeLesson(lesson.id, score, lesson.xp_reward);
  }
  if (exerciseSession.mode === 'daily') {
    store.update((state) => { state.daily[dayKey()] = { completed: true, score, at: new Date().toISOString() }; });
    if (score >= 60) store.awardXp(50, { source: 'daily' });
  }
  exerciseSession.finished = true;
  go('session-result');
}

function giveHint() {
  if (!exerciseSession) return;
  const exercise = exerciseSession.exercises[exerciseSession.index];
  exerciseSession.hintLevel = Math.min(3, exerciseSession.hintLevel + 1);
  if (exerciseSession.hintLevel === 1) {
    exerciseSession.hint = `Pense no conceito central: ${exercise.question_text.split(/[?.:]/)[0].toLocaleLowerCase('pt-BR')}. Elimine opções que pertencem a outras categorias.`;
  } else if (exerciseSession.hintLevel === 2) {
    exerciseSession.hint = `A resposta tem ${String(exercise.correct_answer).length} caracteres e começa com “${String(exercise.correct_answer)[0]}”.`;
  } else {
    exerciseSession.hint = exercise.explanation.split('.').slice(0, 1).join('.') + '.';
  }
  render();
}

function startFlashcards() {
  const due = stats().dueCards.slice(0, 20);
  const cards = due.length ? due : curriculum.exercises.slice(0, 20);
  flashcardSession = { cards, index: 0, revealed: false };
  go('flashcard-session');
}

function rateFlashcard(rating) {
  const card = flashcardSession?.cards[flashcardSession.index];
  if (!card) return;
  store.rateFlashcard(card.id, rating);
  flashcardSession.index += 1;
  flashcardSession.revealed = false;
  render();
}

function startExam(examId) {
  const exam = dataAccess.byId(curriculum.exams, examId);
  examSession = {
    exam,
    questions: dataAccess.questionsForExam(examId),
    index: 0,
    answers: {},
    endsAt: Date.now() + exam.time_limit_minutes * 60000,
    finished: false,
    correctCount: 0,
  };
  clearInterval(examTicker);
  examTicker = setInterval(updateExamClock, 1000);
  go('exam-session');
}

function updateExamClock() {
  if (!examSession || examSession.finished) return clearInterval(examTicker);
  const remaining = Math.max(0, examSession.endsAt - Date.now());
  const clock = document.getElementById('exam-clock');
  if (clock) clock.textContent = `${String(Math.floor(remaining / 60000)).padStart(2, '0')}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}`;
  if (!remaining) finishExam();
}

function storeExamAnswer() {
  if (!examSession) return;
  const question = examSession.questions[examSession.index];
  const input = document.getElementById('exercise-answer');
  if (input) examSession.answers[question.id] = input.value;
}

function finishExam() {
  if (!examSession || examSession.finished) return;
  storeExamAnswer();
  examSession.correctCount = examSession.questions.filter((question) => normalizeAnswer(examSession.answers[question.id]) === normalizeAnswer(question.correct_answer)).length;
  const score = percent(examSession.correctCount, examSession.questions.length);
  store.saveExamAttempt({ examId: examSession.exam.id, score, passed: score >= examSession.exam.passing_score, answers: examSession.answers });
  examSession.finished = true;
  clearInterval(examTicker);
  go('exam-result');
}

function ensureFocusTimer(breakMode = false) {
  const minutes = breakMode ? store.state.settings.shortBreakMinutes : store.state.settings.focusMinutes;
  focusTimer = { total: minutes * 60, remaining: minutes * 60, running: false, break: breakMode, task: document.getElementById('focus-task')?.value ?? focusTimer?.task ?? '' };
}

function toggleTimer() {
  if (!focusTimer) ensureFocusTimer(false);
  focusTimer.task = document.getElementById('focus-task')?.value ?? focusTimer.task;
  focusTimer.running = !focusTimer.running;
  clearInterval(focusTicker);
  if (focusTimer.running) focusTicker = setInterval(tickFocus, 1000);
  render();
}

function tickFocus() {
  if (!focusTimer?.running) return;
  focusTimer.remaining -= 1;
  const element = document.getElementById('timer-time');
  if (element) element.textContent = `${String(Math.floor(focusTimer.remaining / 60)).padStart(2, '0')}:${String(focusTimer.remaining % 60).padStart(2, '0')}`;
  const ring = document.querySelector('.timer-ring');
  if (ring) ring.style.setProperty('--timer-progress', `${percent(focusTimer.remaining, focusTimer.total)}%`);
  if (focusTimer.remaining <= 0) {
    clearInterval(focusTicker);
    focusTimer.running = false;
    if (!focusTimer.break) {
      store.recordFocus(Math.round(focusTimer.total / 60), focusTimer.task);
      toast('Ciclo de foco concluído. Faça uma pausa curta.');
      ensureFocusTimer(true);
    } else {
      toast('Pausa concluída. Hora de um novo ciclo.');
      ensureFocusTimer(false);
    }
    render();
  }
}

function wireViewForms() {
  const chatForm = document.getElementById('chat-form');
  chatForm?.addEventListener('submit', handleChatSubmit);
}

async function handleChatSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input');
  const prompt = input.value.trim();
  if (!prompt) return;
  chat.messages.push({ role: 'user', text: prompt }, { role: 'assistant', text: 'Pensando…' });
  render();
  const response = await askCoach(chat.agent, prompt);
  chat.messages[chat.messages.length - 1] = { role: 'assistant', text: response.text };
  render();
}

function scrollMessages() {
  const messages = document.getElementById('messages');
  if (messages) messages.scrollTop = messages.scrollHeight;
}

function snippetModal(snippet = {}) {
  openModal(`<div class="modal-card"><div class="modal-head"><h2>${snippet.id ? 'Editar snippet' : 'Novo snippet'}</h2><button class="icon-button" data-close-modal type="button">×</button></div><form class="form-grid" id="snippet-form"><input type="hidden" name="id" value="${escapeHtml(snippet.id ?? '')}"><div class="form-row"><label>Título</label><input class="input" name="title" required value="${escapeHtml(snippet.title ?? '')}" placeholder="Ex.: Ordenar uma lista"></div><div class="grid grid-2"><div class="form-row"><label>Linguagem</label><input class="input" name="language" value="${escapeHtml(snippet.language ?? 'Java')}"></div><div class="form-row"><label>Tags</label><input class="input" name="tags" value="${escapeHtml(snippet.tags ?? '')}" placeholder="coleções, streams"></div></div><div class="form-row"><label>Descrição</label><input class="input" name="description" value="${escapeHtml(snippet.description ?? '')}"></div><div class="form-row"><label>Código</label><textarea class="textarea code-input" style="min-height:250px" name="code" required>${escapeHtml(snippet.code ?? '')}</textarea></div><button class="button button-primary button-block" type="submit">Salvar snippet</button></form></div>`, (root) => root.querySelector('#snippet-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    store.saveSnippet(data);
    closeModal();
    toast('Snippet salvo.');
    render();
  }));
}

function editProfileModal() {
  const user = store.state.user;
  openModal(`<div class="modal-card"><div class="modal-head"><h2>Editar perfil</h2><button class="icon-button" data-close-modal type="button">×</button></div><form class="form-grid" id="profile-form"><div class="form-row"><label>Nome</label><input class="input" name="name" value="${escapeHtml(user.name)}" required></div><div class="form-row"><label>E-mail opcional</label><input class="input" type="email" name="email" value="${escapeHtml(user.email)}"></div><div class="form-row"><label>Cor do avatar</label><input class="input" type="color" name="avatarColor" value="${user.avatarColor}"></div><button class="button button-primary button-block" type="submit">Salvar perfil</button></form></div>`, (root) => root.querySelector('#profile-form').addEventListener('submit', (event) => {
    event.preventDefault();
    store.updateProfile(Object.fromEntries(new FormData(event.currentTarget)));
    closeModal();
    toast('Perfil atualizado.');
    render();
  }));
}

function settingsModal() {
  const settings = store.state.settings;
  openModal(`<div class="modal-card"><div class="modal-head"><h2>Preferências de estudo</h2><button class="icon-button" data-close-modal type="button">×</button></div><form class="form-grid" id="settings-form"><div class="grid grid-2"><div class="form-row"><label>Foco (minutos)</label><input class="input" type="number" min="1" max="120" name="focusMinutes" value="${settings.focusMinutes}"></div><div class="form-row"><label>Pausa curta</label><input class="input" type="number" min="1" max="60" name="shortBreakMinutes" value="${settings.shortBreakMinutes}"></div></div><div class="form-row"><label>Meta semanal de XP</label><input class="input" type="number" min="50" step="50" name="weeklyGoal" value="${store.state.user.weeklyGoal}"></div><div class="form-row"><label>Tema</label><select class="select" name="theme"><option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Claro</option><option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Escuro</option></select></div><label class="small"><input type="checkbox" name="reducedMotion" ${settings.reducedMotion ? 'checked' : ''}> Reduzir animações</label><button class="button button-primary button-block" type="submit">Aplicar preferências</button></form></div>`, (root) => root.querySelector('#settings-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    store.updateSettings({ focusMinutes: Number(form.get('focusMinutes')), shortBreakMinutes: Number(form.get('shortBreakMinutes')), theme: form.get('theme'), reducedMotion: form.get('reducedMotion') === 'on' });
    store.update((state) => { state.user.weeklyGoal = Number(form.get('weeklyGoal')); });
    applyTheme();
    closeModal();
    render();
  }));
}

function runnerSettingsModal() {
  const settings = store.state.settings;
  openModal(`<div class="modal-card"><div class="modal-head"><h2>Executor Java</h2><button class="icon-button" data-close-modal type="button">×</button></div><form class="form-grid" id="runner-form"><p class="muted small">Sem configuração, o playground produz uma prévia local de expressões simples e System.out.print. Para compilação Java completa, informe a URL de uma instância Judge0 CE.</p><div class="form-row"><label>URL base do Judge0</label><input class="input" type="url" name="runnerUrl" value="${escapeHtml(settings.runnerUrl)}" placeholder="https://seu-judge0.exemplo"></div><div class="form-row"><label>Token de acesso (fica apenas nesta aba)</label><input class="input" type="password" name="runnerKey" autocomplete="off" placeholder="Opcional"></div><button class="button button-primary button-block" type="submit">Salvar configuração</button></form></div>`, (root) => root.querySelector('#runner-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    store.updateSettings({ runnerUrl: form.get('runnerUrl').trim() });
    if (form.get('runnerKey')) sessionStorage.setItem('javaflow-runner-key', form.get('runnerKey'));
    closeModal();
    toast('Executor configurado.');
  }));
}

function aiSettingsModal() {
  const settings = store.state.settings;
  openModal(`<div class="modal-card"><div class="modal-head"><h2>Integração do Coach</h2><button class="icon-button" data-close-modal type="button">×</button></div><form class="form-grid" id="ai-form"><p class="muted small">O mentor local funciona sem conta. Opcionalmente, conecte uma API compatível com OpenAI. A chave permanece apenas nesta aba e nunca é exportada.</p><div class="form-row"><label>URL base</label><input class="input" type="url" name="aiUrl" value="${escapeHtml(settings.aiUrl)}" placeholder="https://api.exemplo.com/openai/v1"></div><div class="form-row"><label>Modelo</label><input class="input" name="aiModel" value="${escapeHtml(settings.aiModel)}" placeholder="llama-3.3-70b-versatile"></div><div class="form-row"><label>Chave da API</label><input class="input" type="password" name="apiKey" autocomplete="off" placeholder="Fica somente nesta aba"></div><button class="button button-primary button-block" type="submit">Salvar integração</button></form></div>`, (root) => root.querySelector('#ai-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    store.updateSettings({ aiUrl: form.get('aiUrl').trim(), aiModel: form.get('aiModel').trim() });
    if (form.get('apiKey')) sessionStorage.setItem('javaflow-ai-key', form.get('apiKey'));
    closeModal();
    toast('Integração atualizada.');
  }));
}

function confirmReset() {
  openModal(`<div class="modal-card"><div class="modal-head"><h2>Reiniciar todo o progresso?</h2><button class="icon-button" data-close-modal type="button">×</button></div><p class="muted">Essa ação remove XP, lições, revisões, snippets e histórico deste dispositivo. Exporte um backup antes se quiser recuperar depois.</p><div style="display:flex;gap:9px;justify-content:flex-end"><button class="button button-ghost" data-close-modal type="button">Cancelar</button><button class="button button-danger" id="confirm-reset" type="button">Apagar dados</button></div></div>`, (root) => root.querySelector('#confirm-reset').addEventListener('click', () => {
    store.reset();
    closeModal();
    applyTheme();
    go('dashboard');
    toast('Dados locais reiniciados.');
  }));
}

function importBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.addEventListener('change', async () => {
    try {
      store.import(await input.files[0].text());
      applyTheme();
      render();
      toast('Backup importado.');
    } catch {
      toast('O arquivo não contém um backup válido.', 'error');
    }
  });
  input.click();
}

function updateChrome(root = routeParts().parts[0]) {
  const computed = stats();
  const user = store.state.user;
  const isEnglish = root === 'english';
  const english = store.state.english;
  document.body.classList.toggle('english-mode', isEnglish);
  document.getElementById('streak-value').textContent = isEnglish ? english.streak : user.streak;
  document.getElementById('xp-value').textContent = `${isEnglish ? english.xp : user.xp} XP`;
  document.getElementById('sidebar-name').textContent = user.name;
  document.getElementById('sidebar-level').textContent = `Nível ${computed.level}`;
  const avatar = document.getElementById('sidebar-avatar');
  avatar.textContent = user.name[0]?.toUpperCase() ?? 'D';
  avatar.style.background = user.avatarColor;
  const reviewCount = document.getElementById('review-count');
  reviewCount.textContent = computed.activeMistakes.length;
  reviewCount.dataset.count = computed.activeMistakes.length;
  const dueCount = document.getElementById('due-count');
  dueCount.textContent = computed.dueCards.length;
  dueCount.dataset.count = computed.dueCards.length;
  const englishPage = routeParts().parts[1] ?? 'dashboard';
  const activeRoot = isEnglish ? `english-${['session', 'result', 'lesson'].includes(englishPage) ? (englishSession?.exitRoute === 'review' ? 'review' : 'learn') : englishPage}` : ({ lesson: 'learn', 'study-session': exerciseSession?.mode === 'review' ? 'review' : exerciseSession?.mode === 'daily' ? 'daily' : 'learn', project: 'projects', exam: 'exams', 'exam-session': 'exams', 'exam-result': 'exams', 'flashcard-session': 'flashcards', coach: 'coach', chat: 'coach', agents: 'coach' })[root] ?? root;
  document.querySelectorAll('[data-nav]').forEach((link) => link.classList.toggle('active', link.dataset.nav === activeRoot));
  document.querySelectorAll('[data-course]').forEach((link) => link.classList.toggle('active', link.dataset.course === (isEnglish ? 'english' : 'java')));
}

function applyTheme() {
  document.body.classList.toggle('dark', store.state.settings.theme === 'dark');
}

function toggleTheme() {
  store.updateSettings({ theme: store.state.settings.theme === 'dark' ? 'light' : 'dark' });
  applyTheme();
}

function openCommandPalette() {
  const root = document.getElementById('command-palette');
  root.hidden = false;
  renderCommandPalette('');
  root.querySelector('input').focus();
}

function renderCommandPalette(query) {
  const root = document.getElementById('command-palette');
  const routes = [
    ['⌂', 'Visão geral', 'Seu painel adaptativo', 'dashboard'], ['◫', 'Trilha Java', '30 lições', 'learn'], ['🇺🇸', 'Inglês do zero', '24 lições do A0 ao A1', 'english'], ['🧠', 'Revisão de inglês', 'Memória adaptativa', 'english/review'], ['✦', 'Missão diária', 'Prática intercalada', 'daily'], ['↻', 'Revisar erros', 'Recuperação ativa', 'review'], ['▤', 'Flashcards', 'Repetição espaçada', 'flashcards'], ['✓', 'Provas', 'Avaliações completas', 'exams'], ['⌘', 'Projetos', 'Prática guiada', 'projects'], ['◎', 'Entrevistas', '50 perguntas', 'interview'], ['</>', 'Playground', 'Executar Java', 'playground'], ['◷', 'Foco', 'Pomodoro', 'focus'], ['✦', 'Coach IA', 'Mentores especializados', 'coach'],
    ...curriculum.lessons.map((lesson) => ['◫', lesson.title, lesson.description, `lesson/${lesson.id}`]),
  ];
  const normalized = query.toLocaleLowerCase('pt-BR');
  const results = routes.filter((item) => !normalized || `${item[1]} ${item[2]}`.toLocaleLowerCase('pt-BR').includes(normalized)).slice(0, 12);
  root.innerHTML = `<div class="command-box"><input class="command-input" id="command-input" value="${escapeHtml(query)}" placeholder="Digite para buscar..."><div class="command-results">${results.map(([icon, title, desc, route]) => `<button class="command-item" data-command-route="${route}" type="button"><span class="quick-icon" style="width:32px;height:32px">${icon}</span><span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(desc)}</small></span><span>↵</span></button>`).join('') || '<p class="muted small" style="padding:12px">Nenhum resultado.</p>'}</div></div>`;
  root.querySelector('#command-input').addEventListener('input', (event) => renderCommandPalette(event.target.value));
}

document.addEventListener('click', async (event) => {
  const routeButton = event.target.closest('[data-route]');
  if (routeButton) go(routeButton.dataset.route);
  if (event.target.closest('[data-locked]')) toast('Conclua a lição anterior para desbloquear esta etapa.', 'error');

  const answer = event.target.closest('[data-answer]');
  if (answer) {
    document.querySelectorAll('[data-answer]').forEach((button) => button.classList.remove('selected'));
    answer.classList.add('selected');
    if (examSession && routeParts().parts[0] === 'exam-session') examSession.answers[examSession.questions[examSession.index].id] = answer.dataset.answer;
    else if (exerciseSession) exerciseSession.answer = answer.dataset.answer;
  }

  const token = event.target.closest('[data-order-token]');
  if (token && exerciseSession) {
    const input = document.getElementById('exercise-answer');
    const values = input.value ? input.value.split(' ').filter(Boolean) : [];
    values.push(token.dataset.orderToken);
    input.value = values.join(' ');
    exerciseSession.answer = input.value;
    token.disabled = true;
  }

  const englishAnswerButton = event.target.closest('[data-english-answer]');
  if (englishAnswerButton && englishSession) {
    document.querySelectorAll('[data-english-answer]').forEach((button) => button.classList.remove('selected'));
    englishAnswerButton.classList.add('selected');
    englishSession.answer = englishAnswerButton.dataset.englishAnswer;
  }

  const englishToken = event.target.closest('[data-english-token]');
  if (englishToken && englishSession) {
    const input = document.getElementById('english-answer');
    const values = input.value ? input.value.split(' ').filter(Boolean) : [];
    values.push(englishToken.dataset.englishToken);
    input.value = values.join(' ');
    englishSession.answer = input.value;
    englishToken.disabled = true;
  }

  const speakButton = event.target.closest('[data-speak]');
  if (speakButton) speakEnglish(speakButton.dataset.speak);

  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'exercise-check') checkExercise();
  if (action === 'exercise-next') nextExercise();
  if (action === 'exercise-hint') giveHint();
  if (action === 'start-daily') {
    const index = seededIndex(dayKey(), curriculum.exercises.length - 5);
    startExerciseSet(curriculum.exercises.slice(index, index + 5), 'daily', 'daily');
  }
  if (action === 'start-review') {
    const exercises = stats().activeMistakes.map((item) => dataAccess.byId(curriculum.exercises, item.exerciseId)).filter(Boolean).slice(0, 10);
    if (exercises.length) startExerciseSet(exercises, 'review', 'review');
  }
  if (action === 'review-one') {
    const exercise = dataAccess.byId(curriculum.exercises, event.target.closest('[data-id]').dataset.id);
    startExerciseSet([exercise], 'review', 'review');
  }
  if (action === 'start-flashcards') startFlashcards();
  if (action === 'flip-card' && flashcardSession) { flashcardSession.revealed = true; render(); }
  const rate = event.target.closest('[data-rate]')?.dataset.rate;
  if (rate) rateFlashcard(rate);
  if (action === 'start-exam') startExam(Number(event.target.closest('[data-id]').dataset.id));
  if (action === 'exam-prev' && examSession) { storeExamAnswer(); examSession.index = Math.max(0, examSession.index - 1); render(); }
  if (action === 'exam-next' && examSession) { storeExamAnswer(); if (examSession.index === examSession.questions.length - 1) finishExam(); else { examSession.index += 1; render(); } }
  if (action === 'finish-exam') finishExam();
  if (action === 'complete-project-step') {
    const button = event.target.closest('[data-project]');
    const total = dataAccess.stepsForProject(Number(button.dataset.project)).length;
    store.updateProject(Number(button.dataset.project), Number(button.dataset.step), total);
    toast('Passo marcado como concluído.');
    const next = Math.min(total, Number(button.dataset.step) + 1);
    go(`project/${button.dataset.project}?step=${next}`);
  }
  if (action === 'toggle-interview') {
    const answerBox = event.target.closest('.interview-card').querySelector('.interview-answer');
    answerBox.hidden = !answerBox.hidden;
    event.target.textContent = answerBox.hidden ? 'Revelar resposta' : 'Ocultar resposta';
  }
  if (action === 'run-code') {
    playgroundCode = document.getElementById('playground-code').value;
    const output = document.getElementById('console-output');
    output.textContent = 'Compilando e executando…';
    const result = await runJava(playgroundCode, document.getElementById('stdin').value);
    output.textContent = result.output;
    output.style.color = result.error ? '#ff9baa' : '#b9f6d9';
    document.getElementById('runner-mode').textContent = result.preview ? 'Prévia local' : 'Java remoto';
  }
  if (action === 'runner-settings') runnerSettingsModal();
  if (action === 'save-playground-snippet') snippetModal({ title: 'Experimento do Playground', code: document.getElementById('playground-code').value, language: 'Java', tags: 'playground' });
  if (action === 'new-snippet') snippetModal();
  if (action === 'edit-snippet') snippetModal(store.state.snippets.find((item) => item.id === event.target.closest('[data-id]').dataset.id));
  if (action === 'copy-snippet') {
    const snippet = store.state.snippets.find((item) => item.id === event.target.closest('[data-id]').dataset.id);
    await copyText(snippet.code); toast('Código copiado.');
  }
  if (action === 'delete-snippet') { store.deleteSnippet(event.target.closest('[data-id]').dataset.id); toast('Snippet excluído.'); render(); }
  if (action === 'timer-toggle') toggleTimer();
  if (action === 'timer-reset') { clearInterval(focusTicker); ensureFocusTimer(focusTimer?.break ?? false); render(); }
  if (action === 'timer-focus') { clearInterval(focusTicker); ensureFocusTimer(false); render(); }
  if (action === 'timer-break') { clearInterval(focusTicker); ensureFocusTimer(true); render(); }
  if (action === 'edit-profile') editProfileModal();
  if (action === 'edit-settings') settingsModal();
  if (action === 'export-data') { downloadFile(`javaflow-backup-${dayKey()}.json`, store.export()); toast('Backup exportado.'); }
  if (action === 'import-data') importBackup();
  if (action === 'reset-data') confirmReset();
  if (action === 'ai-settings') aiSettingsModal();
  if (action === 'english-check') checkEnglishExercise();
  if (action === 'english-next') nextEnglishExercise();
  if (action === 'english-hint' && englishSession) {
    const answer = englishSession.exercises[englishSession.index].correct_answer;
    englishSession.hint = englishSession.hint ? `Começa com “${answer.slice(0, Math.min(3, answer.length))}…”` : 'Fale a ideia em voz alta primeiro e procure as palavras que você já conhece.';
    render();
  }
  if (action === 'english-clear-order' && englishSession) { englishSession.answer = ''; render(); }
  if (action === 'english-pronounce') recognizeEnglish();
  if (action === 'english-daily') {
    const available = englishCurriculum.exercises.filter((item) => item.lesson_id <= Math.max(1, englishStats().nextLesson.id));
    const index = seededIndex(`english-${dayKey()}`, Math.max(1, available.length - 5));
    startEnglishSet(available.slice(index, index + 5), 'daily', 'dashboard');
  }
  if (action === 'english-review') {
    const computedEnglish = englishStats();
    const selected = [...computedEnglish.activeMistakes.map((item) => englishExerciseById(item.exerciseId)), ...computedEnglish.dueCards.map(englishExerciseById)].filter(Boolean);
    const unique = [...new Map(selected.map((item) => [item.id, item])).values()];
    const fallbackLesson = store.state.english.completedLessons.at(-1) ?? 1;
    startEnglishSet((unique.length ? unique : englishLessonExercises(fallbackLesson)).slice(0, 12), 'review', 'review');
  }
  if (action === 'english-repeat' && englishSession) {
    Object.assign(englishSession, { index: 0, correctCount: 0, checked: false, correct: false, answer: '', hint: '', finished: false, xpEarned: 0 });
    go('english/session');
  }

  const filterCategory = event.target.closest('[data-filter-category]');
  if (filterCategory) { interviewFilters.category = filterCategory.dataset.filterCategory; render(); }
  const agent = event.target.closest('[data-agent]')?.dataset.agent;
  if (agent) { chat.agent = agent; chat.messages.push({ role: 'assistant', text: `Modo ${agent} ativado. Envie sua dúvida ou código para começarmos.` }); render(); }

  const commandRoute = event.target.closest('[data-command-route]')?.dataset.commandRoute;
  if (commandRoute) { document.getElementById('command-palette').hidden = true; go(commandRoute); }
  if (event.target === document.getElementById('command-palette')) document.getElementById('command-palette').hidden = true;
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'interview-search') {
    interviewFilters.query = event.target.value;
    clearTimeout(event.target._timer);
    event.target._timer = setTimeout(render, 250);
  }
  if (event.target.id === 'snippet-search') {
    snippetQuery = event.target.value;
    clearTimeout(event.target._timer);
    event.target._timer = setTimeout(render, 250);
  }
  if (event.target.id === 'playground-code') playgroundCode = event.target.value;
  if (event.target.id === 'focus-task' && focusTimer) focusTimer.task = event.target.value;
  if (event.target.id === 'english-answer' && englishSession) englishSession.answer = event.target.value;
});

document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
document.getElementById('search-trigger').addEventListener('click', openCommandPalette);
function closeMobileMenu() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('menu-button').setAttribute('aria-expanded', 'false');
}

document.getElementById('menu-button').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
  document.getElementById('menu-button').setAttribute('aria-expanded', sidebar.classList.contains('open'));
});
document.getElementById('sidebar-close').addEventListener('click', closeMobileMenu);
document.getElementById('sidebar-backdrop').addEventListener('click', closeMobileMenu);

window.addEventListener('hashchange', () => {
  closeMobileMenu();
  render();
});

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') {
    event.preventDefault();
    openCommandPalette();
  }
  if (event.key === 'Escape') {
    closeModal();
    document.getElementById('command-palette').hidden = true;
    closeMobileMenu();
  }
  if (exerciseSession && routeParts().parts[0] === 'study-session' && !exerciseSession.checked && /^[a-d]$/i.test(event.key)) {
    document.querySelectorAll('[data-answer]')[event.key.toLocaleLowerCase().charCodeAt(0) - 97]?.click();
  }
  if (englishSession && routeParts().parts[0] === 'english' && routeParts().parts[1] === 'session' && !englishSession.checked && /^[1-4]$/.test(event.key)) {
    document.querySelectorAll('[data-english-answer]')[Number(event.key) - 1]?.click();
  }
});

store.subscribe(() => updateChrome());

async function boot() {
  await store.ready;
  applyTheme();
  if (!location.hash) location.hash = '#/dashboard';
  render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

boot();
