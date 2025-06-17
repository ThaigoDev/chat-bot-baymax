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
    const addMessage = (text, sender) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', sender);

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble', sender);
        messageBubble.textContent = text;
        
        if(sender === 'bot') {
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

        addMessage(userMessage, 'user');
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        toggleTypingIndicator(true);
        
        let contextMessage = replyMessageContent;
        clearReplyContext();

        const botResponse = await getBotResponse(userMessage, contextMessage);
        
        addMessage(botResponse, 'bot');
        toggleTypingIndicator(false);
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    });
    
    // --- LÓGICA DA API GEMINI ---
    const getBotResponse = async (userMessage, contextMessage) => {
        const apiKey = "AIzaSyA-dOeIi5wpXzyUhDkLrFOyNELcodN_yWM"; // A plataforma irá fornecer a chave em tempo de execução
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        let promptContext = '';
        if (contextMessage) {
            promptContext = `Em resposta à afirmação anterior do assistente: "${contextMessage}", o utilizador pergunta:`;
        }

        const prompt = `Você é um assistente de saúde virtual. O seu nome é B.I.A. Responda à seguinte pergunta de forma simples, clara e em linguagem completamente leiga, como se estivesse a falar com alguém sem qualquer conhecimento médico. Evite ao máximo jargões técnicos.
        ${promptContext}
        Pergunta do utilizador: "${userMessage}"
        No final de cada resposta, adicione sempre, em uma nova linha, o aviso: "Lembre-se, esta informação não substitui uma consulta médica."`;
        
        const payload = { contents: [{ parts: [{ text: prompt }] }] };

        try {
            const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
                return result.candidates[0].content.parts[0].text.trim();
            }
            return 'Peço desculpa, mas não consegui processar a sua resposta neste momento.';
        } catch (error) {
            console.error("Erro ao contactar a API do Gemini:", error);
            return 'Lamento, estou com dificuldades técnicas. Por favor, tente novamente mais tarde.';
        }
    };
    
    // Adicionar mensagem inicial
    addMessage('Olá! Sou B.I.A, o seu assistente de saúde. Como posso ajudar?', 'bot');
});
