// ARQUIVO: src/js/lembretes.js

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos da página
    const reminderForm = document.getElementById('add-reminder-form');
    const reminderTextInput = document.getElementById('reminder-text');
    const reminderTimeInput = document.getElementById('reminder-time');
    const remindersList = document.getElementById('reminders-list');
    const storageKey = 'healthAppReminders';

    // --- Funções de Lógica ---

    /**
     * Busca os lembretes do Local Storage.
     * @returns {Array} Uma lista de objetos de lembrete.
     */
    const getReminders = () => {
        const reminders = localStorage.getItem(storageKey);
        // Se não houver nada, retorna uma lista vazia.
        // Se houver, converte a string JSON de volta para um array.
        return reminders ? JSON.parse(reminders) : [];
    };

    /**
     * Salva a lista de lembretes no Local Storage.
     * @param {Array} reminders A lista de lembretes para salvar.
     */
    const saveReminders = (reminders) => {
        localStorage.setItem(storageKey, JSON.stringify(reminders));
    };

    /**
     * Renderiza a lista de lembretes na tela.
     */
    const renderReminders = () => {
        const reminders = getReminders();
        
        // Limpa a lista atual antes de renderizar
        remindersList.innerHTML = '';

        // Se a lista estiver vazia, mostra uma mensagem
        if (reminders.length === 0) {
            remindersList.innerHTML = `<p class="empty-list-message">Nenhum lembrete adicionado ainda.</p>`;
            return;
        }

        // Ordena os lembretes por hora
        reminders.sort((a, b) => a.time.localeCompare(b.time));

        // Cria e adiciona o elemento HTML para cada lembrete
        reminders.forEach(reminder => {
            const card = document.createElement('div');
            card.className = 'reminder-card';

            card.innerHTML = `
                <div class="reminder-info">
                    <span class="time">${reminder.time}</span>
                    <span class="text">${reminder.text}</span>
                </div>
                <button class="delete-reminder-btn" data-id="${reminder.id}" aria-label="Deletar lembrete">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            `;
            remindersList.appendChild(card);
        });
    };

    // --- Manipuladores de Eventos ---

    // Evento de envio do formulário para adicionar um novo lembrete
    reminderForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        const text = reminderTextInput.value.trim();
        const time = reminderTimeInput.value;

        // Validação simples para não adicionar lembretes vazios
        if (!text || !time) {
            alert('Por favor, preencha a descrição e o horário do lembrete.');
            return;
        }

        const newReminder = {
            id: Date.now(), // Gera um ID único baseado no tempo atual
            text: text,
            time: time,
        };

        const reminders = getReminders();
        reminders.push(newReminder); // Adiciona o novo lembrete à lista
        saveReminders(reminders); // Salva a lista atualizada

        renderReminders(); // Re-renderiza a lista na tela

        // Limpa os campos do formulário
        reminderTextInput.value = '';
        reminderTimeInput.value = '';
    });

    // Evento de clique na lista para deletar um lembrete (usando delegação de eventos)
    remindersList.addEventListener('click', (e) => {
        // Verifica se o elemento clicado (ou um elemento pai próximo) é o botão de deletar
        const deleteButton = e.target.closest('.delete-reminder-btn');
        
        if (deleteButton) {
            const reminderId = Number(deleteButton.dataset.id); // Pega o ID do atributo 'data-id'
            
            let reminders = getReminders();
            // Filtra a lista, mantendo apenas os lembretes com ID diferente
            reminders = reminders.filter(r => r.id !== reminderId);
            saveReminders(reminders); // Salva a nova lista sem o item deletado

            renderReminders(); // Re-renderiza a lista
        }
    });

    // --- Início do Processo ---
    renderReminders(); // Renderiza os lembretes salvos assim que a página carrega
});