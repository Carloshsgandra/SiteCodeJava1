import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { curriculum } from '../assets/js/data.js';

const root = resolve(import.meta.dirname, '..');
for (const file of ['index.html', 'assets/css/app.css', 'assets/js/app.js', 'assets/js/views.js', 'assets/js/store.js', 'assets/js/services.js']) {
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

for (const lesson of curriculum.lessons) {
  assert(curriculum.exercises.some((exercise) => exercise.lesson_id === lesson.id), `A lição ${lesson.id} precisa de exercícios.`);
}
for (const exam of curriculum.exams) {
  assert.equal(curriculum.examQuestions.filter((question) => question.exam_id === exam.id).length, 10, `A prova ${exam.id} precisa de 10 questões.`);
}

const index = await readFile(resolve(root, 'index.html'), 'utf8');
assert(!index.includes('th:'), 'A nova interface não pode depender de Thymeleaf.');
assert(index.includes('type="module"'), 'A aplicação deve carregar módulos JavaScript.');

const storeSource = await readFile(resolve(root, 'assets/js/store.js'), 'utf8');
assert(storeSource.includes("localStorage.setItem(STORAGE_KEY"), 'O estado deve ter uma gravação síncrona entre sessões.');
assert(storeSource.includes('indexedDB.open(BACKUP_DB'), 'O estado deve manter uma segunda cópia persistente no IndexedDB.');
assert(storeSource.includes('const ready ='), 'A aplicação deve aguardar a restauração antes de renderizar.');

console.log('Todos os testes de estrutura e conteúdo passaram.');
