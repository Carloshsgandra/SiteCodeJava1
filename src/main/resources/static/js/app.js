// ===== JavaDuolingo Main App JS =====

// ===== Dark Mode =====
const DarkMode = (() => {
    const KEY = 'jd-dark-mode';

    function init() {
        if (localStorage.getItem(KEY) === '1') enable(false);
        document.querySelectorAll('.dark-toggle-btn').forEach(btn =>
            btn.addEventListener('click', toggle));
    }

    function enable(save = true) {
        document.body.classList.add('dark-mode');
        document.querySelectorAll('.dark-toggle-btn').forEach(b => b.textContent = '☀️');
        if (save) localStorage.setItem(KEY, '1');
    }

    function disable(save = true) {
        document.body.classList.remove('dark-mode');
        document.querySelectorAll('.dark-toggle-btn').forEach(b => b.textContent = '🌙');
        if (save) localStorage.setItem(KEY, '0');
    }

    function toggle() {
        document.body.classList.contains('dark-mode') ? disable() : enable();
    }

    return { init };
})();

// ===== Study Timer (Pomodoro) =====
const StudyTimer = (() => {
    const WORK_SECS  = 25 * 60;
    const BREAK_SECS =  5 * 60;
    let total = WORK_SECS, remaining = WORK_SECS;
    let interval = null, isBreak = false, paused = true;
    const CIRCUMFERENCE = 2 * Math.PI * 16; // r=16

    function mount(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = `
            <div class="timer-ring">
                <svg width="36" height="36" viewBox="0 0 36 36">
                    <circle class="timer-ring-bg" cx="18" cy="18" r="16"/>
                    <circle class="timer-ring-fill" id="timer-ring-fill" cx="18" cy="18" r="16"
                        stroke-dasharray="${CIRCUMFERENCE}"
                        stroke-dashoffset="0"/>
                </svg>
            </div>
            <div>
                <div class="timer-time" id="timer-time">25:00</div>
                <div class="timer-label" id="timer-label">Foco</div>
            </div>
            <div class="timer-controls">
                <button class="timer-btn" id="timer-toggle" onclick="StudyTimer.toggle()">▶</button>
                <button class="timer-btn" onclick="StudyTimer.reset()">↺</button>
            </div>`;
        update();
    }

    function toggle() {
        if (paused) {
            paused = false;
            document.getElementById('timer-toggle').textContent = '⏸';
            interval = setInterval(tick, 1000);
        } else {
            paused = true;
            document.getElementById('timer-toggle').textContent = '▶';
            clearInterval(interval);
        }
    }

    function reset() {
        clearInterval(interval);
        paused = true;
        isBreak = false;
        total = WORK_SECS;
        remaining = WORK_SECS;
        const btn = document.getElementById('timer-toggle');
        if (btn) btn.textContent = '▶';
        const wrap = document.getElementById('study-timer');
        if (wrap) wrap.className = 'study-timer';
        update();
    }

    function tick() {
        remaining--;
        if (remaining <= 0) {
            clearInterval(interval);
            paused = true;
            showToast(isBreak ? '⚡ Hora de focar!' : '☕ Pausa de 5 min!', 'info');
            isBreak = !isBreak;
            total = isBreak ? BREAK_SECS : WORK_SECS;
            remaining = total;
            const wrap = document.getElementById('study-timer');
            if (wrap) wrap.className = isBreak ? 'study-timer break-mode' : 'study-timer';
            const btn = document.getElementById('timer-toggle');
            if (btn) btn.textContent = '▶';
        }
        update();
        const wrap = document.getElementById('study-timer');
        if (wrap && remaining <= 60 && !isBreak) wrap.className = 'study-timer warning';
    }

    function update() {
        const m = String(Math.floor(remaining / 60)).padStart(2, '0');
        const s = String(remaining % 60).padStart(2, '0');
        const timeEl = document.getElementById('timer-time');
        const labelEl = document.getElementById('timer-label');
        const ringEl  = document.getElementById('timer-ring-fill');
        if (timeEl)  timeEl.textContent = `${m}:${s}`;
        if (labelEl) labelEl.textContent = isBreak ? 'Pausa' : 'Foco';
        if (ringEl) {
            const pct = remaining / total;
            ringEl.style.strokeDashoffset = CIRCUMFERENCE * (1 - pct);
        }
    }

    return { mount, toggle, reset };
})();

