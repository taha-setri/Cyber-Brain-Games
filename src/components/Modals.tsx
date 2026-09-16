import React from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Database, 
  User, 
  ExternalLink, 
  CheckCircle, 
  Trash2,
  Lock,
  Cpu,
  Globe,
  Sparkles
} from 'lucide-react';
import { ActiveModal } from '../types';
import { soundFx } from '../services/audioService';

interface ModalsProps {
  activeModal: ActiveModal;
  onClose: () => void;
  onClearStorage: () => void;
}

export const Modals: React.FC<ModalsProps> = ({ activeModal, onClose, onClearStorage }) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-[#080e22] border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyan-500/20 bg-[#0c1633]/60">
          <div className="flex items-center gap-2.5">
            {activeModal === 'privacy' && (
              <>
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">سياسة الخصوصية وأمان البيانات</h3>
              </>
            )}
            {activeModal === 'disclaimer' && (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">إخلاء المسؤولية القانونية والفنية</h3>
              </>
            )}
            {activeModal === 'cookies' && (
              <>
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">ملفات الكوكيز والتخزين المحلي</h3>
              </>
            )}
            {activeModal === 'founder' && (
              <>
                <User className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">بطاقة المؤسس | Founder Profile</h3>
              </>
            )}
          </div>

          <button
            id="btn-close-modal"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with scroll */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
          
          {/* 1. Privacy Policy */}
          {activeModal === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs">
                🔒 <strong>مبدأ الخصوصية الصفرية للمعلومات:</strong> نحن نلتزم بأعلى معايير الخصوصية الرقمية. هذا التطبيق يعمل بنسبة 100% داخل متصفحك محلياً ولا ينقل بياناتك الشخصية إلى أي خوادم خارجية.
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-base">1. البيانات التي يتم جمعها</h4>
                <p>
                  لا نطلب منك إنشاء حساب ولا نجمع اسمك، بريدك الإلكتروني، عنوان IP الخاص بك، أو أي معلومات تعريفية شخصية. البيانات الوحيدة التي يتم تسجيلها هي نتائج ألعاب رد الفعل والذاكرة البصرية، ويتم حفظها محلياً على جهازك فقط عبر تقنية التخزين المحلي (Local Storage).
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-base">2. التخزين المحلي للمتصفح (Local Storage)</h4>
                <p>
                  تُستخدم ذاكرة المتصفح فقط للاحتفاظ بأعلى أرقامك القياسية (High-scores) وإعدادات كتم الصوت وتفضيلاتك. يمكنك في أي وقت محو جميع هذه السجلات بضغطة زر واحدة من خلال قسم "ملفات الكوكيز والتخزين".
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-base">3. الروابط الخارجية</h4>
                <p>
                  يتضمن التطبيق روابط خارجية تقودك إلى مشاريع أخرى ضمن شبكتنا (مثل موقع مخطط الميزانية والمصاريف الشخصية). هذه المواقع تخضع لسياسات الخصوصية الخاصة بها.
                </p>
              </section>

              <div className="pt-2 text-xs text-slate-400 border-t border-slate-800">
                آخر تحديث للسياسة: سبتمبر 2026 • المطور: Taha setri
              </div>
            </div>
          )}

          {/* 2. Disclaimer */}
          {activeModal === 'disclaimer' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs">
                ⚠️ <strong>إخلاء مسؤولية توضيحي:</strong> تم تصميم هذه المنصة لأغراض ترفيهية وتدريبية إدراكية ولا تُعد بأي حال من الأحوال أداة تشخيص طبي أو سريري.
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-base">1. طبيعة القياسات ودقتها</h4>
                <p>
                  على الرغم من استخدام واجهات قياس دقيقة تعتمد على دوال الوقت المتناهية (Performance.now)، إلا أن زمن الاستجابة الفعلي قد يتأثر بمعدل تحديث شاشتك (Refresh Rate مثل 60Hz أو 120Hz أو 144Hz)، وزمن استجابة لوحة اللمس أو الفأرة (Input Lag)، وحالة معالج الجهاز.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-base">2. عدم وجود صفة طبية</h4>
                <p>
                  نتائج اختبارات سرعة الاستجابة والذاكرة البصرية مخصصة للتحفيز الذاتي وتحسين التركيز اليومي، ولا ينبغي الاعتماد عليها كبديل عن الاستشارات الطبية أو الفحوصات العصبية المتخصصة.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-base">3. الاستخدام على مسؤولية المستخدم</h4>
                <p>
                  يتحمل المستخدم المسؤولية الكاملة عن استخدامه للتطبيق، ولا يتحمل المطور أي مسؤولية عن أي سوء فهم أو استخدام غير سليم للمعلومات والنتائج المعروضة.
                </p>
              </section>
            </div>
          )}

          {/* 3. Cookies & Storage */}
          {activeModal === 'cookies' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
                🍪 <strong>استخدام الكوكيز والتخزين المحلي:</strong> نحترم خصوصيتك بالكامل. لا نستخدم كوكيز طرف ثالث للتتبع أو الإعلانات.
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-base">ماذا نخزن على جهازك؟</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>سجل أرقام رد الفعل:</strong> أسرع توقيت مسجل بالميلي ثانية ومتوسط آخر 5 محاولات.</li>
                  <li><strong>سجل شبكة الذاكرة:</strong> أعلى مستوى تم اجتيازه ومجموع النقاط التراكمي.</li>
                  <li><strong>تفضيلات الصوت:</strong> حالة كتم أو تفعيل المؤثرات الصوتية النيون (Cyber Audio).</li>
                </ul>
              </section>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-white text-sm">مسح كافة البيانات المخزنة محلياً</h5>
                  <p className="text-xs text-slate-400">سيؤدي هذا إلى إعادة تصفير كافة الأرقام القياسية وسجل الاختبارات.</p>
                </div>
                <button
                  id="btn-clear-all-data"
                  onClick={() => {
                    soundFx.playError();
                    onClearStorage();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-600 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تصفير ومسح الذاكرة</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Founder: Taha setri */}
          {activeModal === 'founder' && (
            <div className="space-y-5">
              {/* Founder Cyber Badge Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1b082c] via-[#0e1124] to-[#08152c] border-2 border-purple-500/40 shadow-[0_0_30px_rgba(157,78,221,0.25)] space-y-4">
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-cyan-500 to-emerald-400 p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                      <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-white font-black text-2xl font-mono">
                        TS
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[10px] text-black font-bold">
                      ✓
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-black text-white">Taha Setri</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-400 text-purple-200 font-mono">
                        المؤسس والمبتكر
                      </span>
                    </div>
                    <p className="text-xs text-cyan-300 font-mono mt-0.5">
                      Front-End Architect & Futuristic UI/UX Specialist
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      مطور واجهات أمامية خبير ومصمم تجارب تفاعلية مستقبلية
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2 text-slate-300">
                  <p>
                    أهلاً بك في منصة ألعاب العقل وسرعة التركيز المصغرة. تم تصميم هذه الواجهة بحرفية عالية لتجمع بين أناقة التصميم النيوني المستقبلي والسرعة الفائقة في قياس التفاعلات الدقيقة على مستوى الميلي ثانية.
                  </p>
                </div>

                {/* Ecosystem Links */}
                <div className="space-y-2 pt-2 border-t border-purple-500/20">
                  <span className="text-xs text-purple-300 font-bold block">مشاريع في نفس الشبكة الرقمية:</span>
                  
                  <a
                    href="https://personal-budget-and-expense-planner.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 hover:border-cyan-400 transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
                      <div>
                        <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                          مخطط الميزانية والمصاريف الشخصية
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          personal-budget-and-expense-planner.vercel.app
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  </a>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#070c1e] flex justify-end">
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
