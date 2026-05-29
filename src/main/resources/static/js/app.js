// ===== JavaDuolingo Main App JS =====

// ===== Exercise Engine =====
const ExerciseEngine = (() => {
    let exercises = [];
    let currentIndex = 0;
    let lessonId = null;
    let heartsLeft = 5;
    let xpEarned = 0;
    let wrongAnswers = 0;

    function init(exercisesData, lid, hearts) {
        exercises = exercisesData;
        lessonId = lid;
        heartsLeft = hearts;
        currentIndex = 0;
        xpEarned = 0;
        wrongAnswers = 0;
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
            html += `<pre class="code-snippet"><code>${escapeHtml(ex.codeSnippet)}</code></pre>`;
        }

        html += renderAnswerArea(ex);
        html += `<button class="btn btn-primary btn-full" id="check-btn" onclick="ExerciseEngine.checkAnswer()">
            Verificar
        </button>`;
        html += `</div>`;
        container.innerHTML = html;
        attachDragDrop(ex);
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
                const tokens = options;
                return `<div class="code-order-area">
                    <div class="order-bank" id="order-bank">
                        ${tokens.map((t, i) => `
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

        let draggedEl = null;

        document.querySelectorAll('.order-token').forEach(token => {
            token.addEventListener('dragstart', e => {
                draggedEl = token;
                token.classList.add('dragging');
            });
            token.addEventListener('dragend', () => token.classList.remove('dragging'));
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
            case 'MULTIPLE_CHOICE':
            case 'TRUE_FALSE':
            case 'CODE_CHALLENGE': {
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
        if (!answer) {
            showToast('Selecione uma resposta!', 'warning');
            return;
        }

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
                totalExercises: exercises.length
            })
        })
        .then(r => r.json())
        .then(result => handleResult(result, answer))
        .catch(() => showToast('Erro de conexão!', 'error'));
    }

    function handleResult(result, submittedAnswer) {
        const ex = exercises[currentIndex];
        heartsLeft = result.heartsRemaining;
        updateHearts();

        if (result.correct) {
            xpEarned += result.xpEarned;
            showFeedback(true, result.explanation, result.xpEarned);
            highlightCorrect();
            createXpParticles(result.xpEarned);
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
            feedback.innerHTML = `<div class="feedback-icon">🎉</div>
                <div class="feedback-content">
                    <h3>Incrível! +${xp} XP</h3>
                    <p>${explanation || 'Resposta correta!'}</p>
                </div>`;
        } else {
            feedback.innerHTML = `<div class="feedback-icon">💡</div>
                <div class="feedback-content">
                    <h3>Não foi dessa vez!</h3>
                    <p>${explanation || ''}</p>
                    ${correctAnswer ? `<p><strong>Resposta correta: ${escapeHtml(correctAnswer)}</strong></p>` : ''}
                </div>
                <button class="btn btn-outline btn-sm" onclick="ExerciseEngine.askJavaBot()">
                    🤖 Pedir ajuda ao JavaBot
                </button>`;
        }
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
        document.getElementById('completion-xp').textContent = xp;
        document.getElementById('completion-stars').innerHTML = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        document.getElementById('completion-errors').textContent = errors;
        modal.style.display = 'flex';
        launchConfetti();
    }

    function launchConfetti() {
        const colors = ['#58CC02', '#1CB0F6', '#FF4B4B', '#FF9600', '#CE82FF', '#FFD900'];
        for (let i = 0; i < 50; i++) {
            const c = document.createElement('div');
            c.className = 'confetti-piece';
            c.style.cssText = `
                left: ${Math.random() * 100}%;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                animation-delay: ${Math.random() * 0.5}s;
                animation-duration: ${1 + Math.random()}s;
                width: ${8 + Math.random() * 8}px;
                height: ${8 + Math.random() * 8}px;
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            `;
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
        setTimeout(() => { t.classList.add('show'); }, 50);
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    return { init, checkAnswer, selectOption, selectBlankOption, askJavaBot };
})();

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
    .catch(() => {
        if (msgs) msgs.innerHTML += `<div class="javabot-msg">Erro ao conectar ao JavaBot.</div>`;
    });
}

// Allow Enter key in JavaBot chat
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('javabot-chat-input');
    if (input) {
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') sendJavaBotMessage();
        });
    }
});
