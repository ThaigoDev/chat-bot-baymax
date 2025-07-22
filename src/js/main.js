document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DA INTRODUÇÃO COM ANIMAÇÕES ---
    const interactionScreen = document.getElementById('interaction-screen');
    const startBtn = document.getElementById('start-experience-btn');
    const videoSplashScreen = document.getElementById('video-splash-screen');
    const introVideo = document.getElementById('intro-video');
    const appContainer = document.querySelector('.app-container');

    // 1. Quando o usuário clica em "Entrar"
    startBtn.addEventListener('click', () => {
        // Esconde a tela de interação com animação
        interactionScreen.classList.add('hidden');
        
        // Prepara a tela do vídeo para aparecer
        videoSplashScreen.style.display = 'block';
        
        // Atraso mínimo para garantir que o 'display: block' seja processado antes de animar a opacidade
        setTimeout(() => {
            videoSplashScreen.style.opacity = '1';
        }, 50);

        // Toca o vídeo COM SOM (agora é permitido pelo navegador)
        introVideo.play().catch(error => {
            console.error("Erro ao tentar tocar o vídeo:", error);
            showApp(); // Se falhar, pula direto para o app
        });

        // Remove a tela de interação da DOM após a animação de saída
        setTimeout(() => {
            if (interactionScreen) interactionScreen.remove();
        }, 1000); 
    });

    // 2. Quando o vídeo termina
    introVideo.addEventListener('ended', () => {
        showApp();
    });

    // 3. Função para mostrar o app principal com animação
    function showApp() {
        // Garante que a função não execute duas vezes
        if (appContainer.classList.contains('visible')) return;
        
        // Inicia a animação de saída do vídeo (fade-out)
        videoSplashScreen.style.opacity = '0';
        
        // Inicia a animação de entrada do app (fade-in e scale-up)
        appContainer.classList.add('visible');

        // Remove a tela do vídeo da DOM após sua animação de saída
        setTimeout(() => {
            if (videoSplashScreen) videoSplashScreen.remove();
        }, 1200); // Duração da transição do vídeo
    }
    
    // --- SEU CÓDIGO ORIGINAL DO CHATBOT CONTINUA ABAIXO ---

    const homeScreen = document.getElementById('home-screen');
    const chatScreen = document.getElementById('chat-screen');
    const startChatBtn = document.getElementById('start-chat-btn');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesList = document.getElementById('messages-list');
    const typingIndicator = document.getElementById('typing-indicator');
    const replyContext = document.getElementById('reply-context');
    const replyContextText = document.getElementById('reply-context-text');
    const replyContextCloseBtn = document.getElementById('reply-context-close');

    let conversationHistory = [];
    let replyMessageContent = null;

    startChatBtn.addEventListener('click', () => {
        homeScreen.classList.remove('active');
        chatScreen.classList.add('active');
    });

    backToHomeBtn.addEventListener('click', () => {
        chatScreen.classList.remove('active');
        homeScreen.classList.add('active');
    });

    const addMessage = (text, sender, replyToText = null) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', sender);
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble', sender);
        if (sender === 'user' && replyToText) {
            const replyQuote = document.createElement('div');
            replyQuote.classList.add('reply-quote');
            replyQuote.textContent = replyToText;
            messageBubble.appendChild(replyQuote);
        }
        const mainMessageText = document.createTextNode(text);
        messageBubble.appendChild(mainMessageText);
        if (sender === 'bot') {
            const replyBtn = document.createElement('button');
            replyBtn.classList.add('reply-btn');
            replyBtn.setAttribute('aria-label', 'Responder');
            replyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>`;
            replyBtn.onclick = () => setReplyContext(text);
            wrapper.appendChild(messageBubble);
            wrapper.appendChild(replyBtn);
        } else {
            wrapper.appendChild(messageBubble);
        }
        messagesList.appendChild(wrapper);
        messagesList.scrollTop = messagesList.scrollHeight;
    };
    
    const setReplyContext = (text) => {
        replyMessageContent = text;
        replyContextText.textContent = `Respondendo a: "${text}"`;
        replyContext.classList.add('active');
        chatInput.focus();
    };

    const clearReplyContext = () => {
        replyMessageContent = null;
        replyContext.classList.remove('active');
    }

    replyContextCloseBtn.addEventListener('click', clearReplyContext);

    const toggleTypingIndicator = (show) => {
        typingIndicator.classList.toggle('hidden', !show);
        if(show) messagesList.scrollTop = messagesList.scrollHeight;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        const contextMessage = replyMessageContent; 
        addMessage(userMessage, 'user', contextMessage);
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        toggleTypingIndicator(true);
        clearReplyContext();

        const botResponse = await getBotResponse(conversationHistory, userMessage, contextMessage);
        conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        conversationHistory.push({ role: 'model', parts: [{ text: botResponse }] });
        
        toggleTypingIndicator(false);
        addMessage(botResponse, 'bot');
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    });

    const getBotResponse = async (history, newMessage, contextMessage) => {
        const apiUrl = `https://chat-bot-bia-api.onrender.com/send-msg`; 
        const systemInstruction = `Você é um assistente de saúde virtual chamado Baymax. Responda de forma simples, clara e em linguagem leiga, evitando jargões técnicos. Ao final de cada resposta sobre saúde, adicione em uma nova linha o aviso: "Lembre-se, esta informação não substitui uma consulta médica.". Se a pergunta não for sobre saúde, diga que não foi programado para isso e não adicione o aviso. NUNCA RESPONDA NADA FORA DO CONTEXTO DE SAÚDE.`;
        let messageToSend = newMessage;
        if(contextMessage) {
            messageToSend = `(Respondendo à sua mensagem anterior: "${contextMessage}")\n\n${newMessage}`;
        }
        const payload = {
            history: [
                { role: 'user', parts: [{ text: systemInstruction }]},
                { role: 'model', parts: [{ text: 'Entendido. Sou o Baymax, seu assistente de saúde. Pode perguntar.'}]},
                ...history 
            ],
            newMessage: messageToSend
        };
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
            const result = await response.json();
            return result.msg ? result.msg.trim() : 'Não consegui processar a resposta neste momento.';
        } catch (error) {
            console.error("Erro ao contactar o backend:", error);
            return 'Lamento, estou com dificuldades técnicas. Por favor, tente novamente mais tarde.';
        }
    };
    
    addMessage('Olá! Eu sou o Baymax. Para começar, faça uma pergunta ou descreva seus sintomas.', 'bot');
});