// ===== Exercise Engine =====
const ExerciseEngine = (() => {
    let exercises = [];
    let currentIndex = 0;
    let lessonId = null;
    let heartsLeft = 5;
    let xpEarned = 0;
    let wrongAnswers = 0;
    let practiceMode = false;
    let hintLevel = 0;

    function init(exercisesData, lid, hearts, isPractice) {
        exercises = exercisesData;
        lessonId = lid;
        heartsLeft = hearts;
        practiceMode = !!isPractice;
        currentIndex = 0;
        xpEarned = 0;
        wrongAnswers = 0;
        hintLevel = 0;
        renderExercise();
        updateProgressBar();
    }

    function renderExercise() {
        if (currentIndex >= exercises.length) return;
        const ex = exercises[currentIndex];
        const container = document.getElementById('exercise-container');
        const progressText = document.getElementById('progress-text');
        if (progressText) progressText.textContent = `${currentIndex + 1} / ${exercises.length}`;

        let html = `<div class="exercise-card animate-bounce-in" id="current-exercise">`;
        html += `<div class="exercise-type-badge">${getTypeLabel(ex.type)}</div>`;
        html += `<h2 class="exercise-question">${escapeHtml(ex.question)}</h2>`;

        if (ex.codeSnippet) {
            html += `<pre class="code-snippet" id="snippet-${ex.id}"><code>${escapeHtml(ex.codeSnippet)}</code></pre>`;
            html += `<button class="btn-run-code" onclick="runCode(${ex.id}, this)">▶ Executar Código</button>`;
            html += `<div class="code-output" id="output-${ex.id}" style="display:none;"></div>`;
        }

        html += renderAnswerArea(ex);
        html += `<button class="btn btn-primary btn-full" id="check-btn" onclick="ExerciseEngine.checkAnswer()">
            Verificar
        </button>`;
        html += `</div>`;
        container.innerHTML = html;
        hintLevel = 0;
        attachDragDrop(ex);
        hideFeedback();
    }

    function hideFeedback() {
        const fb = document.getElementById('feedback-bar');
        if (fb) fb.className = 'feedback-bar';
    }

    function renderAnswerArea(ex) {
        const options = ex.options || [];
        switch (ex.type) {
            case 'MULTIPLE_CHOICE':
                return `<div class="options-grid">
                    ${options.map((opt, i) => `
                        <button class="option-btn" data-value="${escapeHtml(opt)}" onclick="ExerciseEngine.selectOption(this)">
                            <span class="option-key">${String.fromCharCode(65+i)}</span>
                            <span class="option-text">${escapeHtml(opt)}</span>
                        </button>`).join('')}
                </div>`;

            case 'TRUE_FALSE':
                return `<div class="tf-grid">
                    <button class="tf-btn" data-value="true" onclick="ExerciseEngine.selectOption(this)">
                        <span class="tf-icon">✓</span> Verdadeiro
                    </button>
                    <button class="tf-btn tf-false" data-value="false" onclick="ExerciseEngine.selectOption(this)">
                        <span class="tf-icon">✗</span> Falso
                    </button>
                </div>`;

            case 'FILL_BLANK':
                return `<div class="fill-blank-area">
                    <div class="blank-options">
                        ${options.map(opt => `
                            <button class="blank-option" onclick="ExerciseEngine.selectBlankOption(this, '${escapeHtml(opt)}')">${escapeHtml(opt)}</button>
                        `).join('')}
                    </div>
                    <div class="blank-input-area">
                        <input type="text" id="blank-answer" class="blank-input" placeholder="Sua resposta..." />
                    </div>
                </div>`;

            case 'CODE_ORDER':
                return `<div class="code-order-area">
                    <div class="order-bank" id="order-bank">
                        ${options.map((t, i) => `
                            <div class="order-token" draggable="true" data-token="${escapeHtml(t)}" data-index="${i}">${escapeHtml(t)}</div>
                        `).join('')}
                    </div>
                    <div class="order-drop-zone" id="order-drop">
                        <span class="drop-hint">Arraste as peças aqui na ordem correta</span>
                    </div>
                </div>`;

            case 'CODE_CHALLENGE':
                return `<div class="options-grid">
                    ${options.map((opt, i) => `
                        <button class="option-btn" data-value="${escapeHtml(opt)}" onclick="ExerciseEngine.selectOption(this)">
                            <span class="option-key">${String.fromCharCode(65+i)}</span>
                            <span class="option-text"><code>${escapeHtml(opt)}</code></span>
                        </button>`).join('')}
                </div>`;

            default:
                return `<input type="text" id="text-answer" class="form-input" placeholder="Sua resposta..." />`;
        }
    }

    function attachDragDrop(ex) {
        if (ex.type !== 'CODE_ORDER') return;
        const bank = document.getElementById('order-bank');
        const drop = document.getElementById('order-drop');
        if (!bank || !drop) return;

        const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;
        let draggedEl = null;
        let selectedToken = null;

        document.querySelectorAll('.order-token').forEach(token => {
            token.addEventListener('dragstart', e => { draggedEl = token; token.classList.add('dragging'); });
            token.addEventListener('dragend', () => token.classList.remove('dragging'));

            token.addEventListener('click', () => {
                if (!isTouchDevice() && !('ontouchstart' in window)) return;
                if (selectedToken === token) { token.classList.remove('selected'); selectedToken = null; return; }
                if (selectedToken) selectedToken.classList.remove('selected');
                selectedToken = token;
                token.classList.add('selected');
                if (bank.contains(token)) {
                    const hint = drop.querySelector('.drop-hint');
                    if (hint) hint.remove();
                    drop.appendChild(token);
                    token.classList.remove('selected');
                    selectedToken = null;
                }
            });
        });

        drop.addEventListener('click', e => {
            if (!isTouchDevice() && !('ontouchstart' in window)) return;
            const token = e.target.closest('.order-token');
            if (token) { bank.appendChild(token); if (selectedToken) selectedToken.classList.remove('selected'); selectedToken = null; }
        });

        [bank, drop].forEach(zone => {
            zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
            zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                if (draggedEl) {
                    const hint = drop.querySelector('.drop-hint');
                    if (hint && zone === drop) hint.remove();
                    zone.appendChild(draggedEl);
                    draggedEl = null;
                }
            });
        });
    }

    function selectOption(btn) {
        document.querySelectorAll('.option-btn, .tf-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    }

    function selectBlankOption(btn, value) {
        document.querySelectorAll('.blank-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const input = document.getElementById('blank-answer');
        if (input) input.value = value;
    }

    function getAnswer() {
        const ex = exercises[currentIndex];
        switch (ex.type) {
            case 'MULTIPLE_CHOICE': case 'TRUE_FALSE': case 'CODE_CHALLENGE': {
                const sel = document.querySelector('.option-btn.selected, .tf-btn.selected');
                return sel ? sel.dataset.value : null;
            }
            case 'FILL_BLANK': {
                const input = document.getElementById('blank-answer');
                return input ? input.value.trim() : null;
            }
            case 'CODE_ORDER': {
                const tokens = document.querySelectorAll('#order-drop .order-token');
                return Array.from(tokens).map(t => t.dataset.token).join(' ');
            }
            default: {
                const inp = document.getElementById('text-answer');
                return inp ? inp.value.trim() : null;
            }
        }
    }

    function checkAnswer() {
        const answer = getAnswer();
        if (!answer) { showToast('Selecione uma resposta!', 'warning'); return; }
        const btn = document.getElementById('check-btn');
        if (btn) btn.disabled = true;

        fetch('/api/exercise/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                exerciseId: exercises[currentIndex].id,
                lessonId: lessonId,
                submittedAnswer: answer,
                exerciseIndex: currentIndex,
                totalExercises: exercises.length,
                practiceMode: practiceMode
            })
        })
        .then(r => r.json())
        .then(result => handleResult(result, answer))
        .catch(() => showToast('Erro de conexão!', 'error'));
    }

    function handleResult(result, submittedAnswer) {
        heartsLeft = result.heartsRemaining;
        updateHearts();

        if (result.correct) {
            xpEarned += result.xpEarned;
            showFeedback(true, result.explanation, result.xpEarned);
            highlightCorrect();
            if (!practiceMode && result.xpEarned > 0) createXpParticles(result.xpEarned);
            updateXpDisplay(result.totalXp);
        } else {
            wrongAnswers++;
            showFeedback(false, result.explanation, 0, result.correctAnswer);
            highlightWrong(submittedAnswer, result.correctAnswer);
            const card = document.getElementById('current-exercise');
            if (card) card.classList.add('animate-shake');
        }

        if (result.lessonComplete) {
            setTimeout(() => showCompletionModal(xpEarned, wrongAnswers, result.lessonId), 1200);
        } else if (result.correct) {
            setTimeout(() => {
                currentIndex++;
                hintLevel = 0;
                renderExercise();
                updateProgressBar();
            }, 1500);
        } else {
            setTimeout(() => {
                const btn = document.getElementById('check-btn');
                if (btn) btn.disabled = false;
            }, 1500);
        }
    }

    function highlightCorrect() {
        const sel = document.querySelector('.option-btn.selected, .tf-btn.selected');
        if (sel) sel.classList.add('correct');
    }

    function highlightWrong(submitted, correct) {
        document.querySelectorAll('.option-btn, .tf-btn').forEach(btn => {
            if (btn.dataset.value === submitted) btn.classList.add('wrong');
            if (btn.dataset.value && btn.dataset.value.toLowerCase() === correct.toLowerCase()) btn.classList.add('correct');
        });
    }

    function updateProgressBar() {
        const fill = document.getElementById('progress-fill');
        if (fill) fill.style.width = `${(currentIndex / exercises.length) * 100}%`;
    }

    function updateHearts() {
        const container = document.getElementById('hearts-display');
        if (!container) return;
        if (practiceMode) { container.innerHTML = '<span style="font-size:14px;color:var(--purple);font-weight:700;">🎯 Modo Prática</span>'; return; }
        let html = '';
        for (let i = 0; i < 5; i++) {
            html += `<span class="heart ${i < heartsLeft ? 'full' : 'empty'}">${i < heartsLeft ? '❤️' : '🤍'}</span>`;
        }
        container.innerHTML = html;
    }

    function updateXpDisplay(totalXp) {
        const el = document.getElementById('xp-display');
        if (el) el.textContent = totalXp + ' XP';
    }

    function showFeedback(correct, explanation, xp, correctAnswer) {
        const feedback = document.getElementById('feedback-bar');
        if (!feedback) return;
        feedback.className = `feedback-bar ${correct ? 'correct' : 'wrong'} show`;
        if (correct) {
            const xpLabel = practiceMode ? '' : ` +${xp} XP`;
            feedback.innerHTML = `<div class="feedback-icon">🎉</div>
                <div class="feedback-content">
                    <h3>Incrível!${xpLabel}</h3>
                    <p>${explanation || 'Resposta correta!'}</p>
                </div>`;
        } else {
            const ex = exercises[currentIndex];
            feedback.innerHTML = `<div class="feedback-icon">💡</div>
                <div class="feedback-content">
                    <h3>Não foi dessa vez!</h3>
                    <p>${explanation || ''}</p>
                    ${correctAnswer ? `<p><strong>Resposta correta: ${escapeHtml(correctAnswer)}</strong></p>` : ''}
                </div>
                <div class="hints-container">
                    <button class="hint-btn" id="hint-btn-1" onclick="ExerciseEngine.requestHint(1)">💡 Dica 1</button>
                    <button class="hint-btn" id="hint-btn-2" onclick="ExerciseEngine.requestHint(2)" style="display:none;">💡 Dica 2</button>
                    <button class="hint-btn hint-ai" id="hint-btn-3" onclick="ExerciseEngine.requestHint(3)" style="display:none;">🤖 Explicação completa</button>
                </div>`;
        }
    }

    function requestHint(level) {
        const ex = exercises[currentIndex];
        const btn = document.getElementById(`hint-btn-${level}`);
        if (btn) { btn.classList.add('hint-loading'); btn.textContent = '⏳ Carregando...'; }

        fetch('/api/javabot/hint-level', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exerciseId: ex.id, level: level })
        })
        .then(r => r.json())
        .then(data => {
            showJavaBotResponse(data.hint);
            if (btn) btn.style.display = 'none';
            // Unlock next hint button
            const next = document.getElementById(`hint-btn-${level + 1}`);
            if (next) next.style.display = 'inline-flex';
        })
        .catch(() => showJavaBotResponse('Não foi possível conectar ao JavaBot.'));
    }

    function askJavaBot() {
        const ex = exercises[currentIndex];
        fetch('/api/javabot/hint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exerciseId: ex.id, question: ex.question })
        })
        .then(r => r.json())
        .then(data => showJavaBotResponse(data.hint))
        .catch(() => showJavaBotResponse('Não foi possível conectar ao JavaBot agora.'));
    }

    function showJavaBotResponse(text) {
        const modal = document.getElementById('javabot-modal');
        if (modal) {
            document.getElementById('javabot-response').textContent = text;
            modal.style.display = 'flex';
        }
    }

    function createXpParticles(amount) {
        for (let i = 0; i < 8; i++) {
            const p = document.createElement('div');
            p.className = 'xp-particle';
            p.textContent = `+${amount}`;
            p.style.left = `${20 + Math.random() * 60}%`;
            p.style.top = `${30 + Math.random() * 40}%`;
            p.style.animationDelay = `${Math.random() * 0.3}s`;
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 1500);
        }
    }

    function showCompletionModal(xp, errors, lid) {
        const stars = errors === 0 ? 3 : errors <= 2 ? 2 : 1;
        const modal = document.getElementById('completion-modal');
        if (!modal) return;
        document.getElementById('completion-xp').textContent = practiceMode ? '🎯' : xp;
        document.getElementById('completion-stars').innerHTML = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        document.getElementById('completion-errors').textContent = errors;
        modal.style.display = 'flex';
        if (!practiceMode) launchConfetti();
    }

    function launchConfetti() {
        const colors = ['#58CC02', '#1CB0F6', '#FF4B4B', '#FF9600', '#CE82FF', '#FFD900'];
        for (let i = 0; i < 50; i++) {
            const c = document.createElement('div');
            c.className = 'confetti-piece';
            c.style.cssText = `left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};animation-delay:${Math.random()*0.5}s;animation-duration:${1+Math.random()}s;width:${8+Math.random()*8}px;height:${8+Math.random()*8}px;border-radius:${Math.random()>.5?'50%':'2px'};`;
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 2000);
        }
    }

    function getTypeLabel(type) {
        const labels = {
            MULTIPLE_CHOICE: '🔤 Múltipla Escolha',
            FILL_BLANK: '✏️ Completar Código',
            CODE_ORDER: '🔀 Ordenar Código',
            TRUE_FALSE: '✓✗ Verdadeiro ou Falso',
            CODE_CHALLENGE: '💻 Desafio de Código'
        };
        return labels[type] || type;
    }

    function showToast(msg, type) {
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.classList.add('show'), 50);
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    return { init, checkAnswer, selectOption, selectBlankOption, askJavaBot, requestHint };
})();

