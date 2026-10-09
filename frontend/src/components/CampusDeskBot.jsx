import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  BookOpen,
  HelpCircle,
  Clock,
  ArrowRight,
  Headphones,
  UserCheck
} from 'lucide-react';

const QUICK_PILLS = [
  { label: 'Office Working Hours', query: 'What time does the office start and close?' },
  { label: 'Mess Rebate Policy', query: 'What is the mess rebate rule when skipping dinner?' },
  { label: 'Curfew & Gatepass', query: 'What are the curfew hours and gatepass rules?' },
  { label: '75% Attendance Rule', query: 'What is the 75% attendance rule for semester exams?' },
  { label: 'Bonafide Certificate', query: 'How do I apply for an official Bonafide Certificate?' },
  { label: 'Talk to Human Staff', query: 'Connect me to human' }
];

export default function CampusDeskBot() {
  const { language } = useAccessibility();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      sender: 'bot',
      sender_type: 'bot',
      text: language === 'hi'
        ? 'नमस्ते! मैं CampusDesk 24/7 AI सहायक हूँ। मुझसे कार्यालय समय, मेस रिबेट, कर्फ्यू, उपस्थिति या प्रमाण पत्रों के बारे में पूछें।'
        : language === 'or'
        ? 'ନମସ୍କାର! ମୁଁ CampusDesk ୨୪/୭ ସହାୟକ। ଅଫିସ୍ ସମୟ, ମେସ୍ ରିବେଟ୍, କର୍ଫ୍ୟୁ ବା ଉପସ୍ଥିତି ସମ୍ବନ୍ଧରେ ପଚାରନ୍ତୁ।'
        : 'Welcome! I am your 24/7 CampusDesk AI Assistant. Ask about office hours, mess rebates, curfew rules, 75% attendance, or certificates.',
      action_route: null,
      is_learned: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('bot'); // 'bot' | 'escalated_pending' | 'human_active'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Periodic poll for staff messages when open
  useEffect(() => {
    if (!isOpen) return;
    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const loadMessages = async () => {
    try {
      const res = await api.getChatbotMessages();
      if (res.success && res.data?.messages) {
        if (res.data.session) {
          setSessionStatus(res.data.session.status);
        }
        if (res.data.messages.length > 0) {
          const formatted = res.data.messages.map(m => ({
            id: m.id,
            sender: m.sender_type === 'student' ? 'user' : 'bot',
            sender_type: m.sender_type,
            text: m.message_text,
            is_learned: m.is_learned === 1,
            action_route: m.action_route,
            staff_name: m.staff_name || m.sender_username,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          }));
          setMessages(formatted);
        }
      }
    } catch (err) {
      // Background poll failure silent
    }
  };

  const handleSendQuery = async (queryText) => {
    const text = (queryText || inputText).trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    // Optimistically render user message
    setMessages(prev => [...prev, {
      sender: 'user',
      sender_type: 'student',
      text,
      timestamp: time
    }]);

    setInputText('');
    setIsTyping(true);

    try {
      const res = await api.askChatbot({ query: text, language });
      if (res.success && res.data) {
        if (res.data.status) {
          setSessionStatus(res.data.status);
        }

        setMessages(prev => [...prev, {
          sender: 'bot',
          sender_type: res.data.sender === 'system' ? 'human_staff' : 'bot',
          text: res.data.message,
          is_learned: res.data.is_learned,
          action_route: res.data.action_route,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        sender_type: 'bot',
        text: 'The campus assistant encountered a connection timeout. Retrying with local handbook cache...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEscalateToHuman = async () => {
    try {
      const res = await api.escalateChatbot();
      if (res.success) {
        setSessionStatus('escalated_pending');
        loadMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerAction = (route) => {
    setIsOpen(false);
    navigate(route);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            background: 'var(--primary)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '30px',
            boxShadow: '0 8px 24px rgba(27, 67, 50, 0.35)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '13px',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        >
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={14} />
          </div>
          <span>CampusDesk 24/7 AI</span>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: sessionStatus === 'escalated_pending' ? '#F59E0B' : '#4ADE80',
            boxShadow: `0 0 6px ${sessionStatus === 'escalated_pending' ? '#F59E0B' : '#4ADE80'}`
          }} />
        </button>
      )}

      {/* Floating Chat Modal Canvas */}
      {isOpen && (
        <div style={{
          width: '400px',
          maxWidth: 'calc(100vw - 32px)',
          height: '580px',
          maxHeight: 'calc(100vh - 90px)',
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.20)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Header Bar */}
          <div style={{
            padding: '16px 18px',
            background: sessionStatus === 'human_active' || sessionStatus === 'escalated_pending' ? '#9A3412' : 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {sessionStatus === 'human_active' || sessionStatus === 'escalated_pending' ? (
                  <Headphones size={18} />
                ) : (
                  <Sparkles size={18} />
                )}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                  {sessionStatus === 'human_active'
                    ? 'Live Human Support Active'
                    : sessionStatus === 'escalated_pending'
                    ? 'Support Officer Queued'
                    : 'CampusDesk 24/7 AI (Institutional & Self-Learning)'}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: sessionStatus === 'escalated_pending' ? '#FDE047' : '#4ADE80'
                  }} />
                  {sessionStatus === 'human_active'
                    ? 'Connected directly with Campus Staff'
                    : sessionStatus === 'escalated_pending'
                    ? 'Waiting for next available officer'
                    : 'Self-Learning Autonomous Campus Engine'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#FFFFFF',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick-Click Query Pills */}
          <div style={{
            padding: '10px 14px',
            background: 'var(--canvas)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {QUICK_PILLS.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(pill.query)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '14px',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Escalation Notification Bar */}
          {sessionStatus === 'escalated_pending' && (
            <div style={{
              padding: '8px 14px',
              background: '#FEF3C7',
              borderBottom: '1px solid #FDE68A',
              fontSize: '11px',
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>A support officer will answer your inquiry here shortly.</span>
              <Clock size={13} />
            </div>
          )}

          {/* Chat Messages Stream */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#FAF9F6'
          }}>
            {messages.map((m, idx) => {
              const isStaff = m.sender_type === 'human_staff';
              const isUser = m.sender === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: isUser ? 'var(--primary)' : isStaff ? '#FEF3C7' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: 1.45,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    border: isUser ? 'none' : isStaff ? '1px solid #FDE68A' : '1px solid var(--border-subtle)'
                  }}>
                    {/* Badge Indicator */}
                    {!isUser && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}>
                        {isStaff ? (
                          <span style={{ color: '#92400E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <UserCheck size={12} /> Staff Officer ({m.staff_name || 'Support Desk'})
                          </span>
                        ) : m.is_learned ? (
                          <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={12} /> Self-Learned AI Answer
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>CampusDesk AI</span>
                        )}
                      </div>
                    )}

                    {m.text}

                    {/* 1-Click Action Button Deeplink */}
                    {m.action_route && (
                      <button
                        onClick={() => handleTriggerAction(m.action_route)}
                        style={{
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'var(--canvas)',
                          border: '1px solid var(--primary-border)',
                          color: 'var(--primary)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <span>Open Related Desk ({m.action_route})</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>

                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '3px', padding: '0 4px' }}>
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                padding: '8px 14px',
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                Consulting Campus Knowledge Engine & AI Assistant...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            style={{
              padding: '12px 14px',
              borderTop: '1px solid var(--border-subtle)',
              background: '#FFFFFF',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              placeholder={
                sessionStatus === 'human_active'
                  ? 'Message support officer directly...'
                  : language === 'hi'
                  ? 'अपना प्रश्न लिखें या "Connect me to human" कहें...'
                  : language === 'or'
                  ? 'ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ ବା "Connect me to human" କୁହନ୍ତୁ...'
                  : 'Ask question or type "Connect me to human"...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '13px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                outline: 'none',
                background: 'var(--canvas)'
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: inputText.trim() ? 'var(--primary)' : 'var(--border-subtle)',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() ? 'pointer' : 'default'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
