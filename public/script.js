document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const tokenCounter = document.getElementById('token-counter');
    
    // Conversation history
    let conversationHistory = [
        {
            role: "system",
            content: "You are JARVIS, a helpful AI assistant. Respond in a friendly and professional manner. Keep responses concise but informative."
        },
        {
            role: "assistant",
            content: "Hello! I'm JARVIS, your AI assistant. How can I help you today?"
        }
    ];
    
    let totalTokens = 0;
    
    // Auto-scroll to bottom of chat
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Add message to chat
    function addMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;
        
        const senderDiv = document.createElement('div');
        senderDiv.className = 'message-sender';
        senderDiv.textContent = sender;
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(senderDiv);
        chatContainer.appendChild(messageDiv);
        
        scrollToBottom();
    }
    
    // Update token counter
    function updateTokenCounter(tokens) {
        totalTokens += tokens;
        tokenCounter.textContent = `Tokens used: ${totalTokens}`;
    }
    
    // Send message to server
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat and history
        addMessage('user', message);
        conversationHistory.push({
            role: "user",
            content: message
        });
        userInput.value = '';
        
        // Show typing indicator
        typingIndicator.style.display = 'block';
        scrollToBottom();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    messages: conversationHistory,
                    speak: false
                }),
            });
            
            const data = await response.json();
            
            // Hide typing indicator
            typingIndicator.style.display = 'none';
            
            // Add AI response to chat and history
            if (data.response) {
                addMessage('jarvis', data.response);
                conversationHistory.push({
                    role: "assistant",
                    content: data.response
                });
                
                // Update token counter
                if (data.tokensUsed) {
                    updateTokenCounter(data.tokensUsed);
                }
            }
        } catch (error) {
            typingIndicator.style.display = 'none';
            addMessage('jarvis', 'Sorry, there was an error processing your request. Please try again.');
            console.error('Error:', error);
        }
    }
    
    // Handle voice input
    voiceBtn.addEventListener('click', async () => {
        if (!('webkitSpeechRecognition' in window)) {
            addMessage('jarvis', 'Your browser doesn\'t support speech recognition. Try Chrome or Edge.');
            return;
        }
        
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            userInput.placeholder = "Listening...";
            voiceBtn.style.backgroundColor = '#ff4444';
            voiceBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="9" y="3" width="6" height="12" rx="3" fill="white"/>
                    <rect x="5" y="10" width="3" height="5" rx="1.5" fill="white"/>
                    <rect x="16" y="10" width="3" height="5" rx="1.5" fill="white"/>
                </svg>
            `;
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            userInput.placeholder = "Type your message here...";
            voiceBtn.style.backgroundColor = '';
            voiceBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" fill="white"/>
                    <path d="M5 11C5.55228 11 6 11.4477 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 11.4477 18.4477 11 19 11C19.5523 11 20 11.4477 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 11.4477 4.44772 11 5 11Z" fill="white"/>
                    <path d="M12 19C12.5523 19 13 19.4477 13 20V23C13 23.5523 12.5523 24 12 24C11.4477 24 11 23.5523 11 23V20C11 19.4477 11.4477 19 12 19Z" fill="white"/>
                </svg>
            `;
            sendMessage();
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            userInput.placeholder = "Type your message here...";
            voiceBtn.style.backgroundColor = '';
            voiceBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" fill="white"/>
                    <path d="M5 11C5.55228 11 6 11.4477 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 11.4477 18.4477 11 19 11C19.5523 11 20 11.4477 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 11.4477 4.44772 11 5 11Z" fill="white"/>
                    <path d="M12 19C12.5523 19 13 19.4477 13 20V23C13 23.5523 12.5523 24 12 24C11.4477 24 11 23.5523 11 23V20C11 19.4477 11.4477 19 12 19Z" fill="white"/>
                </svg>
            `;
            addMessage('jarvis', 'Voice recognition failed. Please try again or type your message.');
        };
        
        recognition.start();
    });
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Initial scroll to bottom
    scrollToBottom();
});