import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Store, User, Sparkles, Check, CheckCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveChatModal: React.FC<LiveChatModalProps> = ({ isOpen, onClose }) => {
  const { chatMessages, sendChatMessage, currentRole, language, t, settings } = useStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isBn = language === 'bn';

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  const handleQuickReply = (text: string) => {
    sendChatMessage(text);
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 w-[88vw] sm:w-[320px] md:w-[340px] h-[400px] sm:h-[440px] bg-slate-900/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/15 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-800/90 via-teal-800/90 to-slate-900/90 border-b border-white/10 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white">
              <Store className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <h4 className="font-bold text-xs leading-tight text-white">
              {isBn ? settings.storeNameBn || settings.storeName : settings.storeName}
            </h4>
            <p className="text-[10px] text-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isBn ? 'সক্রিয় আছেন' : 'Online'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-3 overflow-y-auto bg-slate-950/40 space-y-2.5">
        <div className="text-center my-1">
          <span className="px-2.5 py-0.5 bg-white/10 border border-white/10 rounded-full text-[9px] text-slate-400 backdrop-blur-md">
            {isBn ? 'আজকের চ্যাট' : 'Today Live Chat'}
          </span>
        </div>

        {chatMessages.map((msg) => {
          const isMine =
            (currentRole === 'customer' && msg.senderRole === 'customer') ||
            (currentRole !== 'customer' && msg.senderRole !== 'customer');

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              {!isMine && (
                <div className="w-6 h-6 rounded-full bg-emerald-600/80 border border-emerald-400/30 text-white flex items-center justify-center text-xs shrink-0 shadow-2xs">
                  {msg.senderRole === 'customer' ? <User className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                  isMine
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs border border-emerald-400/30 shadow-md shadow-emerald-950/30'
                    : 'bg-slate-800/80 text-slate-200 border border-white/10 rounded-bl-xs backdrop-blur-md'
                }`}
              >
                {!isMine && (
                  <p className="text-[9px] font-semibold text-emerald-400 mb-0.5">
                    {msg.senderName}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div
                  className={`flex items-center justify-end gap-1 mt-0.5 text-[8px] ${
                    isMine ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMine && <CheckCheck className="w-2.5 h-2.5 text-emerald-200" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies for fast customer interactions */}
      <div className="px-2.5 py-1.5 bg-slate-900/80 border-t border-white/10 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {t.chat.quickReplies.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickReply(reply)}
            className="whitespace-nowrap px-2 py-0.5 text-[10px] font-medium bg-white/[0.06] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 rounded-full border border-white/10 transition-colors shrink-0"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Message Input Footer */}
      <form onSubmit={handleSend} className="p-2.5 bg-slate-900/90 border-t border-white/10 flex items-center gap-1.5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.chat.typeMessage}
          className="flex-1 px-3 py-1.5 text-xs border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-40 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md shadow-emerald-950/40 border border-emerald-400/30"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
