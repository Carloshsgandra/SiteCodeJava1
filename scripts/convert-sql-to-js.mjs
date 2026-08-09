import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function findStatementEnd(source, start) {
  let quoted = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (char === "'" && quoted && next === "'") {
      index += 1;
      continue;
    }
    if (char === "'") quoted = !quoted;
    if (char === ';' && !quoted) return index;
  }
  return source.length;
}

function splitSqlValues(tuple) {
  const values = [];
  let quoted = false;
  let current = '';

  for (let index = 0; index < tuple.length; index += 1) {
    const char = tuple[index];
    const next = tuple[index + 1];
    if (char === "'" && quoted && next === "'") {
      current += "''";
      index += 1;
      continue;
    }
    if (char === "'") quoted = !quoted;
    if (char === ',' && !quoted) {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  return values;
}

function extractTuples(valuesBlock) {
  const tuples = [];
  let quoted = false;
  let depth = 0;
  let start = -1;

  for (let index = 0; index < valuesBlock.length; index += 1) {
    const char = valuesBlock[index];
    const next = valuesBlock[index + 1];
    if (char === "'" && quoted && next === "'") {
      index += 1;
      continue;
    }
    if (char === "'") quoted = !quoted;
    if (quoted) continue;
    if (char === '(') {
      if (depth === 0) start = index + 1;
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
      if (depth === 0 && start >= 0) tuples.push(valuesBlock.slice(start, index));
    }
  }
  return tuples;
}

function parseSqlValue(raw) {
  const value = raw.trim();
  if (/^null$/i.test(value)) return null;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith("'") && value.endsWith("'")) {
    return value
      .slice(1, -1)
      .replaceAll("''", "'")
      .replaceAll('\\n', '\n')
      .replaceAll('\\t', '\t');
  }
  return value;
}

function parseSql(source) {
  const withoutCommentLines = source
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith('--'))
    .join('\n');

  const tables = {};
  const insertPattern = /INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES/gi;
  let match;

  while ((match = insertPattern.exec(withoutCommentLines)) !== null) {
    const [, table, columnsBlock] = match;
    const end = findStatementEnd(withoutCommentLines, insertPattern.lastIndex);
    const valuesBlock = withoutCommentLines.slice(insertPattern.lastIndex, end);
    const columns = columnsBlock.split(',').map((column) => column.trim());
    const rows = extractTuples(valuesBlock).map((tuple) => {
      const values = splitSqlValues(tuple).map(parseSqlValue);
      return Object.fromEntries(columns.map((column, index) => [column, values[index]]));
    });
    tables[table] ??= [];
    tables[table].push(...rows);
    insertPattern.lastIndex = end + 1;
  }

  return tables;
}

function normalize(tables) {
  tables.exercises?.forEach((exercise, index) => {
    exercise.id = index + 1;
    exercise.options = JSON.parse(exercise.options_json || '[]');
    delete exercise.options_json;
  });

  tables.exam_questions?.forEach((question) => {
    question.options = JSON.parse(question.options_json || '[]');
    delete question.options_json;
  });

  return {
    modules: tables.modules ?? [],
    lessons: tables.lessons ?? [],
    exercises: tables.exercises ?? [],
    exams: tables.exams ?? [],
    examQuestions: tables.exam_questions ?? [],
    projects: tables.guided_projects ?? [],
    projectSteps: tables.project_steps ?? [],
    interviewQuestions: tables.interview_questions ?? [],
  };
}

const [courseSql, careerSql] = await Promise.all([
  readFile(resolve(root, 'src/main/resources/data.sql'), 'utf8'),
  readFile(resolve(root, 'src/main/resources/career_data.sql'), 'utf8'),
]);

const combined = {};
for (const source of [courseSql, careerSql]) {
  const parsed = parseSql(source);
  for (const [table, rows] of Object.entries(parsed)) {
    combined[table] ??= [];
    combined[table].push(...rows);
  }
}

const curriculum = normalize(combined);
const output = `// Gerado automaticamente a partir do conteúdo pedagógico original.\nexport const curriculum = ${JSON.stringify(curriculum, null, 2)};\n`;

await mkdir(resolve(root, 'assets/js'), { recursive: true });
await writeFile(resolve(root, 'assets/js/data.js'), output, 'utf8');

const counts = Object.fromEntries(Object.entries(curriculum).map(([key, rows]) => [key, rows.length]));
console.log(JSON.stringify(counts));
