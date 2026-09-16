import React from 'react';
import { 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Database, 
  User, 
  Zap,
  Heart
} from 'lucide-react';
import { ActiveModal } from '../types';
import { soundFx } from '../services/audioService';

interface FooterProps {
  onOpenModal: (modal: ActiveModal) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  return (
    <footer className="w-full mt-16 border-t border-cyan-500/20 bg-[#050918]/90 backdrop-blur-md py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Main Grid in Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Brand & Platform Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-black text-white text-base">منصة ألعاب العقل وسرعة التركيز</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              منصة اختبارات عصبية وإدراكية مصغرة مصممة بواجهات نيون مستقبلية فائقة السرعة، توفر قياسات دقيقة بالميلي ثانية وتحديات تنشيط الذاكرة البصرية.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>الإصدار 2.5 • بيئة نيون متجاوبة</span>
            </div>
          </div>

          {/* External Network Link Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-[#0a122e] to-purple-950/40 border border-cyan-500/30 space-y-2.5">
            <span className="text-[11px] font-mono text-cyan-400 block uppercase tracking-wider">
              شبكة المواقع الشقيقة
            </span>
            <h5 className="font-bold text-white text-sm">مخطط الميزانية والمصاريف الشخصية</h5>
            <p className="text-xs text-slate-300">
              انتقل مباشرة إلى تطبيق إدارة وتخطيط الميزانية والمصاريف اليومية الذكي.
            </p>
            <a
              id="footer-link-budget"
              href="https://personal-budget-and-expense-planner.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFx.playClick()}
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-white transition-colors group mt-1"
            >
              <span>فتح الموقع السابق</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Founder & Legal Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-mono text-purple-300 uppercase tracking-wider">
              المؤسس والسياسات
            </h5>
            
            {/* Founder Pill */}
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenModal('founder');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-xs text-purple-200 transition-all text-right"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                <span className="font-bold">المؤسس: Taha setri</span>
              </div>
              <span className="text-[10px] text-purple-400">عرض الملف ←</span>
            </button>

            {/* Quick Legal Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenModal('privacy');
                }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-xs border border-slate-800 transition-colors"
              >
                سياسة الخصوصية
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenModal('disclaimer');
                }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-xs border border-slate-800 transition-colors"
              >
                إخلاء المسؤولية
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenModal('cookies');
                }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-xs border border-slate-800 transition-colors"
              >
                ملفات الكوكيز والتخزين
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div>
            جميع الحقوق محفوظة © 2026 • منصة ألعاب العقل واختبار سرعة التركيز المصغرة
          </div>
          <div className="flex items-center gap-2 text-purple-300 font-bold">
            <span>تطوير وإبداع:</span>
            <span className="text-cyan-300">Taha setri</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
