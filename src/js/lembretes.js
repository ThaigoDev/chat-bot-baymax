<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Consulta Rápida - Baymax</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

    <style>
        /* --- ESTILOS GLOBAIS E VARIÁVEIS DE TEMA --- */
        :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f7f7f8;
            --text-primary: #1a1a1a;
            --text-secondary: #5c5c5c;
            --text-placeholder: #999;
            --text-accent: #ffffff;
            --border-color: #e5e7eb;
            --accent-color: #007aff;
            --accent-color-translucent: rgba(0, 122, 255, 0.2);
            --font-family: 'Inter', sans-serif;
        }

        body.dark-mode {
            --bg-primary: #121212;
            --bg-secondary: #1e1e1e;
            --text-primary: #f0f0f0;
            --text-secondary: #a0a0a0;
            --text-placeholder: #666;
            --border-color: #333333;
        }

        * {
            -webkit-tap-highlight-color: transparent;
            box-sizing: border-box;
        }

        *:focus {
            outline: none;
            box-shadow: none;
        }

        body {
            font-family: var(--font-family);
            background-color: var(--bg-primary);
            color: var(--text-primary);
            margin: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* --- LAYOUT PRINCIPAL --- */
        #consultation-screen {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: var(--bg-primary);
        }

        .consultation-content {
            flex-grow: 1;
            overflow-y: auto;
            padding: 16px 24px 32px 24px;
            -webkit-overflow-scrolling: touch;
        }

        .chat-header {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
        }

        .chat-title {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
            text-align: center;
            flex-grow: 1;
        }

        .back-button, .theme-toggle {
            background: none;
            border: none;
            padding: 8px;
            cursor: pointer;
            color: var(--accent-color);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .theme-toggle .sun { display: block; }
        .theme-toggle .moon { display: none; }
        body.dark-mode .theme-toggle .sun { display: none; }
        body.dark-mode .theme-toggle .moon { display: block; }

        /* --- FORMULÁRIO --- */
        #consultation-form {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .form-group label {
            font-size: 15px;
            font-weight: 500;
            color: var(--text-primary);
            padding-left: 4px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 14px 16px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            background-color: var(--bg-secondary);
            color: var(--text-primary);
            font-family: var(--font-family);
            font-size: 16px;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px var(--accent-color-translucent);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
            color: var(--text-placeholder);
        }

        .form-group select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%239e9e9e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
            background-repeat: no-repeat;
            background-position: right 16px center;
        }

        .form-group textarea { resize: vertical; min-height: 90px; }

        .submit-btn {
            width: 100%;
            padding: 16px;
            margin-top: 16px;
            border-radius: 12px;
            border: none;
            background-color: var(--accent-color);
            color: var(--text-accent);
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s, opacity 0.2s;
        }
        .submit-btn:hover { opacity: 0.9; }
        .submit-btn:active { transform: scale(0.98); }

        /* --- ÁREA DE RESULTADO --- */
        #consultation-form.hidden { display: none; }
        .ai-result-container { display: none; }
        .ai-result-container.visible { display: block; }

        .spinner-container {
            display: none;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 40px 0;
            color: var(--text-secondary);
        }
        .spinner-container.visible { display: flex; }
        .spinner {
            width: 32px; height: 32px;
            border: 4px solid var(--border-color);
            border-top-color: var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* --- GRÁFICOS --- */
        #graficos-wrapper {
            display: flex;
            flex-direction: column; /* Mobile first: empilhado */
            gap: 30px;
            margin-bottom: 25px;
        }

        .grafico-container {
            width: 100%;
            padding: 20px;
            background-color: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }

        .grafico-container h4 {
            margin-top: 0;
            margin-bottom: 15px;
            text-align: center;
            font-size: 16px;
            color: var(--text-secondary);
            font-weight: 500;
        }

        /* --- ÁREA DE TEXTO DA ANÁLISE --- */
        #texto-analise {
            padding: 20px;
            margin-top: 20px;
            background-color: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }
        .result-text h3 { margin-top: 0; margin-bottom: 1rem; font-size: 1.2rem; color: var(--text-primary);}
        .result-text ul, .result-text ol { padding-left: 20px; }
        .result-text li { margin-bottom: 8px; line-height: 1.6; }
        .result-text p { margin-top: 0; line-height: 1.6; }
        .result-text strong { font-weight: 600; color: var(--text-primary); }

        .result-actions {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-top: 24px;
        }

        /* --- DEBUG --- */
        #debug-container {
            margin-top: 20px; padding: 15px; background-color: #ffebee;
            border: 1px solid #e57373; border-radius: 8px; color: #333; display: none;
        }
        #debug-container h5 { margin-top: 0; color: #c62828; }
        #debug-output {
            white-space: pre-wrap; word-wrap: break-word; font-family: monospace;
            font-size: 12px; background-color: #fff; padding: 10px; border-radius: 4px;
            border: 1px solid #ffcdd2;
        }

        /* --- LAYOUT RESPONSIVO PARA TELAS MAIORES --- */
        @media (min-width: 768px) {
            .consultation-content { padding: 32px 48px; }
            #graficos-wrapper {
                flex-direction: row; /* Lado a lado */
                flex-wrap: wrap; /* Permite quebra de linha para formar grid */
                justify-content: space-between;
            }
            .grafico-container {
                flex: 1 1 calc(50% - 15px); /* Grid 2x2 com 30px de espaçamento */
                min-width: 300px;
            }
            .result-actions {
                flex-direction: row;
                justify-content: center;
            }
            .result-actions .submit-btn {
                width: auto;
                padding: 16px 32px;
            }
        }
    </style>
