import { store } from './store.js';
import { escapeHtml, percent } from './utils.js';

const modules = [
  { id: 1, title: 'Primeiros passos', icon: '👋', color: '#1687e8', description: 'Cumprimentos, respostas essenciais e palavras de sobrevivência.' },
  { id: 2, title: 'Quem sou eu', icon: '🙂', color: '#7c5cff', description: 'Apresentar-se, falar de origem, idade e preferências.' },
  { id: 3, title: 'Casa e família', icon: '🏠', color: '#16a66a', description: 'Pessoas, objetos cotidianos e frases com this, that e my.' },
  { id: 4, title: 'Minha rotina', icon: '⏰', color: '#ed8b20', description: 'Ações do dia, horários e presente simples em contexto.' },
  { id: 5, title: 'Comida e compras', icon: '🥪', color: '#e34f65', description: 'Pedir comida, entender preços e comprar com segurança.' },
  { id: 6, title: 'Cidade e direção', icon: '🗺️', color: '#1687e8', description: 'Locais, transporte, direções e pedidos de ajuda.' },
  { id: 7, title: 'Estudo e trabalho', icon: '💼', color: '#7c5cff', description: 'Tarefas, habilidades e comunicação básica profissional.' },
  { id: 8, title: 'Conversação A1', icon: '💬', color: '#16a66a', description: 'Conversas reais curtas para consolidar todo o nível iniciante.' },
];

