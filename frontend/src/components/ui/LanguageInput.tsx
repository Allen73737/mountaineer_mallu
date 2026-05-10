import React, { useState, useRef, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { Keyboard as KeyboardIcon, Languages, Type, X, Eye } from 'lucide-react';
import { manglishToMalayalam } from '../../lib/manglishTransliterate';
import { AnimatePresence, motion } from 'framer-motion';

// We define basic custom layouts to ensure it renders correctly on screen
const GERMAN_LAYOUT = {
    default: [
        "^ 1 2 3 4 5 6 7 8 9 0 \u00DF \u00B4 {bksp}",
        "{tab} q w e r t z u i o p \u00FC +",
        "{lock} a s d f g h j k l \u00F6 \u00E4 # {enter}",
        "{shift} < y x c v b n m , . - {shift}",
        ".com @ {space}"
    ],
    shift: [
        "\u00B0 ! \" \u00A7 $ % & / ( ) = ? ` {bksp}",
        "{tab} Q W E R T Z U I O P \u00DC *",
        "{lock} A S D F G H J K L \u00D6 \u00C4 ' {enter}",
        "{shift} > Y X C V B N M ; : _ {shift}",
        ".com @ {space}"
    ]
};

// Malayalam InScript basic layout mapping
const MALAYALAM_LAYOUT = {
    default: [
        "ൊ േ ാ ി ീ ു ൂ ൃ ൄ െ േ ൈ {bksp}",
        "{tab} ൌ ൈ ാ ീ ൂ ബ ഹ ഗ ദ ജ ഡ ഢ",
        "{lock} ോ േ ് ി ു പ ര ക ത ച ട {enter}",
        "{shift} െ ം മ ന വ ല സ , . യ {shift}",
        "{space}"
    ],
    shift: [
        "ഒ ഏ ആ ഇ ഈ ഉ ഊ ഋ ൠ എ ഏ ഐ {bksp}",
        "{tab} ഔ ഐ ആ ഈ ഊ ഭ ങ ഘ ധ ഝ ഢ ഠ",
        "{lock} ഓ ഏ ് ഇ ഉ ഫ റ ഖ ഥ ഛ ഠ {enter}",
        "{shift} എ ഃ ണ ങ ശ ഷ സ ശ ഷ യ {shift}",
        "{space}"
    ]
};

interface LanguageInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    isTextarea?: boolean;
    rows?: number;
    className?: string;
}

type Mode = 'english' | 'german' | 'malayalam' | 'manglish';

