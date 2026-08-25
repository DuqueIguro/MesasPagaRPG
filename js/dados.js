/* ==========================================================================
   GRIMÓRIO DE DADOS - DADOS.JS (RPG DE MESA CLÁSSICO)
   ========================================================================== */

// --- TABELAS EXATAS DOS DADOS DE MACRO ---
const MACRO_DATA = {
    md6: [
        { face: 1, empty: true, s: 0, a: 0, p: 0 },
        { face: 2, empty: true, s: 0, a: 0, p: 0 },
        { face: 3, empty: false, s: 0, a: 0, p: 1 },
        { face: 4, empty: false, s: 0, a: 1, p: 1 },
        { face: 5, empty: false, s: 0, a: 1, p: 1 },
        { face: 6, empty: false, s: 1, a: 0, p: 0 }
    ],
    md10: [
        { face: 1, empty: true, s: 0, a: 0, p: 0 },
        { face: 2, empty: true, s: 0, a: 0, p: 0 },
        { face: 3, empty: false, s: 0, a: 0, p: 1 },
        { face: 4, empty: false, s: 0, a: 1, p: 1 },
        { face: 5, empty: false, s: 0, a: 1, p: 1 },
        { face: 6, empty: false, s: 1, a: 0, p: 0 },
        { face: 7, empty: false, s: 2, a: 0, p: 0 },
        { face: 8, empty: false, s: 1, a: 1, p: 0 },
        { face: 9, empty: false, s: 1, a: 1, p: 1 },
        { face: 10, empty: false, s: 2, a: 0, p: 1 }
    ],
    md12: [
        { face: 1, empty: true, s: 0, a: 0, p: 0 },
        { face: 2, empty: true, s: 0, a: 0, p: 0 },
        { face: 3, empty: false, s: 0, a: 0, p: 1 },
        { face: 4, empty: false, s: 0, a: 1, p: 1 },
        { face: 5, empty: false, s: 0, a: 1, p: 1 },
        { face: 6, empty: false, s: 1, a: 0, p: 0 },
        { face: 7, empty: false, s: 2, a: 0, p: 0 },
        { face: 8, empty: false, s: 1, a: 1, p: 0 },
        { face: 9, empty: false, s: 1, a: 1, p: 1 },
        { face: 10, empty: false, s: 2, a: 0, p: 1 },
        { face: 11, empty: false, s: 1, a: 2, p: 1 },
        { face: 12, empty: false, s: 0, a: 0, p: 2 }
    ]
};

// --- ESTADO DO SISTEMA ---
let pools = {
    standard: { d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0 },
    macro: { md6: 0, md10: 0, md12: 0 }
};

let currentTheme = 'standard';
let isRolling = false;
let latestMacroResults = [];

