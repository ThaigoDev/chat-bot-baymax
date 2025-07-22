document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DE SELETOR DE TEMA (COM MAIS SEGURANÇA) ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;

    const applySavedTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    };
    
    // VERIFICA SE O BOTÃO EXISTE ANTES DE ADICIONAR O EVENTO
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    applySavedTheme();

    // --- LÓGICA ORIGINAL DE LEMBRETES (MANTIDA) ---

    const reminderForm = document.getElementById('add-reminder-form');
    const reminderTextInput = document.getElementById('reminder-text');
    const reminderTimeInput = document.getElementById('reminder-time');
    const remindersList = document.getElementById('reminders-list');
    const storageKey = 'healthAppReminders';

    const getReminders = () => {
        const reminders = localStorage.getItem(storageKey);
        return reminders ? JSON.parse(reminders) : [];
    };

    const saveReminders = (reminders) => {
        localStorage.setItem(storageKey, JSON.stringify(reminders));
    };

    const renderReminders = () => {
        const reminders = getReminders();
        remindersList.innerHTML = '';

        if (reminders.length === 0) {
            remindersList.innerHTML = `<p class="empty-list-message">Nenhum lembrete adicionado ainda.</p>`;
            return;
        }

        reminders.sort((a, b) => a.time.localeCompare(b.time));

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

    reminderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = reminderTextInput.value.trim();
        const time = reminderTimeInput.value;

        if (!text || !time) {
            alert('Por favor, preencha a descrição e o horário do lembrete.');
            return;
        }

        const newReminder = {
            id: Date.now(),
            text: text,
            time: time,
        };

        const reminders = getReminders();
        reminders.push(newReminder);
        saveReminders(reminders);
        reminderForm.reset();
        renderReminders();
    });

    remindersList.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-reminder-btn');
        if (deleteButton) {
            const reminderId = Number(deleteButton.dataset.id);
            let reminders = getReminders();
            reminders = reminders.filter(r => r.id !== reminderId);
            saveReminders(reminders);
            renderReminders();
        }
    });

    renderReminders();
});