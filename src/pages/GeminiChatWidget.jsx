import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import parse, { domToReact } from 'html-react-parser';
const GeminiChatWidget = () => {
  // --- STATE QUẢN LÝ GIAO DIỆN ---
  const [isOpen, setIsOpen] = useState(false); // Trạng thái đóng/mở chat

  // --- STATE LOGIC CHAT (Giữ nguyên của bạn) ---
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi là Chatbot TDC. Bạn cần giúp gì?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mỗi khi mở chat hoặc có tin nhắn mới thì cuộn xuống
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // --- HÀM GỬI TIN NHẮN (Logic cũ) ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://od1ss7mik1.execute-api.ap-southeast-1.amazonaws.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput }),
      });

      const data = await response.json();

      if (response.ok) {
        const botMessage = { id: Date.now() + 1, text: data.reply, sender: 'bot' };
        console.log("Bot reply:", botMessage);
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error("Lỗi từ server");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      const errorMessage = { id: Date.now() + 1, text: "Xin lỗi, Server Python chưa chạy.", sender: 'bot', isError: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const renderMessageContent = (text) => {
  // Mẹo: Nếu server lỡ trả về chuỗi "<Link to=", ta replace nó thành "<a href=" để parser hiểu
  let cleanText = text
    .replace(/<Link to=/g, '<a href=')
    .replace(/<\/Link>/g, '</a>');

  const options = {
    replace: (domNode) => {
      // Nếu gặp thẻ <a>, thay thế nó bằng component <Link>
      if (domNode.name === 'a' && domNode.attribs && domNode.attribs.href) {
        return (
          <Link to={domNode.attribs.href} style={{ color: 'blue', textDecoration: 'underline' }}>
            {domToReact(domNode.children)}
          </Link>
        );
      }
    },
  };

  return parse(cleanText, options);
};
  // --- PHẦN GIAO DIỆN ---
  return (
    <div style={styles.widgetContainer}>

      {/* 1. KHUNG CHAT (Chỉ hiện khi isOpen = true) */}
      {isOpen && (
        <div style={styles.chatWindow}>
          {/* Header có nút đóng */}
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🤖</span>
              <span><Link to="/product/2">Trợ lý ảo TDC</Link></span>
            </div>
            <button style={styles.closeButton} onClick={() => setIsOpen(false)}>×</button>
          </div>

          {/* List tin nhắn */}
          <div style={styles.messageList}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.messageRow,
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  ...styles.messageBubble,
                  backgroundColor: msg.isError ? '#ffcccc' : (msg.sender === 'user' ? '#007bff' : '#f1f0f0'),
                  color: msg.isError ? 'red' : (msg.sender === 'user' ? 'white' : 'black')
                }}
                
                >
                  {renderMessageContent(msg.text)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={styles.messageRow}>
                <div style={{ ...styles.messageBubble, backgroundColor: '#f1f0f0', fontStyle: 'italic', color: '#666' }}>
                  <span className="loading-dots">Đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập liệu */}
          <div style={styles.inputArea}>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập câu hỏi..."
              disabled={isLoading}
            />
            <button
              style={{ ...styles.sendButton, opacity: isLoading ? 0.6 : 1 }}
              onClick={handleSend}
              disabled={isLoading}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* 2. NÚT TRÒN (TOGGLE BUTTON) */}
      <button
        style={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '▼' : '💬'}
      </button>

    </div>
  );
};

// --- CSS STYLES (Đã chỉnh sửa để nhỏ gọn và nổi) ---
const styles = {
  widgetContainer: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 9999, // Luôn nổi lên trên cùng
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    fontFamily: 'Arial, sans-serif'
  },
  toggleButton: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '28px',
    border: 'none',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  },
  chatWindow: {
    width: '350px', // Chiều rộng nhỏ gọn
    height: '450px', // Chiều cao vừa phải
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
    marginBottom: '15px', // Cách nút tròn một chút
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'fadeIn 0.2s ease-out' // Hiệu ứng hiện ra (cần config keyframes nếu muốn xịn)
  },
  header: {
    padding: '12px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 'bold',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    lineHeight: '1'
  },
  messageList: {
    flex: 1,
    padding: '15px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#f9f9f9'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    maxWidth: '80%',
    padding: '8px 12px',
    borderRadius: '15px',
    fontSize: '14px',
    lineHeight: '1.4',
    wordWrap: 'break-word',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  inputArea: {
    padding: '10px',
    borderTop: '1px solid #eee',
    display: 'flex',
    gap: '8px',
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    outline: 'none',
    fontSize: '14px'
  },
  sendButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  }
};

export default GeminiChatWidget;