// ===== Code Execution (Piston API) =====
function runCode(exId, btn) {
    const snippetEl = document.getElementById('snippet-' + exId);
    const outputEl  = document.getElementById('output-'  + exId);
    if (!snippetEl || !outputEl) return;

    const code = snippetEl.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Executando...';
    outputEl.style.display = 'block';
    outputEl.className = 'code-output loading';
    outputEl.textContent = 'Compilando e executando...';

    fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    })
    .then(r => r.json())
    .then(data => {
        outputEl.className = 'code-output ' + (data.type || 'success');
        outputEl.textContent = data.output || '(sem saída)';
        btn.disabled = false;
        btn.textContent = '▶ Executar Código';
    })
    .catch(() => {
        outputEl.className = 'code-output error';
        outputEl.textContent = 'Erro ao conectar ao servidor de execução.';
        btn.disabled = false;
        btn.textContent = '▶ Executar Código';
    });
}

// ===== Global Toast =====
function showToast(msg, type) {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 50);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}

// ===== JavaBot Chat Widget =====
function sendJavaBotMessage() {
    const input = document.getElementById('javabot-chat-input');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    const msgs = document.getElementById('javabot-chat-messages');
    if (msgs) {
        msgs.innerHTML += `<div class="javabot-msg user">${msg}</div>`;
        msgs.scrollTop = msgs.scrollHeight;
    }

    fetch('/api/javabot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
    })
    .then(r => r.json())
    .then(data => {
        if (msgs) {
            msgs.innerHTML += `<div class="javabot-msg">${data.response}</div>`;
            msgs.scrollTop = msgs.scrollHeight;
        }
    })
    .catch(() => { if (msgs) msgs.innerHTML += `<div class="javabot-msg">Erro ao conectar ao JavaBot.</div>`; });
}

// ===== Init on load =====
document.addEventListener('DOMContentLoaded', () => {
    DarkMode.init();

    const input = document.getElementById('javabot-chat-input');
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') sendJavaBotMessage(); });

    // Mark active bottom nav item
    const path = window.location.pathname;
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        if (path === item.dataset.path || path.startsWith(item.dataset.path + '/'))
            item.classList.add('active');
    });
});
