import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { curriculum } from '../assets/js/data.js';

const memoryStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => memoryStorage.get(key) ?? null,
  setItem: (key, value) => memoryStorage.set(key, String(value)),
  removeItem: (key) => memoryStorage.delete(key),
  clear: () => memoryStorage.clear(),
};
const { englishCurriculum } = await import('../assets/js/english.js');

const root = resolve(import.meta.dirname, '..');
for (const file of ['index.html', 'assets/css/app.css', 'assets/js/app.js', 'assets/js/english.js', 'assets/js/views.js', 'assets/js/store.js', 'assets/js/services.js']) {
  await access(resolve(root, file));
}

assert.equal(curriculum.modules.length, 10, 'Os dez módulos devem ser preservados.');
assert.equal(curriculum.lessons.length, 30, 'As trinta lições devem ser preservadas.');
assert.equal(curriculum.exercises.length, 78, 'Todos os exercícios devem ser preservados.');
assert.equal(curriculum.exams.length, 5, 'As cinco provas devem ser preservadas.');
assert.equal(curriculum.examQuestions.length, 50, 'As questões de prova devem ser preservadas.');
assert.equal(curriculum.projects.length, 5, 'Os projetos devem ser preservados.');
assert.equal(curriculum.projectSteps.length, 22, 'Os passos de projeto devem ser preservados.');
assert.equal(curriculum.interviewQuestions.length, 50, 'As perguntas de entrevista devem ser preservadas.');
assert.equal(englishCurriculum.modules.length, 8, 'O curso de inglês deve conter oito unidades progressivas.');
assert.equal(englishCurriculum.lessons.length, 24, 'O curso de inglês deve conter 24 lições do nível A0 ao A1.');
assert.equal(englishCurriculum.exercises.length, 120, 'Cada lição de inglês deve oferecer cinco práticas ativas.');

for (const lesson of curriculum.lessons) {
  assert(curriculum.exercises.some((exercise) => exercise.lesson_id === lesson.id), `A lição ${lesson.id} precisa de exercícios.`);
}
for (const exam of curriculum.exams) {
  assert.equal(curriculum.examQuestions.filter((question) => question.exam_id === exam.id).length, 10, `A prova ${exam.id} precisa de 10 questões.`);
}
for (const lesson of englishCurriculum.lessons) {
  assert.equal(englishCurriculum.exercises.filter((exercise) => exercise.lesson_id === lesson.id).length, 5, `A lição de inglês ${lesson.id} precisa de 5 práticas.`);
}

const index = await readFile(resolve(root, 'index.html'), 'utf8');
assert(!index.includes('th:'), 'A nova interface não pode depender de Thymeleaf.');
assert(index.includes('type="module"'), 'A aplicação deve carregar módulos JavaScript.');

const storeSource = await readFile(resolve(root, 'assets/js/store.js'), 'utf8');
assert(storeSource.includes("localStorage.setItem(STORAGE_KEY"), 'O estado deve ter uma gravação síncrona entre sessões.');
assert(storeSource.includes('indexedDB.open(BACKUP_DB'), 'O estado deve manter uma segunda cópia persistente no IndexedDB.');
assert(storeSource.includes('const ready ='), 'A aplicação deve aguardar a restauração antes de renderizar.');
assert(storeSource.includes('recordEnglishAnswer'), 'O progresso do inglês deve ser persistido independentemente.');

console.log('Todos os testes de estrutura e conteúdo passaram.');