// --- RELÓGIO DA MESA EM TEMPO REAL ---
function startRealtimeClock() {
    const clockEl = document.getElementById('realtime-clock');
    function update() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${hours}:${mins}:${secs}`;
    }
    update();
    setInterval(update, 1000);
}

// --- EFEITOS SONOROS COM WEB AUDIO API ---
let audioContext = null;
function playRpgAudio(type = 'click') {
    try {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') audioContext.resume();

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);

        const t = audioContext.currentTime;

        if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.exponentialRampToValueAtTime(220, t + 0.05);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.linearRampToValueAtTime(0.01, t + 0.05);
            osc.start(t);
            osc.stop(t + 0.05);
        } else if (type === 'roll') {
            // Som de dados rolando na mesa de madeira/veludo
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, t);
            osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.linearRampToValueAtTime(0.01, t + 0.35);
            osc.start(t);
            osc.stop(t + 0.35);
        } else if (type === 'done') {
            // Toque de sino suave / gongo de acerto
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, t); // C5
            osc.frequency.setValueAtTime(659.25, t + 0.08); // E5
            osc.frequency.setValueAtTime(783.99, t + 0.16); // G5
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.linearRampToValueAtTime(0.01, t + 0.4);
            osc.start(t);
            osc.stop(t + 0.4);
        }
    } catch (e) {}
}

// --- ALTERNÂNCIA DE TEMA & MESA ---
function switchTheme(theme) {
    if (isRolling) return;
    currentTheme = theme;
    playRpgAudio('click');

    const tabStd = document.getElementById('tab-btn-standard');
    const tabMac = document.getElementById('tab-btn-macro');
    const panelStd = document.getElementById('panel-standard');
    const panelMac = document.getElementById('panel-macro');

    if (theme === 'standard') {
        document.body.className = 'theme-standard';
        tabStd.classList.add('active');
        tabMac.classList.remove('active');
        panelStd.classList.add('active-panel');
        panelMac.classList.remove('active-panel');
        addChronicleLog('Mesa de Rolagem Clássica selecionada (Verde Esmeralda e Vermelho Rubi).');
    } else {
        document.body.className = 'theme-macro';
        tabMac.classList.add('active');
        tabStd.classList.remove('active');
        panelMac.classList.add('active-panel');
        panelStd.classList.remove('active-panel');
        addChronicleLog('Mesa de Rolagem Rúnica de Macro selecionada (Tons Terrosos e Couro).');
    }
}

// --- GESTÃO DOS DADOS NA BOLSA ---
function alterDiceCount(category, die, delta) {
    playRpgAudio('click');
    pools[category][die] = Math.max(0, pools[category][die] + delta);
    const labelId = category === 'standard' ? `val-std-${die}` : `val-macro-${die}`;
    document.getElementById(labelId).textContent = pools[category][die];
}

function clearDicePool(category) {
    playRpgAudio('click');
    for (let d in pools[category]) {
        pools[category][d] = 0;
        const labelId = category === 'standard' ? `val-std-${d}` : `val-macro-${d}`;
        document.getElementById(labelId).textContent = '0';
    }
    addChronicleLog(`Bolsa de dados de ${category === 'standard' ? 'Rolagem Clássica' : 'Macro'} foi esvaziada.`);
}

function adjustInputValue(id, delta, min = null) {
    playRpgAudio('click');
    const inp = document.getElementById(id);
    let val = parseInt(inp.value) || 0;
    val += delta;
    if (min !== null && val < min) val = min;
    inp.value = val;
}

// --- REGISTRO DAS CRÔNICAS (LOG) ---
function addChronicleLog(text) {
    const feed = document.getElementById('chronicle-feed');
    const entry = document.createElement('div');
    entry.className = 'chronicle-entry';
    const time = new Date().toLocaleTimeString('pt-BR');
    entry.innerHTML = `[${time}] ${text}`;
    feed.prepend(entry);
}

function clearChronicleLog() {
    playRpgAudio('click');
    document.getElementById('chronicle-feed').innerHTML = '<div class="chronicle-entry">[Crônicas Reiniciadas] Pergaminho de registros limpo.</div>';
}

// ==========================================================================
// ROLAGEM NORMAL / CLÁSSICA (VERDE ESMERALDA & VERMELHO RUBI)
// ==========================================================================
function executeStandardRoll() {
    if (isRolling) return;

    let diceToRoll = [];
    for (let [die, count] of Object.entries(pools.standard)) {
        const sides = parseInt(die.replace('d', ''));
        for (let i = 0; i < count; i++) {
            diceToRoll.push({ type: die.toUpperCase(), sides: sides });
        }
    }

    if (diceToRoll.length === 0) {
        alert('Por favor, adicione ao menos um dado da bolsa antes de rolar.');
        return;
    }

    isRolling = true;
    playRpgAudio('roll');
    clearDicePool('standard'); // Zera automaticamente após o lançamento

    const rollMode = document.getElementById('std-roll-mode').value;
    const modifier = parseInt(document.getElementById('std-mod-input').value) || 0;
    const disadvantage = parseInt(document.getElementById('std-disadv-input').value) || 0;

    const arena = document.getElementById('std-dice-arena');
    const statusText = document.getElementById('std-tray-status');
    const summaryBox = document.getElementById('std-summary-box');

    summaryBox.classList.add('hidden');
    statusText.textContent = 'Os dados estão rolando sobre o veludo...';
    arena.innerHTML = '';

    let cardElements = [];
    diceToRoll.forEach(d => {
        const card = document.createElement('div');
        card.className = 'tabletop-die-card anim-rpg-roll';
        card.innerHTML = `
            <span class="die-card-header">${d.type}</span>
            <span class="die-card-number">?</span>
            <span class="die-card-footer">Rolando...</span>
        `;
        arena.appendChild(card);
        cardElements.push({ die: d, card: card });
    });

    setTimeout(() => {
        let rolledList = [];
        cardElements.forEach(item => {
            const val = Math.floor(Math.random() * item.die.sides) + 1;
            item.card.classList.remove('anim-rpg-roll');
            item.card.querySelector('.die-card-number').textContent = val;
            item.card.querySelector('.die-card-footer').textContent = `D${item.die.sides}`;
            rolledList.push({ type: item.die.type, value: val, card: item.card });
        });

        // Lógica de Desvantagem (Descarta os N maiores valores)
        let activeDice = [...rolledList];
        let discCount = 0;

        if (disadvantage > 0) {
            const sortedDesc = [...rolledList].sort((a, b) => b.value - a.value);

            if (disadvantage >= rolledList.length) {
                const minVal = Math.min(...rolledList.map(r => r.value));
                let kept = false;
                rolledList.forEach(r => {
                    if (r.value === minVal && !kept) {
                        kept = true;
                    } else {
                        r.card.classList.add('discarded');
                        const tag = document.createElement('div');
                        tag.className = 'discard-tag';
                        tag.innerHTML = '<i class="fa-solid fa-xmark"></i> DESCARTADO';
                        r.card.appendChild(tag);
                    }
                });
                activeDice = rolledList.filter(r => !r.card.classList.contains('discarded'));
                discCount = rolledList.length - 1;
            } else {
                const toDiscard = sortedDesc.slice(0, disadvantage);
                toDiscard.forEach(r => {
                    r.card.classList.add('discarded');
                    const tag = document.createElement('div');
                    tag.className = 'discard-tag';
                    tag.innerHTML = '<i class="fa-solid fa-xmark"></i> DESCARTADO';
                    r.card.appendChild(tag);
                });
                activeDice = rolledList.filter(r => !r.card.classList.contains('discarded'));
                discCount = disadvantage;
            }
        }

        let totalScore = 0;
        let styleDesc = '';

        if (rollMode === 'sum') {
            const sumBase = activeDice.reduce((acc, c) => acc + c.value, 0);
            totalScore = sumBase + modifier;
            styleDesc = `Soma dos ${activeDice.length} dados ativos (${sumBase}) ${modifier >= 0 ? '+' : ''}${modifier} = ${totalScore}`;
        } else if (rollMode === 'highest') {
            const high = Math.max(...activeDice.map(r => r.value));
            totalScore = high + modifier;
            styleDesc = `Maior valor (${high}) ${modifier >= 0 ? '+' : ''}${modifier} = ${totalScore}`;
        } else if (rollMode === 'lowest') {
            const low = Math.min(...activeDice.map(r => r.value));
            totalScore = low + modifier;
            styleDesc = `Menor valor (${low}) ${modifier >= 0 ? '+' : ''}${modifier} = ${totalScore}`;
        } else {
            totalScore = activeDice.map(r => r.value).join(', ');
            styleDesc = `Resultados Individuais: [ ${totalScore} ] (Modificador: ${modifier >= 0 ? '+' : ''}${modifier})`;
        }

        summaryBox.classList.remove('hidden');
        summaryBox.innerHTML = `
            <div class="summary-title-row">
                <span class="summary-heading"><i class="fa-solid fa-scroll"></i> Resultado Final da Rolagem</span>
                <span class="summary-score">${totalScore}</span>
            </div>
            <div class="summary-body">
                <div><strong>Regra Aplicada:</strong> ${styleDesc}</div>
                <div><strong>Dados Lançados:</strong> ${rolledList.map(r => `${r.type}: <strong>${r.value}</strong>`).join(' | ')}</div>
                ${disadvantage > 0 ? `<div><strong>Desvantagem:</strong> ${discCount} melhor(es) dado(s) descartado(s).</div>` : ''}
            </div>
        `;

        playRpgAudio('done');
        statusText.textContent = 'Rolagem concluída com sucesso na mesa!';
        addChronicleLog(`Rolagem Clássica: <strong>${totalScore}</strong> [${styleDesc}]`);

        isRolling = false;
    }, 850);
}

// ==========================================================================
// ROLAGEM MACRO (TONS DE MARROM & ÂMBAR)
// ==========================================================================
function executeMacroRoll() {
    if (isRolling) return;

    let macroToRoll = [];
    for (let [die, count] of Object.entries(pools.macro)) {
        for (let i = 0; i < count; i++) {
            macroToRoll.push({ type: die, label: die.toUpperCase() });
        }
    }

    if (macroToRoll.length === 0) {
        alert('Por favor, adicione ao menos um Dado de Macro (D6, D10 ou D12).');
        return;
    }

    isRolling = true;
    playRpgAudio('roll');
    clearDicePool('macro'); // Zera automaticamente após o lançamento

    const rollMode = document.getElementById('macro-roll-mode').value;
    const modSuc = parseInt(document.getElementById('macro-mod-suc').value) || 0;
    const modAdp = parseInt(document.getElementById('macro-mod-adp').value) || 0;
    const modPrs = parseInt(document.getElementById('macro-mod-prs').value) || 0;

    const arena = document.getElementById('macro-dice-arena');
    const statusText = document.getElementById('macro-tray-status');
    const summaryBox = document.getElementById('macro-summary-box');
    const keepPanel = document.getElementById('macro-keep-panel');

    summaryBox.classList.add('hidden');
    keepPanel.classList.add('hidden');
    statusText.textContent = 'Consultando os oráculos rúnicos...';
    arena.innerHTML = '';

    let elements = [];
    macroToRoll.forEach(m => {
        const card = document.createElement('div');
        card.className = 'tabletop-die-card anim-rpg-roll';
        card.innerHTML = `
            <span class="die-card-header">${m.label}</span>
            <div class="macro-symbol-cluster"><i class="fa-solid fa-spinner fa-spin"></i></div>
            <span class="die-card-footer">Rúnico</span>
        `;
        arena.appendChild(card);
        elements.push({ die: m, card: card, cluster: card.querySelector('.macro-symbol-cluster') });
    });

    setTimeout(() => {
        latestMacroResults = [];

        elements.forEach((item, idx) => {
            const table = MACRO_DATA[item.die.type];
            const rolledFace = table[Math.floor(Math.random() * table.length)];

            item.card.classList.remove('anim-rpg-roll');

            let icons = '';
            if (rolledFace.empty) {
                icons = '<span class="macro-rune-item rune-empty" title="Vazio"><i class="fa-solid fa-ban"></i></span>';
            } else {
                for (let i = 0; i < rolledFace.s; i++) icons += '<span class="macro-rune-item rune-success" title="Sucesso"><i class="fa-solid fa-bug"></i></span>';
                for (let i = 0; i < rolledFace.a; i++) icons += '<span class="macro-rune-item rune-adaptation" title="Adaptação"><i class="fa-solid fa-shield-cat"></i></span>';
                for (let i = 0; i < rolledFace.p; i++) icons += '<span class="macro-rune-item rune-pressure" title="Pressão"><i class="fa-solid fa-fire-flame-curved"></i></span>';
            }

            item.cluster.innerHTML = icons;
            item.card.querySelector('.die-card-footer').textContent = `Face ${rolledFace.face}`;

            const resultObj = {
                id: idx,
                die: item.die.label,
                face: rolledFace.face,
                empty: rolledFace.empty,
                s: rolledFace.s,
                a: rolledFace.a,
                p: rolledFace.p,
                card: item.card,
                selectedToKeep: true
            };

            latestMacroResults.push(resultObj);
        });

        if (rollMode === 'select_keep') {
            statusText.textContent = 'Selecione na bandeja os dados que você deseja manter:';
            keepPanel.classList.remove('hidden');

            latestMacroResults.forEach(res => {
                res.card.classList.add('selectable');
                res.card.classList.add('manual-kept');

                const badge = document.createElement('div');
                badge.className = 'kept-badge';
                badge.innerHTML = '<i class="fa-solid fa-check"></i> MANTIDO';
                res.card.appendChild(badge);

                res.card.onclick = () => {
                    playRpgAudio('click');
                    res.selectedToKeep = !res.selectedToKeep;
                    if (res.selectedToKeep) {
                        res.card.classList.add('manual-kept');
                        res.card.classList.remove('discarded');
                        badge.style.display = 'block';
                    } else {
                        res.card.classList.remove('manual-kept');
                        res.card.classList.add('discarded');
                        badge.style.display = 'none';
                    }
                };
            });

            isRolling = false;
        } else {
            consolidateMacroResults(modSuc, modAdp, modPrs, false);
            isRolling = false;
        }

    }, 850);
}

function confirmMacroSelection() {
    playRpgAudio('done');
    document.getElementById('macro-keep-panel').classList.add('hidden');

    latestMacroResults.forEach(r => {
        r.card.onclick = null;
        r.card.classList.remove('selectable');
    });

    const modSuc = parseInt(document.getElementById('macro-mod-suc').value) || 0;
    const modAdp = parseInt(document.getElementById('macro-mod-adp').value) || 0;
    const modPrs = parseInt(document.getElementById('macro-mod-prs').value) || 0;

    consolidateMacroResults(modSuc, modAdp, modPrs, true);
}

function consolidateMacroResults(modSuc, modAdp, modPrs, isManualFiltered) {
    const summaryBox = document.getElementById('macro-summary-box');
    const statusText = document.getElementById('macro-tray-status');

    let keptResults = isManualFiltered ? latestMacroResults.filter(r => r.selectedToKeep) : latestMacroResults;

    let totS = modSuc;
    let totA = modAdp;
    let totP = modPrs;

    keptResults.forEach(r => {
        totS += r.s;
        totA += r.a;
        totP += r.p;
    });

    summaryBox.classList.remove('hidden');
    summaryBox.innerHTML = `
        <div class="summary-title-row">
            <span class="summary-heading"><i class="fa-solid fa-scroll"></i> Balanço Rúnico de Símbolos</span>
            <span class="summary-score">${totS} Sucessos</span>
        </div>
        <div class="summary-body">
            <div><strong>Modo:</strong> ${isManualFiltered ? `Seleção Manual (${keptResults.length} de ${latestMacroResults.length} dados mantidos)` : 'Soma Consolidada Total'}</div>
            <div class="macro-runes-bar">
                <div class="macro-rune-pill"><span class="rune-tag rune-success"><i class="fa-solid fa-bug"></i></span> <strong>Sucessos:</strong> ${totS} (Mod: ${modSuc >= 0 ? '+' : ''}${modSuc})</div>
                <div class="macro-rune-pill"><span class="rune-tag rune-adaptation"><i class="fa-solid fa-shield-cat"></i></span> <strong>Adaptações:</strong> ${totA} (Mod: ${modAdp >= 0 ? '+' : ''}${modAdp})</div>
                <div class="macro-rune-pill"><span class="rune-tag rune-pressure"><i class="fa-solid fa-fire-flame-curved"></i></span> <strong>Pressões:</strong> ${totP} (Mod: ${modPrs >= 0 ? '+' : ''}${modPrs})</div>
            </div>
        </div>
    `;

    playRpgAudio('done');
    statusText.textContent = 'Conjuração rúnica consolidada na bandeja!';
    addChronicleLog(`Rolagem Macro: Sucessos: <strong>${totS}</strong> | Adaptações: <strong>${totA}</strong> | Pressões: <strong>${totP}</strong>`);
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    startRealtimeClock();
});