const rawLessons = [
  [1, 'Hello!', 'Cumprimente alguém', [['hello','olá'],['hi','oi'],['goodbye','tchau'],['please','por favor']], ['Hello, how are you?','Olá, como você está?'], ['Hi! Nice to meet you.','Hello! Nice to meet you.']],
  [1, 'Sim e não', 'Responda com clareza', [['yes','sim'],['no','não'],['maybe','talvez'],['okay','tudo bem']], ['Yes, please.','Sim, por favor.'], ['Would you like water?','Yes, please.']],
  [1, 'Obrigado', 'Seja gentil em qualquer situação', [['thanks','obrigado'],['sorry','desculpe'],['welcome','bem-vindo'],['excuse me','com licença']], ['Thank you very much.','Muito obrigado.'], ['Thank you for your help.','You are welcome.']],
  [2, 'Meu nome', 'Apresente-se', [['name','nome'],['my','meu/minha'],['your','seu/sua'],['friend','amigo']], ['My name is Ana.','Meu nome é Ana.'], ['What is your name?','My name is Leo.']],
  [2, 'De onde você é?', 'Fale de origem', [['from','de'],['Brazil','Brasil'],['city','cidade'],['country','país']], ['I am from Brazil.','Eu sou do Brasil.'], ['Where are you from?','I am from Brazil.']],
  [2, 'Idade e números', 'Use números em frases', [['one','um'],['ten','dez'],['twenty','vinte'],['years old','anos de idade']], ['I am twenty years old.','Eu tenho vinte anos.'], ['How old are you?','I am twenty years old.']],
  [2, 'Gostos', 'Diga do que gosta', [['like','gostar'],['love','amar'],['music','música'],['books','livros']], ['I like music.','Eu gosto de música.'], ['Do you like books?','Yes, I love books.']],
  [3, 'Minha família', 'Apresente pessoas próximas', [['mother','mãe'],['father','pai'],['sister','irmã'],['brother','irmão']], ['This is my sister.','Esta é minha irmã.'], ['Who is she?','She is my sister.']],
  [3, 'Em casa', 'Nomeie os cômodos', [['house','casa'],['room','quarto'],['kitchen','cozinha'],['bathroom','banheiro']], ['The kitchen is small.','A cozinha é pequena.'], ['Where is the bathroom?','It is over there.']],
  [3, 'Objetos comuns', 'Encontre o que precisa', [['table','mesa'],['chair','cadeira'],['door','porta'],['key','chave']], ['The key is on the table.','A chave está sobre a mesa.'], ['Where is the key?','It is on the table.']],
  [4, 'Começar o dia', 'Fale da manhã', [['wake up','acordar'],['breakfast','café da manhã'],['morning','manhã'],['shower','banho']], ['I wake up in the morning.','Eu acordo de manhã.'], ['What do you do first?','I take a shower.']],
  [4, 'Ações diárias', 'Descreva sua rotina', [['work','trabalhar'],['study','estudar'],['read','ler'],['sleep','dormir']], ['I study English every day.','Eu estudo inglês todos os dias.'], ['Do you study at night?','Yes, I study at night.']],
  [4, 'Horas e dias', 'Combine ações e horários', [['today','hoje'],['tomorrow','amanhã'],['hour','hora'],['night','noite']], ['I work today.','Eu trabalho hoje.'], ['Do you work tomorrow?','No, I work today.']],
  [5, 'Comidas básicas', 'Fale do que come', [['bread','pão'],['rice','arroz'],['fruit','fruta'],['water','água']], ['I would like water.','Eu gostaria de água.'], ['What would you like?','I would like water.']],
  [5, 'No restaurante', 'Faça um pedido simples', [['menu','cardápio'],['coffee','café'],['bill','conta'],['hungry','com fome']], ['Can I have the menu, please?','Pode me trazer o cardápio, por favor?'], ['Are you ready to order?','Yes, I would like coffee.']],
  [5, 'Quanto custa?', 'Pergunte preços', [['price','preço'],['money','dinheiro'],['cheap','barato'],['expensive','caro']], ['How much is this?','Quanto custa isto?'], ['It is ten dollars.','Okay, that is cheap.']],
  [6, 'Lugares da cidade', 'Localize serviços', [['school','escola'],['market','mercado'],['hospital','hospital'],['station','estação']], ['The station is near the market.','A estação fica perto do mercado.'], ['Where is the station?','It is near the market.']],
  [6, 'Direções', 'Entenda o caminho', [['left','esquerda'],['right','direita'],['straight','reto'],['near','perto']], ['Turn left and go straight.','Vire à esquerda e siga reto.'], ['Is the bank near?','Yes, go straight.']],
  [6, 'Transporte', 'Desloque-se pela cidade', [['bus','ônibus'],['train','trem'],['car','carro'],['ticket','passagem']], ['I need a bus ticket.','Eu preciso de uma passagem de ônibus.'], ['One ticket, please.','Here is your ticket.']],
  [7, 'Na escola', 'Comunique necessidades de estudo', [['teacher','professor'],['student','aluno'],['question','pergunta'],['answer','resposta']], ['I have a question.','Eu tenho uma pergunta.'], ['Do you know the answer?','No, I have a question.']],
  [7, 'No trabalho', 'Fale de tarefas', [['job','trabalho'],['meeting','reunião'],['email','e-mail'],['computer','computador']], ['I have a meeting today.','Eu tenho uma reunião hoje.'], ['Did you send the email?','Yes, before the meeting.']],
  [7, 'Habilidades', 'Diga o que consegue fazer', [['can','poder/conseguir'],['speak','falar'],['write','escrever'],['understand','entender']], ['I can understand English.','Eu consigo entender inglês.'], ['Can you speak English?','Yes, a little.']],
  [8, 'Pedindo ajuda', 'Resolva pequenos problemas', [['help','ajuda'],['need','precisar'],['repeat','repetir'],['slowly','devagar']], ['Can you repeat slowly, please?','Pode repetir devagar, por favor?'], ['Do you need help?','Yes, please repeat slowly.']],
  [8, 'Conversa completa', 'Una tudo em uma interação real', [['nice','legal/agradável'],['meet','conhecer'],['again','novamente'],['see you','até mais']], ['It was nice to meet you.','Foi um prazer conhecer você.'], ['It was nice to meet you.','Nice to meet you too. See you!']],
];

const lessons = rawLessons.map(([moduleId, title, description, words, phrase, dialogue], index) => ({
  id: index + 1, module_id: moduleId, title, description,
  words: words.map(([en, pt]) => ({ en, pt })), phrase: { en: phrase[0], pt: phrase[1] }, dialogue: { prompt: dialogue[0], answer: dialogue[1] }, xp_reward: 40,
}));

