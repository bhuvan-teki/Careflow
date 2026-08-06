import React, { useState } from 'react';
import { HelpCircle, Send, CheckCircle } from 'lucide-react';

interface CardMissingInfoProps {
  missingQuestions: string[];
  answeredInfo?: Array<{ question: string; answer: string }>;
  onAnswerQuestion: (question: string, answer: string) => void;
  isLoading?: boolean;
}

export const CardMissingInfo: React.FC<CardMissingInfoProps> = ({
  missingQuestions = [],
  answeredInfo = [],
  onAnswerQuestion,
  isLoading = false
}) => {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState('');

  const handleSubmitAnswer = (q: string) => {
    if (!answerInput.trim()) return;
    onAnswerQuestion(q, answerInput.trim());
    setAnswerInput('');
    setActiveQuestion(null);
  };

  return (
    <div className="bg-[#111622]/90 border border-white/10 rounded-2xl p-5 shadow-xl transition-all hover:border-white/20">
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            CARD 5 • Information Still Required
            {missingQuestions.length > 0 ? (
              <span className="text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                {missingQuestions.length} Needed
              </span>
            ) : (
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Complete
              </span>
            )}
          </h3>
          <p className="text-xs text-zinc-400">Targeted triage questions to refine case precision</p>
        </div>
      </div>

      {/* Answered Questions Log */}
      {answeredInfo.length > 0 && (
        <div className="mb-4 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 block">
            Information Provided:
          </span>
          {answeredInfo.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-start space-x-2 text-xs">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-300 block">{item.question}</span>
                <span className="text-emerald-300">{item.answer}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Missing Questions List */}
      {missingQuestions.length === 0 ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>All operational information successfully gathered. Case is fully refined!</span>
        </div>
      ) : (
        <div className="space-y-3">
          {missingQuestions.map((question, idx) => {
            const isSelected = activeQuestion === question;

            return (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                    {question}
                  </span>
                  {!isSelected && (
                    <button
                      onClick={() => {
                        setActiveQuestion(question);
                        setAnswerInput('');
                      }}
                      className="text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Answer Now
                    </button>
                  )}
                </div>

                {isSelected && (
                  <div className="pt-2 border-t border-white/10 flex items-center space-x-2 animate-in fade-in duration-150">
                    <input
                      type="text"
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer(question)}
                      placeholder="Type your response..."
                      disabled={isLoading}
                      className="flex-1 bg-[#0D111A] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSubmitAnswer(question)}
                      disabled={isLoading || !answerInput.trim()}
                      className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 disabled:opacity-50 transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