</head>

<body>
    <div class="app-container visible">
        <div id="consultation-screen" class="screen active">
            <header class="chat-header">
                <a href="index.html" class="back-button" aria-label="Voltar para Home">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </a>
                <h2 class="chat-title">Consulta Rápida</h2>
                <button id="theme-toggle-btn" class="theme-toggle" aria-label="Mudar tema">
                    <svg class="sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    <svg class="moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                </button>
            </header>

            <main class="consultation-content">
                <form id="consultation-form">
                    <div class="form-group"><label for="idade">Idade</label><input type="number" id="idade" name="idade" placeholder="Ex: 30" required></div>
                    <div class="form-group"><label for="sexo">Sexo</label><select id="sexo" name="sexo" required><option value="" disabled selected>Selecione...</option><option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="outro">Outro</option></select></div>
                    <div class="form-group"><label for="comorbidades">Tem comorbidades (doenças crônicas)? Se sim, quais?</label><textarea id="comorbidades" name="comorbidades" rows="3" placeholder="Ex: Diabetes tipo 2, Hipertensão. Se não tiver, deixe em branco."></textarea></div>
                    <div class="form-group"><label for="medicamentos">Toma algum medicamento de uso contínuo?</label><textarea id="medicamentos" name="medicamentos" rows="3" placeholder="Ex: Metformina 500mg. Se não tomar, deixe em branco."></textarea></div>
                    <div class="form-group"><label for="familiares">Algum familiar de primeiro grau tem doença crônica?</label><textarea id="familiares" name="familiares" rows="3" placeholder="Ex: Mãe com hipertensão, Pai com colesterol alto."></textarea></div>
                    <div class="form-group"><label for="sintomas">Quais sintomas você está sentindo?</label><textarea id="sintomas" name="sintomas" rows="4" placeholder="Descreva seus sintomas gerais aqui..." required></textarea></div>
                    <div class="form-group"><label for="frequencia">Com qual frequência sente esses sintomas?</label><input type="text" id="frequencia" name="frequencia" placeholder="Ex: Diariamente, 3 vezes por semana" required></div>
                    <div class="form-group"><label for="intensidade">Qual a intensidade desses sintomas?</label><select id="intensidade" name="intensidade" required><option value="" disabled selected>Selecione a intensidade...</option><option value="leve">Leve</option><option value="moderada">Moderada</option><option value="intensa">Intensa</option></select></div>
                    <div class="form-group"><label for="melhora-piora">Fez algo que melhorou ou piorou os sintomas?</label><textarea id="melhora-piora" name="melhora-piora" rows="3" placeholder="Ex: Piora ao deitar, melhora com bolsa de água quente"></textarea></div>
                    <button type="submit" class="submit-btn">Analisar e Obter Resultado</button>
                </form>

                <div id="ai-result" class="ai-result-container">
                    <div id="spinner" class="spinner-container">
                        <div class="spinner"></div>
                        <p>Baymax está analisando suas respostas...</p>
                    </div>
                    <div id="result-wrapper" style="display: none;">
                        <h3>Análise Visual</h3>
                        <div id="graficos-wrapper">
                            <div id="graficoHipoteses-container" class="grafico-container" style="display: none;">
                                <h4></h4><canvas id="graficoHipoteses"></canvas>
                            </div>
                            <div id="graficoNivelUrgencia-container" class="grafico-container" style="display: none;">
                                <h4></h4><canvas id="graficoNivelUrgencia"></canvas>
                            </div>
                            <div id="graficoFatoresRisco-container" class="grafico-container" style="display: none;">
                                <h4></h4><canvas id="graficoFatoresRisco"></canvas>
                            </div>
                            <div id="graficoPerfilSintomas-container" class="grafico-container" style="display: none;">
                                <h4></h4><canvas id="graficoPerfilSintomas"></canvas>
                            </div>
                        </div>
                        <div id="texto-analise">
                            <div id="result-content" class="result-text"></div>
                        </div>
                        <div class="result-actions">
                            <button id="export-pdf-btn" class="submit-btn" style="display: none; background-color: #555;">Exportar Relatório</button>
                            <button id="reset-btn" class="submit-btn" style="display: none;">Nova Consulta</button>
                        </div>
                        <div id="debug-container">
                            <h5>Falha ao processar a análise</h5>
                            <p>A resposta da IA não veio no formato JSON esperado. Por favor, tente novamente.</p>
                            <pre id="debug-output"></pre>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // --- LÓGICA DE TEMA ---
            const themeToggleButton = document.getElementById('theme-toggle-btn');
            const body = document.body;
            if (themeToggleButton) {
                const applyTheme = (theme) => body.classList.toggle('dark-mode', theme === 'dark');
                themeToggleButton.addEventListener('click', () => {
                    const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
                    applyTheme(newTheme);
                    localStorage.setItem('theme', newTheme);
                });
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (savedTheme) { applyTheme(savedTheme); }
                else if (prefersDark) { applyTheme('dark'); }
            }

            // --- SELETORES DE ELEMENTOS ---
            const consultationForm = document.getElementById('consultation-form');
            const aiResultContainer = document.getElementById('ai-result');
            const spinner = document.getElementById('spinner');
            const resultWrapper = document.getElementById('result-wrapper');
            const resultContent = document.getElementById('result-content');
            const resetButton = document.getElementById('reset-btn');
            const exportPdfButton = document.getElementById('export-pdf-btn');
            const debugContainer = document.getElementById('debug-container');
            const debugOutput = document.getElementById('debug-output');
            let chartInstances = {};
            let lastAiData = null;

            // --- PLUGIN DO GRÁFICO GAUGE ---
            const gaugeTextPlugin = {
                id: 'gaugeText',
                beforeDraw(chart) {
                    const { ctx, data, options } = chart;
                    if (!data.datasets[0].gaugeData) return;

                    const { text, fontColor } = data.datasets[0].gaugeData;
                    const { width, height } = chart;
                    ctx.save();
                    ctx.font = `600 1.2rem ${Chart.defaults.font.family}`;
                    ctx.fillStyle = fontColor;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const textX = width / 2;
                    const textY = height / 2 + (height * 0.15); // Ajuste vertical
                    ctx.fillText(text, textX, textY);
                    ctx.restore();
                }
            };
            Chart.register(gaugeTextPlugin);

            // --- SUBMISSÃO DO FORMULÁRIO ---
            consultationForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = new FormData(consultationForm);
                const data = Object.fromEntries(formData.entries());

                // Transição de telas
                consultationForm.classList.add('hidden');
                aiResultContainer.classList.add('visible');
                spinner.classList.add('visible');
                resultWrapper.style.display = 'none';
                debugContainer.style.display = 'none';
                lastAiData = null;

                // --- PROMPT PARA A IA ---
                let prompt = "Você é um assistente de pré-análise médica chamado Baymax.\n\n";
                prompt += "**DADOS DO PACIENTE PARA ANÁLISE (USE ESTRITAMENTE ESTES DADOS):**\n";
                prompt += `- Idade: ${data.idade || 'Não informado'}\n`;
                prompt += `- Sexo: ${data.sexo || 'Não informado'}\n`;
                prompt += `- Sintomas Principais: ${data.sintomas || 'Não informado'}\n`;
                prompt += `- Frequência: ${data.frequencia || 'Não informado'}\n`;
                prompt += `- Intensidade: ${data.intensidade || 'Não informado'}\n`;
                prompt += `- Fatores de Melhora/Piora: ${data['melhora-piora'] || 'Não informado'}\n`;
                prompt += `- Comorbidades: ${data.comorbidades || 'Nenhuma'}\n`;
                prompt += `- Histórico Familiar: ${data.familiares || 'Nenhum'}\n\n`;

                prompt += "**SUA TAREFA:**\n";
                prompt += "1.  **CRIE UMA ANÁLISE TEXTUAL:** Escreva em português do Brasil e em formato Markdown, usando **estritamente** os dados do paciente. **Não adicione ou invente nenhuma informação**. A análise deve ter as seções: ### Resumo do Caso, ### Possíveis Hipóteses Preliminares, ### Recomendações e Próximos Passos.\n";
                prompt += "2.  **FORMATE A SAÍDA:** Sua resposta final deve ser **apenas** um objeto JSON válido. Use a análise que você criou e gere dados realistas para os gráficos.\n";
                prompt += '{\n';
                prompt += '  "analise_texto": "COLE AQUI A ANÁLISE COMPLETA EM MARKDOWN.",\n';
                prompt += '  "aviso_legal": "Lembre-se que esta é uma análise preliminar baseada em inteligência artificial e não substitui, em nenhuma hipótese, uma consulta e um diagnóstico médico profissional. Procure um médico para uma avaliação completa.",\n';
                prompt += '  "graficos": [\n';
                prompt += '    {\n';
                prompt += '      "id": "graficoHipoteses", "tipo": "doughnut", "titulo": "Hipóteses Relativas",\n';
                prompt += '      "dados": { "labels": ["(Hipótese 1)", "(Hipótese 2)", "Outras"], "valores": [55, 35, 10] }\n';
                prompt += '    },\n';
                prompt += '    {\n';
                prompt += '      "id": "graficoNivelUrgencia", "tipo": "gauge", "titulo": "Nível de Urgência",\n';
                prompt += '      "dados": { "valor": 75, "nivel": "Moderada" }\n';
                prompt += '    },\n';
                prompt += '    {\n';
                prompt += '      "id": "graficoFatoresRisco", "tipo": "bar", "titulo": "Fatores de Risco Relevantes",\n';
                prompt += '      "dados": { "labels": ["Hist. Familiar", "Comorbidades", "Idade"], "valores": [8, 6, 4] }\n';
                prompt += '    },\n';
                prompt += '    {\n';
                prompt += '      "id": "graficoPerfilSintomas", "tipo": "radar", "titulo": "Perfil dos Sintomas",\n';
                prompt += '      "dados": { "labels": ["Intensidade", "Frequência", "Impacto"], "valores": [7, 8, 6] }\n';
                prompt += '    }\n';
                prompt += '  ]\n';
                prompt += '}';

                try {
                    const response = await fetch('https://chat-bot-bia-api.onrender.com/send-msg', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ history: [], newMessage: prompt })
                    });
                    if (!response.ok) throw new Error('Erro de comunicação com a API: ' + response.statusText);
                    
                    const result = await response.json();
                    
                    try {
                        lastAiData = JSON.parse(result.msg);
                    } catch (e) {
                        console.error("Erro ao interpretar a resposta da IA:", result.msg);
                        debugOutput.textContent = result.msg;
                        debugContainer.style.display = 'block';
                        throw new Error("A IA retornou uma resposta em formato inválido.");
                    }
                    
                    const textoCompleto = marked.parse((lastAiData.analise_texto || "Nenhuma análise textual foi retornada.") + "\n\n**Aviso Importante:**\n" + (lastAiData.aviso_legal || ""));
                    resultContent.innerHTML = textoCompleto;

                    renderCharts(lastAiData.graficos);

                    spinner.classList.remove('visible');
                    resultWrapper.style.display = 'block';
                    resetButton.style.display = 'inline-block';
                    exportPdfButton.style.display = 'inline-block';

                } catch (error) {
                    console.error('Erro no processo de analise:', error);
                    spinner.classList.remove('visible');
                    resultWrapper.style.display = 'block';
                    if (debugContainer.style.display !== 'block') {
                        resultContent.innerHTML = `<p><strong>Ocorreu um erro no processo de analise.</strong></p><p><i>${error.message}</i></p>`;
                    }
                    resetButton.style.display = 'inline-block';
                }
            });

            // --- FUNÇÃO PARA RENDERIZAR GRÁFICOS ---
            function renderCharts(graficosData) {
                Object.values(chartInstances).forEach(chart => chart.destroy());
                chartInstances = {};
                document.querySelectorAll('.grafico-container').forEach(c => c.style.display = 'none');

                if (!graficosData || !Array.isArray(graficosData)) return;

                const style = getComputedStyle(document.body);
                const chartColors = {
                    text: style.getPropertyValue('--text-secondary').trim(),
                    grid: style.getPropertyValue('--border-color').trim(),
                    bg: style.getPropertyValue('--bg-primary').trim(),
                    accent: style.getPropertyValue('--accent-color').trim(),
                    palette: ['rgba(0, 122, 255, 0.8)', 'rgba(52, 199, 89, 0.8)', 'rgba(255, 149, 0, 0.8)', 'rgba(88, 86, 214, 0.8)', 'rgba(175, 82, 222, 0.8)']
                };
                Chart.defaults.font.family = "'Inter', sans-serif";
                Chart.defaults.color = chartColors.text;

                graficosData.forEach(grafico => {
                    if (!grafico || !grafico.id || !grafico.dados) return;
                    const container = document.getElementById(grafico.id + '-container');
                    if (!container) return;
                    
                    const canvas = document.getElementById(grafico.id);
                    const titulo = container.querySelector('h4');
                    container.style.display = 'block';
                    titulo.innerText = grafico.titulo;
                    
                    const baseOptions = { responsive: true, maintainAspectRatio: false };

                    if (grafico.tipo === 'doughnut') {
                        chartInstances[grafico.id] = new Chart(canvas, {
                            type: 'doughnut',
                            data: {
                                labels: grafico.dados.labels,
                                datasets: [{ data: grafico.dados.valores, backgroundColor: chartColors.palette, borderColor: chartColors.bg, borderWidth: 3 }]
                            },
                            options: { ...baseOptions, plugins: { legend: { position: 'top', labels: { padding: 15 } } } }
                        });
                    } else if (grafico.tipo === 'gauge') {
                        const valor = grafico.dados.valor;
                        const cor = valor > 70 ? 'rgba(255, 59, 48, 0.9)' : valor > 40 ? 'rgba(255, 204, 0, 0.9)' : 'rgba(52, 199, 89, 0.9)';
                        chartInstances[grafico.id] = new Chart(canvas, {
                            type: 'doughnut',
                            data: {
                                datasets: [{
                                    data: [valor, 100 - valor],
                                    backgroundColor: [cor, 'rgba(120, 120, 128, 0.16)'],
                                    borderColor: chartColors.bg,
                                    borderWidth: 3,
                                    circumference: 180,
                                    rotation: 270,
                                    gaugeData: { text: grafico.dados.nivel, fontColor: cor }
                                }]
                            },
                            options: { ...baseOptions, cutout: '60%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
                        });
                    } else if (grafico.tipo === 'bar') {
                        chartInstances[grafico.id] = new Chart(canvas, {
                            type: 'bar',
                            data: {
                                labels: grafico.dados.labels,
                                datasets: [{
                                    label: 'Nível de Risco (0-10)',
                                    data: grafico.dados.valores,
                                    backgroundColor: chartColors.accent
                                }]
                            },
                            options: { ...baseOptions, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, max: 10, grid: { color: chartColors.grid } }, y: { grid: { display: false } } } }
                        });
                    } else if (grafico.tipo === 'radar') {
                        chartInstances[grafico.id] = new Chart(canvas, {
                            type: 'radar',
                            data: {
                                labels: grafico.dados.labels,
                                datasets: [{
                                    label: 'Perfil (0-10)',
                                    data: grafico.dados.valores,
                                    backgroundColor: 'rgba(0, 122, 255, 0.2)',
                                    borderColor: chartColors.accent,
                                    pointBackgroundColor: chartColors.accent,
                                    pointBorderColor: '#fff',
                                    pointHoverBackgroundColor: '#fff',
                                    pointHoverBorderColor: chartColors.accent
                                }]
                            },
                            options: { ...baseOptions, plugins: { legend: { display: false } }, scales: { r: { beginAtZero: true, max: 10, grid: { color: chartColors.grid }, pointLabels: { font: { size: 13 } } } } }
                        });
                    }
                });
            }

            // --- EXPORTAR PARA PDF ---
            exportPdfButton.addEventListener('click', () => {
                if (!lastAiData) return;

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                const margin = 15;
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                let y = margin;

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(22).setTextColor(40, 40, 40).text("Relatório de Pré-Análise", pageWidth / 2, y, { align: "center" });
                y += 8;
                const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12).setTextColor(100, 100, 100).text("Gerado por Baymax em " + dataAtual, pageWidth / 2, y, { align: "center" });
                y += 15;

                const canvases = [
                    document.getElementById('graficoHipoteses'), document.getElementById('graficoNivelUrgencia'),
                    document.getElementById('graficoFatoresRisco'), document.getElementById('graficoPerfilSintomas')
                ];
                const chartWidth = (pageWidth - margin * 3) / 2;
                const chartHeight = chartWidth * 0.8; 

                // Adiciona gráficos em grid 2x2
                if (canvases[0].style.display !== 'none') doc.addImage(canvases[0].toDataURL('image/png', 1.0), 'PNG', margin, y, chartWidth, chartHeight);
                if (canvases[1].style.display !== 'none') doc.addImage(canvases[1].toDataURL('image/png', 1.0), 'PNG', margin + chartWidth + margin, y, chartWidth, chartHeight);
                y += chartHeight + margin;
                if (canvases[2].style.display !== 'none') doc.addImage(canvases[2].toDataURL('image/png', 1.0), 'PNG', margin, y, chartWidth, chartHeight);
                if (canvases[3].style.display !== 'none') doc.addImage(canvases[3].toDataURL('image/png', 1.0), 'PNG', margin + chartWidth + margin, y, chartWidth, chartHeight);
                y += chartHeight + margin;

                if (y > pageHeight - 40) { doc.addPage(); y = margin; }
                
                doc.setFontSize(11).setTextColor(80, 80, 80);
                const sourceElement = document.createElement('div');
                sourceElement.innerHTML = marked.parse(lastAiData.analise_texto || '');
                doc.html(sourceElement, {
                    x: margin,
                    y: y,
                    width: pageWidth - (margin * 2),
                    windowWidth: 650,
                    callback: function (doc) {
                        y = doc.previousAutoTable.finalY || y; // Pega a posição final
                        // Adiciona aviso legal no rodapé
                        y = pageHeight - margin - 20; // Posição fixa no rodapé
                        doc.setFontSize(9).setTextColor(150, 150, 150);
                        const avisoLines = doc.splitTextToSize(lastAiData.aviso_legal, pageWidth - (margin * 2));
                        doc.text(avisoLines, margin, y);
                        doc.save('relatorio-baymax.pdf');
                    }
                });
            });

            // --- BOTÃO DE NOVA CONSULTA ---
            resetButton.addEventListener('click', () => {
                aiResultContainer.classList.remove('visible');
                consultationForm.classList.remove('hidden');
                consultationForm.reset();
            });
        });
    </script>
</body>
</html>