function alternatives(answer, pool, offset) {
  const filtered = [...new Set(pool.filter((value) => value !== answer))];
  return [answer, ...filtered.slice(offset % Math.max(1, filtered.length), offset % Math.max(1, filtered.length) + 3), ...filtered.slice(0, 3)].slice(0, 4);
}

const exercises = lessons.flatMap((lesson) => {
  const moduleWords = lessons.filter((item) => item.module_id === lesson.module_id).flatMap((item) => item.words);
  const word = lesson.words[0];
  const second = lesson.words[1];
  const englishPool = moduleWords.map((item) => item.en);
  const portuguesePool = moduleWords.map((item) => item.pt);
  const prefix = `en-${lesson.id}`;
  return [
    { id: `${prefix}-meaning`, lesson_id: lesson.id, type: 'choice', skill: 'Vocabulário', prompt: `O que significa “${word.en}”?`, correct_answer: word.pt, options: alternatives(word.pt, portuguesePool, lesson.id), explanation: `“${word.en}” significa “${word.pt}”.`, xp_reward: 8 },
    { id: `${prefix}-recall`, lesson_id: lesson.id, type: 'input', skill: 'Recuperação ativa', prompt: `Sem olhar as opções, escreva em inglês: “${second.pt}”`, correct_answer: second.en, explanation: `A forma esperada é “${second.en}”. Tentar lembrar antes de ver a resposta fortalece a memória.`, xp_reward: 10 },
    { id: `${prefix}-listen`, lesson_id: lesson.id, type: 'listen', skill: 'Compreensão oral', prompt: 'Ouça e escolha a frase que foi dita.', speak: lesson.phrase.en, correct_answer: lesson.phrase.en, options: alternatives(lesson.phrase.en, lessons.filter((item) => item.module_id === lesson.module_id).map((item) => item.phrase.en), lesson.id), explanation: `Você ouviu “${lesson.phrase.en}”, que significa “${lesson.phrase.pt}”.`, xp_reward: 10 },
    { id: `${prefix}-order`, lesson_id: lesson.id, type: 'order', skill: 'Construção de frase', prompt: `Monte em inglês: “${lesson.phrase.pt}”`, correct_answer: lesson.phrase.en, tokens: lesson.phrase.en.replace(/[?.!,]/g, '').split(' ').sort(() => 0.5 - ((lesson.id % 3) / 3)), explanation: `Ordem natural: “${lesson.phrase.en}”.`, xp_reward: 12 },
    { id: `${prefix}-dialogue`, lesson_id: lesson.id, type: 'choice', skill: 'Conversação', prompt: `Complete o diálogo:\n— ${lesson.dialogue.prompt}\n— …`, correct_answer: lesson.dialogue.answer, options: alternatives(lesson.dialogue.answer, lessons.filter((item) => item.module_id === lesson.module_id).map((item) => item.dialogue.answer), lesson.id + 1), explanation: `A resposta mais natural neste contexto é “${lesson.dialogue.answer}”.`, xp_reward: 10 },
  ];
});

export const englishCurriculum = { modules, lessons, exercises };

export function englishStats() {
  const state = store.state.english;
  const now = Date.now();
  const dueCards = Object.entries(state.flashcards).filter(([, card]) => !card.due || new Date(card.due).getTime() <= now).map(([id]) => id);
  const activeMistakes = state.mistakes.filter((item) => !item.mastered);
  const learnedWords = new Set(lessons.filter((lesson) => state.completedLessons.includes(lesson.id)).flatMap((lesson) => lesson.words.map((word) => word.en)));
  const nextLesson = lessons.find((lesson) => !state.completedLessons.includes(lesson.id)) ?? lessons.at(-1);
  return { dueCards, activeMistakes, learnedWords: learnedWords.size, nextLesson, progress: percent(state.completedLessons.length, lessons.length), level: state.completedLessons.length === lessons.length ? 'A1 concluído' : state.completedLessons.length >= 16 ? 'A1' : state.completedLessons.length >= 8 ? 'Pré-A1' : 'A0' };
}

