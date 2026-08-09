const STORAGE_KEY = 'javaflow-state-v3';
const BACKUP_DB = 'javaflow-persistent-backup';
const BACKUP_STORE = 'snapshots';

const isoDay = (date = new Date()) => date.toISOString().slice(0, 10);

function createDefaultState() {
  return {
    version: 4,
    updatedAt: new Date().toISOString(),
    user: {
      name: 'Dev Java',
      email: '',
      avatarColor: '#7c3aed',
      xp: 0,
      hearts: 5,
      streak: 0,
      lastStudyDay: null,
      weeklyGoal: 300,
      totalAttempted: 0,
      totalCorrect: 0,
      perfectLessons: 0,
      createdAt: new Date().toISOString(),
    },
    completedLessons: [],
    lessonScores: {},
    mistakes: [],
    flashcards: {},
    examAttempts: [],
    projectProgress: {},
    snippets: [],
    focusSessions: [],
    activity: {},
    notes: {},
    daily: {},
    achievements: [],
    english: {
      xp: 0,
      streak: 0,
      lastStudyDay: null,
      totalAttempted: 0,
      totalCorrect: 0,
      completedLessons: [],
      lessonScores: {},
      mistakes: [],
      flashcards: {},
      activity: {},
      daily: {},
    },
    settings: {
      theme: 'light',
      sound: true,
      reducedMotion: false,
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      runnerUrl: '',
      aiUrl: '',
      aiModel: '',
    },
  };
}

function migrate(input) {
  const defaults = createDefaultState();
  if (!input || typeof input !== 'object') return defaults;
  return {
    ...defaults,
    ...input,
    version: 4,
    user: { ...defaults.user, ...(input.user ?? {}) },
    settings: { ...defaults.settings, ...(input.settings ?? {}) },
    completedLessons: Array.isArray(input.completedLessons) ? input.completedLessons : [],
    lessonScores: input.lessonScores ?? {},
    mistakes: Array.isArray(input.mistakes) ? input.mistakes : [],
    flashcards: input.flashcards ?? {},
    examAttempts: Array.isArray(input.examAttempts) ? input.examAttempts : [],
    projectProgress: input.projectProgress ?? {},
    snippets: Array.isArray(input.snippets) ? input.snippets : [],
    focusSessions: Array.isArray(input.focusSessions) ? input.focusSessions : [],
    activity: input.activity ?? {},
    notes: input.notes ?? {},
    daily: input.daily ?? {},
    achievements: Array.isArray(input.achievements) ? input.achievements : [],
    english: {
      ...defaults.english,
      ...(input.english ?? {}),
      completedLessons: Array.isArray(input.english?.completedLessons) ? input.english.completedLessons : [],
      lessonScores: input.english?.lessonScores ?? {},
      mistakes: Array.isArray(input.english?.mistakes) ? input.english.mistakes : [],
      flashcards: input.english?.flashcards ?? {},
      activity: input.english?.activity ?? {},
      daily: input.english?.daily ?? {},
    },
  };
}

