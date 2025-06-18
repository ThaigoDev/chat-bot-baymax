document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores de Elementos ---
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

    let replyMessageContent = null;

    // --- Lógica de Navegação ---
    startChatBtn.addEventListener('click', () => {
        homeScreen.classList.remove('active');
        chatScreen.classList.add('active');
    });

    backToHomeBtn.addEventListener('click', () => {
        chatScreen.classList.remove('active');
        homeScreen.classList.add('active');
    });

    // --- Lógica do Chat ---
    // ALTERAÇÃO 1: A função agora aceita um terceiro parâmetro opcional "replyToText".
    const addMessage = (text, sender, replyToText = null) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', sender);

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble', sender);

        // ALTERAÇÃO 2: Se for uma mensagem do usuário e houver um texto de resposta,
        // cria o elemento visual da citação.
        if (sender === 'user' && replyToText) {
            const replyQuote = document.createElement('div');
            replyQuote.classList.add('reply-quote');
            replyQuote.textContent = replyToText;
            messageBubble.appendChild(replyQuote);
        }
        
        // Adiciona o texto principal da mensagem
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
        messagesList.scrollTop = messagesList.scrollHeight; // Scroll para o fim
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
        if(show) {
            typingIndicator.classList.remove('hidden');
        } else {
            typingIndicator.classList.add('hidden');
        }
        messagesList.scrollTop = messagesList.scrollHeight;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Captura o contexto ANTES de limpar
        let contextMessage = replyMessageContent;
        
        // ALTERAÇÃO 3: Passa o "contextMessage" para a função addMessage
        // para que ela possa exibir a citação visualmente.
        addMessage(userMessage, 'user', contextMessage);
        
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        toggleTypingIndicator(true);
        
        clearReplyContext();

        const botResponse = await getBotResponse(userMessage, contextMessage);
        
        addMessage(botResponse, 'bot');
        toggleTypingIndicator(false);
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    });
    
    // --- LÓGICA DA API (NÃO PRECISA MUDAR) ---
    const getBotResponse = async (userMessage, contextMessage) => {
        const apiUrl = `https://chat-bot-bia-api.onrender.com/send-msg`; 
        let promptContext = '';
        if (contextMessage) {
            promptContext = `Em resposta à afirmação anterior do assistente: "${contextMessage}", o utilizador pergunta:`;
        }
        const prompt = `Você é um assistente de saúde virtual. O seu nome é B.I.A. Responda à seguinte pergunta de forma simples, clara e em linguagem completamente leiga, como se estivesse a falar com alguém sem qualquer conhecimento médico. Evite ao máximo jargões técnicos. 
        ${promptContext}
        Pergunta do utilizador: "${userMessage}"
        No final de cada resposta, adicione sempre, em uma nova linha, o aviso: "Lembre-se, esta informação não substitui uma consulta médica." Se a pergunta não for relacionada à saúde, retorne uma resposta dizendo que não foi programado para responder perguntas assim e não utilize a frase "Lembre-se, esta informação não substitui uma consulta médica." caso a resposta não esteja de acordo com saúde. NUNCA RESPONDA NADA QUE NÃO ESTEJA NO CONTEXTO DE SAÚDE.`;
        const payload = { prompt: prompt };
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const result = await response.json();
            if (result && result.msg) {
                return result.msg.trim();
            }
            return 'Peço desculpa, mas não consegui processar a sua resposta neste momento.';
        } catch (error) {
            console.error("Erro ao contactar o backend:", error);
            return 'Lamento, estou com dificuldades técnicas. Por favor, tente novamente mais tarde.';
        }
    };
    
    // Adicionar mensagem inicial
    addMessage('Olá! Sou B.I.A, o seu assistente de saúde. Como posso ajudar?', 'bot');
});