export function englishDashboardView() {
  const state = store.state.english;
  const stats = englishStats();
  const dailyDone = state.daily[new Date().toISOString().slice(0, 10)]?.completed;
  return `<section class="page english-page">
    <div class="english-hero">
      <div><span class="eyebrow">ENGLISHFLOW · DO ZERO AO A1</span><h1>Aprenda inglês para <em>usar de verdade.</em></h1><p>Uma trilha curta e progressiva com recuperação ativa, áudio, construção de frases, conversas contextualizadas e revisão espaçada.</p><div class="hero-actions"><a class="button button-primary" href="#/english/lesson/${stats.nextLesson.id}">${state.completedLessons.length ? 'Continuar trilha' : 'Começar do zero'} →</a><a class="button button-ghost-on-dark" href="#/english/learn">Ver caminho completo</a></div></div>
      <div class="english-level"><span>${stats.level}</span><strong>${stats.progress}%</strong><small>${stats.learnedWords} palavras estudadas</small><div class="progress"><i style="width:${stats.progress}%"></i></div></div>
    </div>
    <div class="grid grid-4 metrics-mobile english-metrics">
      <div class="metric card"><span>⚡</span><div><strong>${state.xp}</strong><small>XP de inglês</small></div></div>
      <div class="metric card"><span>🔥</span><div><strong>${state.streak}</strong><small>dias seguidos</small></div></div>
      <div class="metric card"><span>🧠</span><div><strong>${stats.dueCards.length}</strong><small>revisões vencidas</small></div></div>
      <div class="metric card"><span>🎯</span><div><strong>${stats.progress}%</strong><small>do nível A1</small></div></div>
    </div>
    <div class="layout-main">
      <div class="stack">
        <div class="card card-pad english-next"><div class="card-head"><div><span class="eyebrow">PRÓXIMO PASSO</span><h2>${escapeHtml(stats.nextLesson.title)}</h2><p>${escapeHtml(stats.nextLesson.description)}</p></div><span class="lesson-bubble">${modules.find((item) => item.id === stats.nextLesson.module_id).icon}</span></div><div class="method-strip"><span>👂 Ouvir</span><span>🧩 Montar</span><span>💬 Responder</span><span>🧠 Recordar</span></div><a class="button button-primary button-block" href="#/english/lesson/${stats.nextLesson.id}">Estudar por 8 minutos</a></div>
        <div class="card card-pad"><div class="card-head"><div><h2>Plano de hoje</h2><p>Conteúdo novo + prática intercalada para lembrar por mais tempo.</p></div></div><div class="english-plan"><div class="${dailyDone ? 'done' : ''}"><b>1</b><span><strong>Missão rápida</strong><small>5 questões misturadas</small></span><button class="button button-sm" data-action="english-daily" type="button">${dailyDone ? 'Refazer' : 'Começar'}</button></div><div><b>2</b><span><strong>Revisão espaçada</strong><small>${stats.dueCards.length || stats.activeMistakes.length} itens para recuperar</small></span><a class="button button-sm button-ghost" href="#/english/review">Revisar</a></div></div></div>
      </div>
      <aside class="stack"><div class="card card-pad"><div class="card-head"><div><h3>Por que funciona</h3><p>Você pratica o idioma, não apenas lê regras.</p></div></div><div class="method-list"><div><span>①</span><p><strong>Lembrar antes de olhar</strong><small>Fortalece a recuperação da memória.</small></p></div><div><span>②</span><p><strong>Frases compreensíveis</strong><small>Vocabulário sempre dentro de contexto.</small></p></div><div><span>③</span><p><strong>Revisar na hora certa</strong><small>Intervalos adaptados à sua dificuldade.</small></p></div><div><span>④</span><p><strong>Ouvir e produzir</strong><small>Áudio, fala e diálogos desde a primeira aula.</small></p></div></div></div></aside>
    </div>
  </section>`;
}

