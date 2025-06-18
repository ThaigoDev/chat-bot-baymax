document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores de Elementos (sem alterações) ---
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

    // --- ALTERAÇÃO 1: Variáveis de Estado ---
    // Array para guardar o histórico da conversa no formato que a API do Gemini espera.
    let conversationHistory = [];
    let replyMessageContent = null;

    // --- Lógica de Navegação (sem alterações) ---
    startChatBtn.addEventListener('click', () => {
        homeScreen.classList.remove('active');
        chatScreen.classList.add('active');
    });

    backToHomeBtn.addEventListener('click', () => {
        chatScreen.classList.remove('active');
        homeScreen.classList.add('active');
    });

    // --- Lógica do Chat (função addMessage sem alterações) ---
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
        messagesList.scrollTop = messagesList.scrollHeight;
    }

    // --- ALTERAÇÃO 2: Lógica de Envio de Formulário ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        const contextMessage = replyMessageContent; // Pega o texto do reply, se houver.
        addMessage(userMessage, 'user', contextMessage);
        
        // Desabilita o input enquanto espera a resposta.
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        toggleTypingIndicator(true);
        clearReplyContext();

        // Chama a API com o histórico e a nova mensagem.
        const botResponse = await getBotResponse(conversationHistory, userMessage, contextMessage);
        
        // Adiciona a mensagem do usuário e a resposta do bot ao histórico para a próxima chamada.
        conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        conversationHistory.push({ role: 'model', parts: [{ text: botResponse }] });
        
        // Mostra a resposta do bot e reabilita o input.
        addMessage(botResponse, 'bot');
        toggleTypingIndicator(false);
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    });
    
    // --- ALTERAÇÃO 3: Lógica de chamada da API ---
    const getBotResponse = async (history, newMessage, contextMessage) => {
        const apiUrl = `https://chat-bot-bia-api.onrender.com/send-msg`; // << Substitua pela sua URL se for diferente
        
        // O prompt de sistema define o comportamento da IA e não precisa ser repetido no histórico.
        const systemInstruction = `Você é um assistente de saúde virtual chamado B.I.A. Responda de forma simples, clara e em linguagem leiga, evitando jargões técnicos. Ao final de cada resposta sobre saúde, adicione em uma nova linha o aviso: "Lembre-se, esta informação não substitui uma consulta médica.". Se a pergunta não for sobre saúde, diga que não foi programado para isso e não adicione o aviso. NUNCA RESPONDA NADA FORA DO CONTEXTO DE SAÚDE.`;
        
        // Se o usuário está respondendo a uma mensagem específica, damos uma dica extra para a IA.
        let messageToSend = newMessage;
        if(contextMessage) {
            messageToSend = `(Respondendo à sua mensagem anterior: "${contextMessage}")\n\n${newMessage}`;
        }
        
        const payload = {
            // O histórico é enviado para dar contexto à IA.
            // A instrução do sistema é adicionada no início do histórico.
            history: [
                { role: 'user', parts: [{ text: systemInstruction }]},
                { role: 'model', parts: [{ text: 'Entendido. Sou a B.I.A, sua assistente de saúde. Pode perguntar.'}]},
                ...history // Inclui todo o histórico da conversa atual.
            ],
            // A mensagem atual do usuário é enviada separadamente.
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
    
    // Adicionar mensagem inicial
    addMessage('Olá! Sou B.I.A, o seu assistente de saúde. Como posso ajudar?', 'bot');
});