export const LanguageInput: React.FC<LanguageInputProps> = ({ 
    value, 
    onChange, 
    placeholder, 
    isTextarea = false, 
    rows = 4,
    className = "" 
}) => {
    const [mode, setMode] = useState<Mode>('english');
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [layoutName, setLayoutName] = useState('default');
    const keyboardRef = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // ─── Manglish dual-buffer: raw English text kept separate ─────────
    const [manglishRaw, setManglishRaw] = useState('');
    const [manglishPreview, setManglishPreview] = useState('');

    // When switching TO manglish mode, clear the raw buffer
    useEffect(() => {
        if (mode === 'manglish') {
            setManglishRaw('');
            setManglishPreview('');
        }
    }, [mode]);

    // Sync external value changes to keyboard
    useEffect(() => {
        if (keyboardRef.current && mode !== 'manglish') {
            keyboardRef.current.setInput(value);
        }
    }, [value, mode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const rawVal = e.target.value;
        processInput(rawVal);
    };

    const handleKeyboardChange = (val: string) => {
        processInput(val);
    };

    const processInput = (newVal: string) => {
        if (mode === 'manglish') {
            // In manglish mode, the input field shows raw English text
            // We convert it live and store the Malayalam version via onChange
            setManglishRaw(newVal);
            try {
                const converted = manglishToMalayalam(newVal);
                setManglishPreview(converted);
                onChange(converted);
            } catch (err) {
                setManglishPreview(newVal);
                onChange(newVal);
            }
        } else {
            onChange(newVal);
        }
    };

    const onKeyPress = (button: string) => {
        if (button === "{shift}" || button === "{lock}") {
            setLayoutName(layoutName === "default" ? "shift" : "default");
        }
    };

    const getLayout = () => {
        if (mode === 'german') return GERMAN_LAYOUT;
        if (mode === 'malayalam') return MALAYALAM_LAYOUT;
        return undefined; // default english
    };

    // Determine what value to show in the input field
    const displayValue = mode === 'manglish' ? manglishRaw : value;

    return (
        <div className="relative w-full">
            {/* Top Toolbar for Input */}
            <div className="flex items-center justify-between mb-2 bg-black/10 dark:bg-white/5 rounded-t-xl px-3 py-2 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <button 
                        type="button"
                        onClick={() => { setMode('english'); setShowKeyboard(false); }}
                        className={`text-xs px-2 py-1 rounded font-bold transition-colors ${mode === 'english' ? 'bg-alpine-glacier text-alpine-navy' : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        English
                    </button>
                    <button 
                        type="button"
                        onClick={() => setMode('german')}
                        className={`text-xs px-2 py-1 rounded font-bold transition-colors flex items-center gap-1 ${mode === 'german' ? 'bg-amber-400 text-alpine-navy' : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        Deutsch <Type size={10} />
                    </button>
                    <button 
                        type="button"
                        onClick={() => setMode('malayalam')}
                        className={`text-xs px-2 py-1 rounded font-bold transition-colors flex items-center gap-1 ${mode === 'malayalam' ? 'bg-emerald-400 text-alpine-navy' : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        മലയാളം <Type size={10} />
                    </button>
                    <button 
                        type="button"
                        onClick={() => { setMode('manglish'); setShowKeyboard(false); }}
                        className={`text-xs px-2 py-1 rounded font-bold transition-colors flex items-center gap-1 ${mode === 'manglish' ? 'bg-alpine-sunrise text-white' : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        title="Type in English, converts to Malayalam automatically"
                    >
                        Manglish <Languages size={10} />
                    </button>
                </div>
                
                {(mode === 'german' || mode === 'malayalam') && (
                    <button 
                        type="button"
                        onClick={() => setShowKeyboard(!showKeyboard)}
                        className={`p-1.5 rounded-lg transition-colors ${showKeyboard ? 'bg-alpine-blue text-white' : 'bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
                        title="Toggle Virtual Keyboard"
                    >
                        <KeyboardIcon size={16} />
                    </button>
                )}
            </div>

            {/* Manglish hint */}
            {mode === 'manglish' && (
                <div className="px-3 py-1.5 bg-alpine-sunrise/10 dark:bg-alpine-sunrise/5 text-alpine-sunrise dark:text-alpine-sunrise/80 text-[10px] font-medium tracking-wide border-b border-alpine-sunrise/10">
                    ✍️ Type in English (e.g. "njan evide poyi") → Malayalam will appear below
                </div>
            )}

            {/* Input Field */}
            {isTextarea ? (
                <textarea
                    ref={inputRef as any}
                    value={displayValue}
                    onChange={handleInputChange}
                    placeholder={mode === 'manglish' ? 'Type Manglish here... e.g. "njan innale mala kayari"' : placeholder}
                    rows={rows}
                    className={`w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-alpine-blue dark:focus:border-alpine-sunrise ${mode === 'manglish' && manglishPreview ? 'rounded-none' : 'rounded-b-xl'} px-4 py-3 outline-none text-[#0B0C10] dark:text-white resize-none transition-colors ${className}`}
                />
            ) : (
                <input
                    ref={inputRef as any}
                    type="text"
                    value={displayValue}
                    onChange={handleInputChange}
                    placeholder={mode === 'manglish' ? 'Type Manglish... e.g. "njan evide"' : placeholder}
                    className={`w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-alpine-blue dark:focus:border-alpine-sunrise ${mode === 'manglish' && manglishPreview ? 'rounded-none' : 'rounded-b-xl'} px-4 py-3 outline-none text-[#0B0C10] dark:text-white transition-colors ${className}`}
                />
            )}

            {/* Manglish Live Preview — shows the Malayalam conversion */}
            <AnimatePresence>
                {mode === 'manglish' && manglishPreview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-emerald-500/5 dark:bg-emerald-500/10 border-t border-emerald-500/20 rounded-b-xl px-4 py-3 overflow-hidden"
                    >
                        <div className="flex items-start gap-2">
                            <Eye size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase mb-1">Malayalam Output</p>
                                <p className="text-base text-[#0B0C10] dark:text-white font-medium leading-relaxed break-words" style={{ fontFamily: "'Noto Sans Malayalam', 'Manjari', sans-serif" }}>
                                    {manglishPreview}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Virtual Keyboard Portal/Overlay */}
            <AnimatePresence>
                {showKeyboard && (mode === 'german' || mode === 'malayalam') && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-0 left-0 right-0 z-[1000] p-4 pointer-events-none"
                    >
                        <div className="max-w-4xl mx-auto bg-white/90 dark:bg-[#15171E]/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 pointer-events-auto">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="font-bold text-sm text-alpine-navy dark:text-alpine-snow flex items-center gap-2">
                                    <KeyboardIcon size={16} className="text-alpine-glacier" />
                                    {mode === 'german' ? 'German Native Keyboard' : 'Malayalam Native Keyboard'}
                                </h3>
                                <button 
                                    type="button" 
                                    onClick={() => setShowKeyboard(false)}
                                    className="p-1.5 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                                >
                                    <X size={16} className="text-black dark:text-white" />
                                </button>
                            </div>
                            <div className="virtual-keyboard-wrapper text-black">
                                <Keyboard
                                    keyboardRef={r => (keyboardRef.current = r)}
                                    layoutName={layoutName}
                                    layout={getLayout()}
                                    onChange={handleKeyboardChange}
                                    onKeyPress={onKeyPress}
                                    theme="hg-theme-default custom-keyboard-theme"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