export function englishLearnView() {
  const state = store.state.english;
  return `<section class="page english-page"><div class="page-head"><div><span class="eyebrow">CAMINHO A0 → A1</span><h1>Inglês do zero</h1><p>24 lições práticas, organizadas para introduzir pouco conteúdo e reutilizá-lo em diferentes situações.</p></div><a class="button button-ghost" href="#/english">Painel de inglês</a></div><div class="module-list">${modules.map((module) => {
    const moduleLessons = lessons.filter((lesson) => lesson.module_id === module.id);
    const completed = moduleLessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length;
    return `<article class="module-card card"><header class="module-head" style="--module-color:${module.color}"><div class="module-icon">${module.icon}</div><div><small>UNIDADE ${module.id}</small><h2>${escapeHtml(module.title)}</h2><p>${escapeHtml(module.description)}</p></div><div class="module-progress"><strong>${completed}/${moduleLessons.length}</strong><div class="progress"><i style="width:${percent(completed,moduleLessons.length)}%"></i></div></div></header><div class="lesson-list">${moduleLessons.map((lesson) => {
      const done = state.completedLessons.includes(lesson.id);
      const previousDone = lesson.id === 1 || state.completedLessons.includes(lesson.id - 1);
      return `<${previousDone ? 'a' : 'div'} ${previousDone ? `href="#/english/lesson/${lesson.id}"` : ''} class="lesson-row ${done ? 'completed' : ''} ${previousDone ? '' : 'locked'}"><span class="lesson-node">${done ? '✓' : lesson.id}</span><span><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.description)} · 5 práticas</p></span><span class="lesson-meta"><strong>${state.lessonScores[lesson.id] ?? 0}%</strong><small>+${lesson.xp_reward} XP</small></span></${previousDone ? 'a' : 'div'}>`;
    }).join('')}</div></article>`;
  }).join('')}</div></section>`;
}

export function englishExerciseView(session) {
  const exercise = session.exercises[session.index];
  const value = escapeHtml(session.answer ?? '');
  const progress = percent(session.index, session.exercises.length);
  let answerArea = '';
  if (exercise.type === 'choice' || exercise.type === 'listen') answerArea = `<div class="answers">${exercise.options.map((option, index) => `<button class="answer-option ${session.answer === option ? 'selected' : ''}" data-english-answer="${escapeHtml(option)}" type="button"><span class="answer-key">${index + 1}</span><span>${escapeHtml(option)}</span></button>`).join('')}</div>`;
  if (exercise.type === 'input') answerArea = `<input class="text-answer" id="english-answer" autocomplete="off" autocapitalize="none" value="${value}" placeholder="Digite em inglês...">`;
  if (exercise.type === 'order') answerArea = `<div class="word-bank">${exercise.tokens.map((token) => `<button data-english-token="${escapeHtml(token)}" type="button">${escapeHtml(token)}</button>`).join('')}</div><input class="text-answer" id="english-answer" value="${value}" readonly placeholder="Toque nas palavras para montar a frase"><button class="text-button" data-action="english-clear-order" type="button">Limpar frase</button>`;
  return `<section class="page english-page lesson-shell"><div class="lesson-top"><a class="icon-button" href="#/english/${session.exitRoute}" aria-label="Sair">×</a><div class="progress"><i style="width:${progress}%"></i></div><span>${session.index + 1}/${session.exercises.length}</span></div><article class="question-card card"><div class="question-label"><span>${exercise.skill}</span><div><button class="audio-button" data-speak="${escapeHtml(exercise.speak ?? exercise.correct_answer)}" type="button">🔊 Ouvir</button><button class="audio-button" data-action="english-pronounce" type="button">🎙️ Falar</button></div></div><h2>${escapeHtml(exercise.prompt).replace(/\n/g,'<br>')}</h2>${answerArea}${session.checked ? `<div class="feedback ${session.correct ? 'correct' : 'wrong'}"><strong>${session.correct ? '✓ Muito bem!' : '↻ Quase lá.'}</strong><p>${escapeHtml(exercise.explanation)}</p>${!session.correct ? `<p><b>Resposta:</b> ${escapeHtml(exercise.correct_answer)}</p>` : ''}</div>` : ''}<div class="lesson-actions"><button class="button button-ghost" data-action="english-hint" type="button">${session.hint ? escapeHtml(session.hint) : 'Pedir dica'}</button><button class="button button-primary" data-action="${session.checked ? 'english-next' : 'english-check'}" type="button">${session.checked ? 'Continuar →' : 'Verificar'}</button></div></article></section>`;
}

