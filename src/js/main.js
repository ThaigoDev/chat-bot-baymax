// Arquivo: src/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÃO DO FIREBASE ---
    const firebaseConfig = {
        apiKey: "AIzaSyCGWVbfV0u0MVpbmqQBOSfaI6DGbx3zK6g",
        authDomain: "baymax-35aa0.firebaseapp.com",
        projectId: "baymax-35aa0",
        storageBucket: "baymax-35aa0.appspot.com",
        messagingSenderId: "973348487332",
        appId: "1:973348487332:web:11f4888e41d200a6322631",
        measurementId: "G-B33T77QCLV"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const analytics = firebase.analytics(); // Inicializa o Analytics
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    
    // --- FUNÇÃO HELPER PARA ANALYTICS ---
    const logAnalyticsEvent = (eventName, params = {}) => {
        try {
            analytics.logEvent(eventName, params);
        } catch (error) {
            console.error(`Falha ao registrar evento de analytics: ${eventName}`, error);
        }
    };

    // --- SELETORES DE ELEMENTOS DO DOM ---
    const authContainer = document.getElementById('auth-container');
    const videoSplashScreen = document.getElementById('video-splash-screen');
    const appContainer = document.querySelector('.app-container');
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const googleSignInBtn = document.getElementById('google-signin-btn');
    const toggleLink = document.getElementById('toggle-link');
    const authError = document.getElementById('auth-error');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const toggleText = document.getElementById('toggle-text');

    const logoutBtn = document.getElementById('logout-btn');
    const userAvatarContainer = document.getElementById('user-avatar-container');
    const userGreeting = document.getElementById('user-greeting');
    const introVideo = document.getElementById('intro-video');

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
    const historyList = document.getElementById('history-list');
    const quickConsultLink = document.getElementById('quick-consult-link');
    const articlesLink = document.getElementById('articles-link');


    // --- LÓGICA DE AUTENTICAÇÃO ---
    auth.onAuthStateChanged(user => {
        if (user) {
            // Define o ID do usuário e propriedades para segmentação no Analytics
            analytics.setUserId(user.uid);
            analytics.setUserProperties({
                user_name: user.displayName ? user.displayName.split(' ')[0] : 'anonymous',
                user_email_provider: user.email ? user.email.split('@')[1] : 'unknown'
            });

            authContainer.classList.add('hidden');
            updateUserInfo(user);
            renderHistory();
            startVideoExperience();
        } else {
            authContainer.classList.remove('hidden');
            videoSplashScreen.style.display = 'none';
            appContainer.classList.remove('visible');
            sessionStorage.removeItem('introShown');
        }
    });

    googleSignInBtn.addEventListener('click', () => {
        auth.signInWithPopup(googleProvider)
            .then(() => logAnalyticsEvent('login', { method: 'google' }))
            .catch(handleAuthError);
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => logAnalyticsEvent('login', { method: 'email' }))
            .catch(handleAuthError);
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                logAnalyticsEvent('sign_up', { method: 'email' });
                return userCredential.user.updateProfile({ displayName: name });
            })
            .catch(handleAuthError);
    });

    logoutBtn.addEventListener('click', () => {
        logAnalyticsEvent('logout');
        auth.signOut();
    });

    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        logAnalyticsEvent('select_content', { content_type: 'auth_form_toggle' });
        loginForm.classList.toggle('hidden');
        registerForm.classList.toggle('hidden');
        authError.textContent = '';
        const isLoginFormVisible = !loginForm.classList.contains('hidden');
        authTitle.textContent = isLoginFormVisible ? 'Acesse sua Conta' : 'Crie sua Conta';
        authSubtitle.textContent = isLoginFormVisible ? 'Olá! Insira seus dados para continuar.' : 'É rápido e fácil.';
        toggleText.textContent = isLoginFormVisible ? 'Não tem uma conta?' : 'Já tem uma conta?';
        toggleLink.textContent = isLoginFormVisible ? 'Cadastre-se' : 'Faça login';
    });

    function updateUserInfo(user) {
        const defaultAvatar = 'src/utilites/baymaxicon.jpg';
        userAvatarContainer.innerHTML = `<img src="${user.photoURL || defaultAvatar}" alt="Avatar do usuário">`;
        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Usuário';
        userGreeting.textContent = `Olá, ${firstName}!`;
    }

    function handleAuthError(error) {
        logAnalyticsEvent('exception', { description: `auth_error_${error.code}`, fatal: false });
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                authError.textContent = 'Email ou senha inválidos.';
                break;
            case 'auth/email-already-in-use':
                authError.textContent = 'Este endereço de e-mail já está em uso.';
                break;
            case 'auth/weak-password':
                authError.textContent = 'A senha deve ter pelo menos 6 caracteres.';
                break;
            default:
                authError.textContent = 'Ocorreu um erro. Tente novamente.';
                console.error("Erro de autenticação:", error);
        }
    }

    // --- LÓGICA DE SELETOR DE TEMA ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;
    const applySavedTheme = () => body.classList.toggle('dark-mode', localStorage.getItem('theme') === 'dark');
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const newTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        logAnalyticsEvent('change_theme', { new_theme: newTheme });
    });
    applySavedTheme();

    // --- LÓGICA DA INTRODUÇÃO E APP ---
    function showApp() {
        if (appContainer.classList.contains('visible')) return;
        videoSplashScreen.style.opacity = '0';
        setTimeout(() => { videoSplashScreen.style.display = 'none'; }, 800);
        appContainer.classList.add('visible');
    }
    
    function startVideoExperience() {
        if (sessionStorage.getItem('introShown') === 'true') {
            showApp();
            return;
        }
        sessionStorage.setItem('introShown', 'true');
        videoSplashScreen.style.display = 'block';
        setTimeout(() => { videoSplashScreen.style.opacity = '1'; }, 50);

        introVideo.play().then(() => {
            logAnalyticsEvent('video_intro_played');
        }).catch(error => {
            console.error("Erro ao tentar tocar o vídeo:", error);
            showApp(); 
        });
    }

    introVideo.addEventListener('ended', showApp);
    
    // --- LÓGICA DO HISTÓRICO ---
    const HISTORY_KEY = 'baymax_chat_history';
    const MAX_HISTORY_ITEMS = 5;

    function getHistory() { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    function saveToHistory(message) {
        let history = getHistory();
        history = history.filter(item => item !== message);
        history.unshift(message);
        if (history.length > MAX_HISTORY_ITEMS) { history.pop(); }
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
    function renderHistory() {
        const history = getHistory();
        historyList.innerHTML = ''; 
        if (history.length === 0) {
            historyList.innerHTML = `<p class="empty-history">Seu histórico de conversas aparecerá aqui.</p>`;
            return;
        }
        history.forEach(itemText => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
                <p>${itemText}</p>`;
            historyItem.addEventListener('click', () => {
                logAnalyticsEvent('select_content', { content_type: 'chat_history', item_id: itemText.substring(0, 40) });
                homeScreen.classList.remove('active');
                chatScreen.classList.add('active');
                chatInput.value = itemText;
                chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
            });
            historyList.appendChild(historyItem);
        });
    }

    // --- CÓDIGO DO CHATBOT ---
    let conversationHistory = [];
    let replyMessageContent = null;

    startChatBtn.addEventListener('click', () => {
        logAnalyticsEvent('screen_view', { screen_name: 'chat_screen' });
        homeScreen.classList.remove('active');
        chatScreen.classList.add('active');
    });

    backToHomeBtn.addEventListener('click', () => {
        logAnalyticsEvent('screen_view', { screen_name: 'home_screen' });
        chatScreen.classList.remove('active');
        homeScreen.classList.add('active');
        renderHistory();
    });

    // --- LÓGICA PARA RECONHECIMENTO DE VOZ ---
    const micButton = document.getElementById('mic-button');

    // Verifica se o navegador suporta a Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
    
        // Configurações do reconhecimento
        recognition.lang = 'pt-BR'; // Define o idioma para Português do Brasil
        recognition.continuous = false; // Para de gravar após uma pausa na fala
        recognition.interimResults = false; // Não queremos resultados parciais

        micButton.addEventListener('click', () => {
            if (!recognition.isRecording) {
                try {
                    recognition.start();
                    micButton.classList.add('is-recording');
                    chatInput.placeholder = 'Ouvindo...';
                } catch(error) {
                    console.error("Erro ao iniciar o reconhecimento de voz:", error);
                }
            }
        });

    // Evento chamado quando a gravação é encerrada
    recognition.onend = () => {
        micButton.classList.remove('is-recording');
        chatInput.placeholder = 'Digite a sua dúvida aqui...';
    };

    // Evento chamado quando a IA transcreve a fala com sucesso
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript; // Coloca o texto transcrito no input
        
        // Opcional: envia a mensagem automaticamente após a transcrição
        // chatForm.dispatchEvent(new Event('submit'));
    };

    // Evento para lidar com erros
    recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
            console.log("Nenhuma fala foi detectada.");
            micButton.classList.remove('is-recording');
            chatInput.placeholder = 'Digite a sua dúvida aqui...';
            return; // Sai da função para não executar o código abaixo
        }

        // Para todos os outros erros (ex: microfone não permitido),
        // continuamos a mostrar o alerta, pois são problemas reais.
        console.error("Erro no reconhecimento de voz:", event.error);
        alert(`Erro no reconhecimento: ${event.error}. Verifique as permissões do microfone.`);
        micButton.classList.remove('is-recording');
        chatInput.placeholder = 'Digite a sua dúvida aqui...';
    };

    } else {
        // Esconde o botão se a API não for suportada
        console.warn("Seu navegador não suporta a Web Speech API.");
        micButton.style.display = 'none';
    }
    
    // Rastreia cliques nos links secundários
    quickConsultLink.addEventListener('click', () => logAnalyticsEvent('select_content', { content_type: 'link', item_id: 'quick_consult' }));
    articlesLink.addEventListener('click', () => logAnalyticsEvent('select_content', { content_type: 'link', item_id: 'articles' }));

    const addMessage = (text, sender, replyToText = null) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', sender);
        if (sender === 'bot') {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'bot-avatar';
            avatarDiv.innerHTML = `<img src="src/utilites/baymaxicon.jpg" alt="Avatar do Baymax">`;
            wrapper.appendChild(avatarDiv);
        }
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
        wrapper.appendChild(messageBubble);
        if (sender === 'bot') {
            const replyBtn = document.createElement('button');
            replyBtn.classList.add('reply-btn');
            replyBtn.setAttribute('aria-label', 'Responder');
            replyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>`;
            replyBtn.onclick = () => setReplyContext(text);
            wrapper.appendChild(replyBtn);
        }
        messagesList.appendChild(wrapper);
        messagesList.scrollTop = messagesList.scrollHeight;
    };
    
    const setReplyContext = (text) => {
        logAnalyticsEvent('chat_reply_start');
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
        const typingIndicator = document.getElementById('typing-indicator');
        typingIndicator.classList.toggle('hidden', !show);
        if(show) {
            messagesList.appendChild(typingIndicator);
            messagesList.scrollTop = messagesList.scrollHeight;
        }
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        const contextMessage = replyMessageContent; 
        logAnalyticsEvent('send_message', {
             message_length: userMessage.length,
             has_reply_context: !!contextMessage 
        });
        
        addMessage(userMessage, 'user', contextMessage);
        saveToHistory(userMessage);
        
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
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const result = await response.json();
            return result.msg ? result.msg.trim() : 'Não consegui processar a resposta neste momento.';
        } catch (error) {
            logAnalyticsEvent('exception', { description: 'api_error', fatal: false });
            console.error("Erro ao contactar o backend:", error);
            return 'Lamento, estou com dificuldades técnicas. O servidor parece estar com problemas. Por favor, tente novamente mais tarde.';
        }
    };
    
    addMessage('Olá! Eu sou o Baymax. Para começar, faça uma pergunta ou descreva seus sintomas.', 'bot');
});