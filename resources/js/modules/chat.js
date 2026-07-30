function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
}

function renderMessage(message, currentUserId) {
    const isMine = Number(message.sender_id) === Number(currentUserId);
    const wrapper = document.createElement('div');
    wrapper.className = `d-flex mb-2 ${isMine ? 'justify-content-end' : 'justify-content-start'}`;
    wrapper.dataset.messageId = message.id ?? '';

    const time = message.created_at
        ? new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : '';

    wrapper.innerHTML = `
        <div class="p-2 rounded ${isMine ? 'text-white' : 'bg-light'}" style="max-width:75%; ${isMine ? 'background: var(--fc-gradient-primary);' : ''}">
            <div>${escapeHtml(message.content)}</div>
            <div class="small ${isMine ? 'text-white-50' : 'text-muted'}">${time}</div>
        </div>
    `;

    return wrapper;
}

export function initChat() {
    const messagesEl = document.getElementById('chat-messages');
    if (!messagesEl) {
        return;
    }

    const form = document.getElementById('chat-send-form');
    const input = document.getElementById('chat-input');
    const pollUrl = messagesEl.dataset.pollUrl;
    const currentUserId = messagesEl.dataset.currentUserId;

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function lastMessageId() {
        const nodes = messagesEl.querySelectorAll('[data-message-id]');
        const last = nodes[nodes.length - 1];
        return last?.dataset.messageId || 0;
    }

    scrollToBottom();

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const content = input.value.trim();
        if (!content) {
            return;
        }

        const optimistic = renderMessage(
            { content, sender_id: currentUserId, created_at: new Date().toISOString() },
            currentUserId
        );
        optimistic.classList.add('opacity-50');
        messagesEl.appendChild(optimistic);
        scrollToBottom();
        input.value = '';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken(),
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            if (!response.ok) {
                throw new Error(`Send failed: ${response.status}`);
            }

            const body = await response.json();
            optimistic.dataset.messageId = body.message?.id ?? '';
            optimistic.classList.remove('opacity-50');
        } catch (error) {
            optimistic.classList.add('text-danger');
            console.error('Failed to send message', error);
        }
    });

    document.getElementById('inbox-back-btn')?.addEventListener('click', () => {
        document.querySelector('.fc-inbox-list')?.classList.remove('thread-open');
        document.querySelector('.fc-thread-pane')?.classList.remove('thread-open');
    });

    async function poll() {
        try {
            const after = lastMessageId();
            const response = await fetch(`${pollUrl}?after=${after}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
            });

            if (!response.ok) {
                return;
            }

            const body = await response.json();
            if (body.messages?.length) {
                body.messages.forEach((message) => {
                    if (!messagesEl.querySelector(`[data-message-id="${message.id}"]`)) {
                        messagesEl.appendChild(renderMessage(message, currentUserId));
                    }
                });
                scrollToBottom();
            }
        } catch (error) {
            console.error('Poll failed', error);
        }
    }

    const pusherKey = document.querySelector('meta[name="pusher-key"]')?.content;

    if (pusherKey && window.Echo) {
        const conversationId = messagesEl.dataset.conversationId;
        window.Echo.private(`conversation.${conversationId}`).listen('MessageSent', (event) => {
            if (!messagesEl.querySelector(`[data-message-id="${event.message.id}"]`)) {
                messagesEl.appendChild(renderMessage(event.message, currentUserId));
                scrollToBottom();
            }
        });
    } else {
        setInterval(poll, 5000);
    }
}