export function englishResultView(session) {
  const score = percent(session.correctCount, session.exercises.length);
  return `<section class="page english-page"><div class="card result-card"><div class="result-ring" style="--score:${score}%"><span><strong>${score}%</strong><small>acerto</small></span></div><h1>${score >= 80 ? 'Excelente prática!' : score >= 60 ? 'Bom avanço!' : 'O erro faz parte.'}</h1><p>Você acertou ${session.correctCount} de ${session.exercises.length}. As dificuldades entram automaticamente na revisão espaçada.</p><div class="method-strip"><span>+${session.xpEarned} XP</span><span>${session.mode === 'lesson' ? 'Lição registrada' : 'Prática registrada'}</span></div><div class="hero-actions" style="justify-content:center"><a class="button button-primary" href="#/english/${session.exitRoute}">Continuar</a><button class="button button-ghost" data-action="english-repeat" type="button">Praticar novamente</button></div></div></section>`;
}

export function englishReviewView() {
  const state = store.state.english;
  const stats = englishStats();
  const mistakeExercises = stats.activeMistakes.map((item) => exercises.find((exercise) => exercise.id === item.exerciseId)).filter(Boolean);
  const dueExercises = stats.dueCards.map((id) => exercises.find((exercise) => exercise.id === id)).filter(Boolean);
  const queue = [...new Map([...mistakeExercises, ...dueExercises].map((item) => [item.id, item])).values()];
  return `<section class="page english-page"><div class="page-head"><div><span class="eyebrow">MEMÓRIA ADAPTATIVA</span><h1>Revisão de inglês</h1><p>O sistema prioriza o que você errou e reapresenta cada item em intervalos crescentes.</p></div><a class="button button-ghost" href="#/english">Painel de inglês</a></div><div class="grid grid-3"><div class="metric card"><span>↻</span><div><strong>${stats.activeMistakes.length}</strong><small>erros ativos</small></div></div><div class="metric card"><span>🧠</span><div><strong>${stats.dueCards.length}</strong><small>cartões vencidos</small></div></div><div class="metric card"><span>✓</span><div><strong>${state.mistakes.filter((item) => item.mastered).length}</strong><small>itens dominados</small></div></div></div><div class="card card-pad review-callout"><div><h2>${queue.length ? `${queue.length} itens prontos` : 'Memória em dia'}</h2><p>${queue.length ? 'Faça uma rodada curta. O sistema mistura ouvir, recordar e construir frases.' : 'Não há revisões vencidas. Você pode treinar vocabulário mesmo assim.'}</p></div><button class="button button-primary" data-action="english-review" type="button">${queue.length ? 'Iniciar revisão' : 'Revisar vocabulário'}</button></div></section>`;
}

export function englishWordsView() {
  const completed = lessons.filter((lesson) => store.state.english.completedLessons.includes(lesson.id));
  const words = completed.flatMap((lesson) => lesson.words.map((word) => ({ ...word, lesson: lesson.title })));
  return `<section class="page english-page"><div class="page-head"><div><span class="eyebrow">MEU VOCABULÁRIO</span><h1>${words.length} palavras estudadas</h1><p>Ouça cada palavra e tente lembrar o significado antes de revelá-lo.</p></div><a class="button button-ghost" href="#/english">Painel de inglês</a></div>${words.length ? `<div class="word-grid">${words.map((word) => `<article class="card word-card"><button class="audio-button" data-speak="${escapeHtml(word.en)}" type="button">🔊</button><div><strong>${escapeHtml(word.en)}</strong><span>${escapeHtml(word.pt)}</span><small>${escapeHtml(word.lesson)}</small></div></article>`).join('')}</div>` : `<div class="card empty-state"><div class="empty-icon">ABC</div><h2>Seu vocabulário começa na primeira lição</h2><p>Complete uma aula para liberar palavras, traduções e áudio.</p><a class="button button-primary" href="#/english/lesson/1">Começar agora</a></div>`}</section>`;
}

export function englishLessonExercises(id) { return exercises.filter((exercise) => exercise.lesson_id === id); }
export function englishExerciseById(id) { return exercises.find((exercise) => exercise.id === id); }
