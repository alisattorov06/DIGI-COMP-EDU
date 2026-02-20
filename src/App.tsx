/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Send, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  BrainCircuit, 
  History,
  Info,
  ChevronRight,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import confetti from 'canvas-confetti';
import { solveDifferentialEquation } from './services/geminiService';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Iltimos, faqat rasm yuklang.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setImageMimeType(file.type);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSolve = async () => {
    if (!inputText && !selectedImage) {
      setError('Iltimos, masala matnini kiriting yoki rasm yuklang.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSolution(null);

    try {
      let result;
      if (selectedImage) {
        const base64Data = selectedImage.split(',')[1];
        result = await solveDifferentialEquation({
          mimeType: imageMimeType!,
          data: base64Data
        }, true);
      } else {
        result = await solveDifferentialEquation(inputText);
      }

      setSolution(result || "Javob topilmadi.");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 p-2 rounded-lg">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            AI <span className="text-slate-500">Differensial</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
            <History className="w-4 h-4" />
            Tarix
          </button>
          <div className="h-4 w-[1px] bg-slate-200" />
          <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-sm">
            Premiumga o'tish
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Input */}
        <div className="w-1/2 border-r border-slate-200 flex flex-col bg-white">
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="max-w-xl mx-auto space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-xs">01</div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Masala kiritish</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="relative group">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Differensial tenglamani shu yerga yozing... (masalan: y' + 2y = e^x)"
                      className="w-full h-48 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-none text-lg placeholder:text-slate-400"
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-mono">
                      TEXT INPUT
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-[1px] bg-slate-100" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">yoki</span>
                    <div className="flex-1 h-[1px] bg-slate-100" />
                  </div>

                  <div 
                    onClick={() => !selectedImage && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer
                      ${selectedImage ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'}`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                    
                    {selectedImage ? (
                      <div className="relative w-full max-h-64 overflow-hidden rounded-lg shadow-md">
                        <img src={selectedImage} alt="Uploaded" className="w-full h-full object-contain" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); clearImage(); }}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-900">Rasm yuklash (OCR)</p>
                          <p className="text-xs text-slate-500 mt-1">Tenglamani suratga olib yuklang</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm"
                >
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}

              <button
                onClick={handleSolve}
                disabled={isLoading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Ishlanmoqda...
                  </>
                ) : (
                  <>
                    <Calculator className="w-6 h-6" />
                    Yechishni boshlash
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Gemini 3 Flash AI</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Right Side: Output */}
        <div className="w-1/2 bg-white flex flex-col relative">
          <div className="absolute inset-0 overflow-y-auto p-12">
            <AnimatePresence mode="wait">
              {solution ? (
                <motion.div
                  key="solution"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">02</div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Yechim va tahlil</h2>
                  </div>

                  <div className="markdown-body prose prose-slate prose-lg max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {solution}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                    <Calculator className="w-10 h-10 text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-900">Yechim kutilmoqda</h3>
                    <p className="text-slate-400 max-w-xs mx-auto">
                      Chap tomonda masala kiriting va yechish tugmasini bosing. AI bir necha soniyada javobni taqdim etadi.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md pt-8">
                    {[
                      { title: "Bosqichma-bosqich", desc: "Har bir qadam tushuntiriladi" },
                      { title: "OCR Texnologiyasi", desc: "Rasmdan matnni o'qiydi" },
                      { title: "LaTeX Format", desc: "Chiroyli matematik formulalar" },
                      { title: "Tezkor AI", desc: "Gemini 3 Flash yordamida" }
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                          <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{item.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