function load() {
  try {
    return migrate(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return createDefaultState();
  }
}

const hadLocalState = localStorage.getItem(STORAGE_KEY) !== null;
let state = load();
const listeners = new Set();

function openBackupDatabase() {
  if (!('indexedDB' in globalThis)) return Promise.reject(new Error('IndexedDB indisponível'));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(BACKUP_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(BACKUP_STORE)) request.result.createObjectStore(BACKUP_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readBackup() {
  const database = await openBackupDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(BACKUP_STORE, 'readonly');
    const request = transaction.objectStore(BACKUP_STORE).get(STORAGE_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function writeBackup(snapshot) {
  const database = await openBackupDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(BACKUP_STORE, 'readwrite');
    transaction.objectStore(BACKUP_STORE).put(snapshot, STORAGE_KEY);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

function queueBackup() {
  const snapshot = typeof structuredClone === 'function' ? structuredClone(state) : JSON.parse(JSON.stringify(state));
  writeBackup(snapshot).catch(() => {});
}

const ready = (async () => {
  try {
    const backup = await readBackup();
    const backupIsNewer = backup?.updatedAt && (!state.updatedAt || new Date(backup.updatedAt) > new Date(state.updatedAt));
    if (backup && (!hadLocalState || backupIsNewer)) {
      state = migrate(backup);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      await writeBackup(state);
    }
  } catch {
    // O localStorage continua sendo a cópia síncrona quando IndexedDB não está disponível.
  }
})();

function persist() {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  queueBackup();
  listeners.forEach((listener) => listener(state));
}

function addActivity(type, amount = 1, metadata = {}) {
  const day = isoDay();
  state.activity[day] ??= { xp: 0, exercises: 0, minutes: 0, lessons: 0, events: [] };
  const current = state.activity[day];
  if (type === 'xp') current.xp += amount;
  if (type === 'exercise') current.exercises += amount;
  if (type === 'focus') current.minutes += amount;
  if (type === 'lesson') current.lessons += amount;
  current.events.push({ type, amount, at: new Date().toISOString(), ...metadata });
  current.events = current.events.slice(-30);
}

function touchStudy() {
  const today = isoDay();
  const last = state.user.lastStudyDay;
  if (last === today) return;

  if (!last) {
    state.user.streak = 1;
  } else {
    const difference = Math.round((new Date(`${today}T12:00:00`) - new Date(`${last}T12:00:00`)) / 86400000);
    state.user.streak = difference === 1 ? state.user.streak + 1 : 1;
  }
  state.user.lastStudyDay = today;
}

function touchEnglish() {
  const today = isoDay();
  const english = state.english;
  if (english.lastStudyDay === today) return;
  if (!english.lastStudyDay) english.streak = 1;
  else {
    const difference = Math.round((new Date(`${today}T12:00:00`) - new Date(`${english.lastStudyDay}T12:00:00`)) / 86400000);
    english.streak = difference === 1 ? english.streak + 1 : 1;
  }
  english.lastStudyDay = today;
}

function addEnglishActivity(type, metadata = {}) {
  const today = isoDay();
  state.english.activity[today] ??= { xp: 0, exercises: 0, lessons: 0, events: [] };
  const current = state.english.activity[today];
  if (type === 'exercise') current.exercises += 1;
  if (type === 'lesson') current.lessons += 1;
  if (type === 'xp') current.xp += Number(metadata.amount) || 0;
  current.events.push({ type, at: new Date().toISOString(), ...metadata });
  current.events = current.events.slice(-40);
}

function checkAchievements() {
  const candidates = [
    ['first-step', state.completedLessons.length >= 1],
    ['streak-3', state.user.streak >= 3],
    ['streak-7', state.user.streak >= 7],
    ['xp-100', state.user.xp >= 100],
    ['xp-500', state.user.xp >= 500],
    ['focus-60', state.focusSessions.reduce((sum, item) => sum + item.minutes, 0) >= 60],
    ['mistake-slayer', state.mistakes.filter((item) => item.mastered).length >= 10],
    ['exam-pass', state.examAttempts.some((item) => item.passed)],
    ['builder', Object.values(state.projectProgress).some((item) => item.completed)],
  ];
  candidates.forEach(([key, earned]) => {
    if (earned && !state.achievements.includes(key)) state.achievements.push(key);
  });
}

export const store = {
  ready,

  get state() {
    return state;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  update(mutator) {
    mutator(state);
    checkAchievements();
    persist();
  },

  updateProfile(profile) {
    state.user = { ...state.user, ...profile };
    persist();
  },

  updateSettings(settings) {
    state.settings = { ...state.settings, ...settings };
    persist();
  },

  awardXp(amount, metadata = {}) {
    const safeAmount = Math.max(0, Number(amount) || 0);
    state.user.xp += safeAmount;
    touchStudy();
    addActivity('xp', safeAmount, metadata);
    checkAchievements();
    persist();
  },

  recordAnswer(exerciseId, correct, answer, lessonId, xpReward = 0) {
    touchStudy();
    state.user.totalAttempted += 1;
    if (correct) state.user.totalCorrect += 1;
    addActivity('exercise', 1, { exerciseId, correct, lessonId });

    const existingIndex = state.mistakes.findIndex((item) => item.exerciseId === exerciseId);
    if (correct && existingIndex >= 0) {
      const mistake = state.mistakes[existingIndex];
      mistake.correctReviews = (mistake.correctReviews ?? 0) + 1;
      mistake.mastered = mistake.correctReviews >= 2;
      mistake.lastReviewedAt = new Date().toISOString();
    } else if (!correct) {
      const mistake = {
        exerciseId,
        lessonId,
        answer,
        attempts: existingIndex >= 0 ? state.mistakes[existingIndex].attempts + 1 : 1,
        correctReviews: 0,
        mastered: false,
        lastWrongAt: new Date().toISOString(),
      };
      if (existingIndex >= 0) state.mistakes[existingIndex] = mistake;
      else state.mistakes.push(mistake);
    }

    if (correct && xpReward) {
      state.user.xp += xpReward;
      addActivity('xp', xpReward, { exerciseId, lessonId });
    }
    checkAchievements();
    persist();
  },

  completeLesson(lessonId, score, xpReward) {
    const firstCompletion = !state.completedLessons.includes(lessonId);
    if (firstCompletion) {
      state.completedLessons.push(lessonId);
      state.user.xp += xpReward;
      addActivity('xp', xpReward, { lessonId });
      addActivity('lesson', 1, { lessonId });
    }
    state.lessonScores[lessonId] = Math.max(state.lessonScores[lessonId] ?? 0, score);
    if (score === 100) state.user.perfectLessons += firstCompletion ? 1 : 0;
    touchStudy();
    checkAchievements();
    persist();
    return firstCompletion;
  },

  recordEnglishAnswer(exerciseId, correct, answer, lessonId, xpReward = 0) {
    const english = state.english;
    touchEnglish();
    english.totalAttempted += 1;
    if (correct) english.totalCorrect += 1;
    addEnglishActivity('exercise', { exerciseId, correct, lessonId });
    const index = english.mistakes.findIndex((item) => item.exerciseId === exerciseId);
    if (correct && index >= 0) {
      const mistake = english.mistakes[index];
      mistake.correctReviews = (mistake.correctReviews ?? 0) + 1;
      mistake.mastered = mistake.correctReviews >= 2;
      mistake.lastReviewedAt = new Date().toISOString();
    } else if (!correct) {
      const mistake = { exerciseId, lessonId, answer, attempts: index >= 0 ? english.mistakes[index].attempts + 1 : 1, correctReviews: 0, mastered: false, lastWrongAt: new Date().toISOString() };
      if (index >= 0) english.mistakes[index] = mistake;
      else english.mistakes.push(mistake);
    }
    if (correct && xpReward) {
      english.xp += xpReward;
      addEnglishActivity('xp', { amount: xpReward, exerciseId, lessonId });
    }
    if (!english.flashcards[exerciseId]) {
      const due = new Date();
      if (correct) due.setDate(due.getDate() + 1);
      english.flashcards[exerciseId] = { interval: correct ? 1 : 0, ease: 2.5, repetitions: correct ? 1 : 0, due: due.toISOString(), lastRating: correct ? 'good' : 'again', reviewedAt: new Date().toISOString() };
    }
    persist();
  },

  completeEnglishLesson(lessonId, score, xpReward) {
    const english = state.english;
    const firstCompletion = !english.completedLessons.includes(lessonId);
    if (firstCompletion) {
      english.completedLessons.push(lessonId);
      english.xp += xpReward;
      addEnglishActivity('xp', { amount: xpReward, lessonId });
      addEnglishActivity('lesson', { lessonId });
    }
    english.lessonScores[lessonId] = Math.max(english.lessonScores[lessonId] ?? 0, score);
    touchEnglish();
    persist();
    return firstCompletion;
  },

  rateEnglishCard(exerciseId, rating = 'good') {
    const english = state.english;
    const current = english.flashcards[exerciseId] ?? { interval: 0, ease: 2.5, repetitions: 0 };
    let ease = current.ease;
    let repetitions = current.repetitions;
    let interval = 1;
    if (rating === 'again') {
      interval = 0;
      repetitions = 0;
      ease = Math.max(1.3, ease - 0.2);
    } else {
      repetitions += 1;
      if (rating === 'hard') ease = Math.max(1.3, ease - 0.15);
      if (rating === 'easy') ease += 0.15;
      const multiplier = rating === 'hard' ? 1.2 : rating === 'easy' ? 1.6 : 1;
      interval = repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.max(1, Math.round((current.interval || 3) * ease * multiplier));
    }
    const due = new Date();
    due.setDate(due.getDate() + interval);
    english.flashcards[exerciseId] = { interval, ease, repetitions, due: due.toISOString(), lastRating: rating, reviewedAt: new Date().toISOString() };
    touchEnglish();
    persist();
  },

  rateFlashcard(exerciseId, rating) {
    const current = state.flashcards[exerciseId] ?? { interval: 0, ease: 2.5, repetitions: 0 };
    let interval;
    let ease = current.ease;
    let repetitions = current.repetitions;

    if (rating === 'again') {
      interval = 0;
      repetitions = 0;
      ease = Math.max(1.3, ease - 0.2);
    } else {
      repetitions += 1;
      if (rating === 'hard') ease = Math.max(1.3, ease - 0.15);
      if (rating === 'easy') ease += 0.15;
      const multiplier = rating === 'hard' ? 1.2 : rating === 'easy' ? 1.6 : 1;
      interval = repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.max(1, Math.round((current.interval || 3) * ease * multiplier));
    }

    const due = new Date();
    due.setDate(due.getDate() + interval);
    state.flashcards[exerciseId] = {
      interval,
      ease,
      repetitions,
      due: due.toISOString(),
      lastRating: rating,
      reviewedAt: new Date().toISOString(),
    };
    touchStudy();
    persist();
  },

  saveSnippet(snippet) {
    const entry = {
      id: snippet.id || crypto.randomUUID(),
      title: snippet.title.trim(),
      description: snippet.description?.trim() ?? '',
      code: snippet.code,
      language: snippet.language || 'Java',
      tags: snippet.tags?.trim() ?? '',
      updatedAt: new Date().toISOString(),
    };
    const index = state.snippets.findIndex((item) => item.id === entry.id);
    if (index >= 0) state.snippets[index] = entry;
    else state.snippets.unshift(entry);
    persist();
    return entry;
  },

  deleteSnippet(id) {
    state.snippets = state.snippets.filter((item) => item.id !== id);
    persist();
  },

  recordFocus(minutes, task) {
    state.focusSessions.unshift({ id: crypto.randomUUID(), minutes, task, at: new Date().toISOString() });
    state.focusSessions = state.focusSessions.slice(0, 300);
    addActivity('focus', minutes, { task });
    touchStudy();
    checkAchievements();
    persist();
  },

  saveExamAttempt(attempt) {
    state.examAttempts.unshift({ ...attempt, id: crypto.randomUUID(), at: new Date().toISOString() });
    state.user.xp += attempt.passed ? 100 : 20;
    addActivity('xp', attempt.passed ? 100 : 20, { examId: attempt.examId });
    touchStudy();
    checkAchievements();
    persist();
  },

  updateProject(projectId, step, totalSteps) {
    const current = state.projectProgress[projectId] ?? { currentStep: 1, completedSteps: [] };
    if (!current.completedSteps.includes(step)) current.completedSteps.push(step);
    current.currentStep = Math.min(totalSteps, Math.max(current.currentStep, step + 1));
    current.completed = current.completedSteps.length >= totalSteps;
    current.updatedAt = new Date().toISOString();
    state.projectProgress[projectId] = current;
    touchStudy();
    persist();
  },

  export() {
    return JSON.stringify(state, null, 2);
  },

  import(json) {
    state = migrate(JSON.parse(json));
    persist();
  },

  reset() {
    state = createDefaultState();
    persist();
  },
};

export { isoDay };
