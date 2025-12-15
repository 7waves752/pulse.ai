// Кастомный красивый чат виджет для n8n
(function() {
    'use strict';

    const config = {
        webhookUrl: window.location.origin + '/api/n8n-chat',
        primaryColor: '#ff6b35',
        secondaryColor: '#ff8c42',
        botName: 'Pulse.AI',
        botAvatar: '⚡',
        autoOpen: true,
        autoOpenDelay: 2000,
        initialMessage: 'Привет! 👋 Я ИИ-ассистент Pulse.AI. Чем могу помочь?'
    };

    let sessionId = generateSessionId();
    let isOpen = false;
    let isTyping = false;

    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function createChatWidget() {
        const container = document.createElement('div');
        container.id = 'pulse-chat-widget';
        container.innerHTML = `
            <style>
                #pulse-chat-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 999999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                
                /* Пульсирующая кнопка */
                .chat-toggle-btn {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    transition: all 0.3s ease;
                    animation: pulse 2s infinite;
                    position: relative;
                }
                
                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
                    }
                    50% {
                        box-shadow: 0 4px 30px rgba(255, 107, 53, 0.8), 0 0 0 10px rgba(255, 107, 53, 0.1);
                    }
                }
                
                .chat-toggle-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 30px rgba(255, 107, 53, 0.6);
                }
                
                .chat-toggle-btn.open {
                    animation: none;
                }
                
                /* Окно чата */
                .chat-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 380px;
                    height: 550px;
                    background: #fff;
                    border-radius: 20px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    animation: slideUp 0.3s ease;
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .chat-window.visible {
                    display: flex;
                }
                
                /* Заголовок */
                .chat-header {
                    background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
                    color: white;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .chat-avatar {
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }
                
                .chat-title {
                    flex: 1;
                }
                
                .chat-title h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }
                
                .chat-title p {
                    margin: 0;
                    font-size: 12px;
                    opacity: 0.9;
                }
                
                .chat-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                
                .chat-close:hover {
                    opacity: 1;
                }
                
                /* Сообщения */
                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    background: #f8f9fa;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .message {
                    display: flex;
                    gap: 10px;
                    animation: messageSlide 0.3s ease;
                }
                
                @keyframes messageSlide {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .message.user {
                    flex-direction: row-reverse;
                }
                
                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: ${config.primaryColor};
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }
                
                .message.user .message-avatar {
                    background: #333;
                }
                
                .message-bubble {
                    max-width: 70%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    background: white;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                }
                
                .message.user .message-bubble {
                    background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
                    color: white;
                }
                
                /* Анимация печати */
                .typing-indicator {
                    display: flex;
                    gap: 4px;
                    padding: 12px 16px;
                }
                
                .typing-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: ${config.primaryColor};
                    animation: typingBounce 1.4s infinite;
                }
                
                .typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }
                
                .typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }
                
                @keyframes typingBounce {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-10px);
                    }
                }
                
                /* Ввод */
                .chat-input-container {
                    padding: 16px;
                    background: white;
                    border-top: 1px solid #e0e0e0;
                    display: flex;
                    gap: 8px;
                }
                
                .chat-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid #e0e0e0;
                    border-radius: 25px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                
                .chat-input:focus {
                    border-color: ${config.primaryColor};
                }
                
                .chat-send-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor});
                    border: none;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                }
                
                .chat-send-btn:hover {
                    transform: scale(1.1);
                }
                
                .chat-send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            </style>
            
            <button class="chat-toggle-btn" onclick="window.togglePulseChat()">
                ${config.botAvatar}
            </button>
            
            <div class="chat-window">
                <div class="chat-header">
                    <div class="chat-avatar">${config.botAvatar}</div>
                    <div class="chat-title">
                        <h3>${config.botName}</h3>
                        <p>Обычно отвечаем мгновенно</p>
                    </div>
                    <button class="chat-close" onclick="window.togglePulseChat()">×</button>
                </div>
                
                <div class="chat-messages" id="chat-messages"></div>
                
                <div class="chat-input-container">
                    <input 
                        type="text" 
                        class="chat-input" 
                        id="chat-input" 
                        placeholder="Напишите сообщение..."
                        onkeypress="if(event.key==='Enter') window.sendPulseMessage()"
                    >
                    <button class="chat-send-btn" onclick="window.sendPulseMessage()">
                        ➤
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
    }

    function addMessage(text, isUser = false) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        messageDiv.innerHTML = `
            <div class="message-avatar">${isUser ? '👤' : config.botAvatar}</div>
            <div class="message-bubble">${text}</div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTypingIndicator() {
        if (isTyping) return;
        isTyping = true;
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">${config.botAvatar}</div>
            <div class="message-bubble">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async function sendMessage(message) {
        if (!message.trim()) return;
        
        addMessage(message, true);
        document.getElementById('chat-input').value = '';
        
        showTypingIndicator();
        
        try {
            const response = await fetch(config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'sendMessage',
                    sessionId: sessionId,
                    chatInput: message
                })
            });
            
            const data = await response.json();
            
            setTimeout(() => {
                hideTypingIndicator();
                const botMessage = data.output || data.text || data.response || 'Извините, произошла ошибка';
                addMessage(botMessage);
            }, 500);
            
        } catch (error) {
            console.error('Ошибка отправки:', error);
            hideTypingIndicator();
            addMessage('Извините, не могу подключиться к серверу');
        }
    }

    function toggleChat() {
        const chatWindow = document.querySelector('.chat-window');
        const toggleBtn = document.querySelector('.chat-toggle-btn');
        
        isOpen = !isOpen;
        
        if (isOpen) {
            chatWindow.classList.add('visible');
            toggleBtn.classList.add('open');
            
            // Отправляем приветствие если чат пустой
            const messages = document.getElementById('chat-messages');
            if (messages.children.length === 0) {
                setTimeout(() => {
                    showTypingIndicator();
                    setTimeout(() => {
                        hideTypingIndicator();
                        addMessage(config.initialMessage);
                    }, 1000);
                }, 300);
            }
        } else {
            chatWindow.classList.remove('visible');
            toggleBtn.classList.remove('open');
        }
    }

    // Глобальные функции
    window.togglePulseChat = toggleChat;
    window.sendPulseMessage = function() {
        const input = document.getElementById('chat-input');
        sendMessage(input.value);
    };
    window.openChat = toggleChat;

    // Инициализация
    function init() {
        createChatWidget();
        
        // Автооткрытие через 2 секунды
        if (config.autoOpen) {
            setTimeout(() => {
                if (!isOpen) {
                    toggleChat();
                }
            }, config.autoOpenDelay);
        }
        
        console.log('✅ Pulse.AI Chat загружен!');
    }

    // Загружаем после DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
