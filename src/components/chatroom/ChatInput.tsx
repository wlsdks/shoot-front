// 메시지 입력 폼
import React, { useState } from 'react';

interface ChatInputProps {
    onSend: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim() !== '') {
        onSend(input);
        setInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
        handleSend();
        }
    };

    return (
        <div style={{ display: 'flex', marginTop: '10px' }}>
        <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요"
            style={{ flexGrow: 1, marginRight: '10px', padding: '8px' }}
        />
        <button onClick={handleSend}>전송</button>
        </div>
    );
};

export default ChatInput;