import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Link as LinkIcon, AlertCircle, CheckCircle, BarChart2, History, User, MessageSquare, Shield } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const [activeModule, setActiveModule] = useState('detection');
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('text'); // 'text', 'url', 'sample'
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [selectedSample, setSelectedSample] = useState(null);
    const [userHistory, setUserHistory] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [feedback, setFeedback] = useState({ type: 'Accuracy Discrepancy', message: '' });
    const [feedbackStatus, setFeedbackStatus] = useState(null); // 'loading', 'success', 'error'

    // Unified Initialization
    useEffect(() => {
        console.log("Dashboard Mounting...");
        try {
            loadHistory();
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            let userData = { username: 'Admin Investigator', email: 'admin@veriscan.ai', role: 'Premium' };

            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (parsed && parsed.username) userData = parsed;
                } catch (e) {
                    console.error("Failed to parse user data", e);
                }
            }

            setUserInfo(userData);
            console.log("User info set:", userData);
        } catch (err) {
            console.error("Critical error during Dashboard initialization:", err);
            setError("Failed to initialize dashboard. Please try clearing your browser cache.");
        }
    }, []);

    const samples = [
        {
            title: "NASA Confirms Water on Mars",
            type: "Real",
            isUrl: false,
            content: "NASA scientists have found the most compelling evidence yet for flowing water on Mars. Spectral analysis from the Mars Reconnaissance Orbiter showed signs of hydrated salts in dark streaks on the planet's surface."
        },
        {
            title: "5G Towers Cause Global Health Crisis",
            type: "Fake",
            isUrl: false,
            content: "Leaked documents from a secret government agency reveal that 5G cellular towers are being used to broadcast frequencies that suppress the human immune system, leading to a worldwide health emergency."
        },
        {
            title: "Scientists Develop Plastic-Eating Enzyme",
            type: "Real",
            isUrl: false,
            content: "Researchers have engineered an enzyme that can break down plastic bottles six times faster than ever before. This breakthrough could revolutionize recycling and help solve the global plastic pollution crisis."
        },
        {
            title: "Lost City of Atlantis Found in Sahara",
            type: "Fake",
            isUrl: false,
            content: "Archaeologists using satellite imagery have discovered a massive circular structure in the Sahara Desert that perfectly matches Plato's description of Atlantis, including golden temples and ancient waterways."
        },
        {
            title: "Global Sea Levels Rising Faster Than Expected",
            type: "Real",
            isUrl: false,
            content: "New satellite data indicates that global sea levels are rising at an accelerated pace due to the melting of ice sheets in Greenland and Antarctica, posing a significant threat to coastal cities by 2050."
        },
        {
            title: "Bitcoin to Replace US Dollar by Next Year",
            type: "Fake",
            isUrl: false,
            content: "A secret meeting between major central banks has resulted in a plan to phase out the US Dollar and adopt Bitcoin as the primary global reserve currency within the next 12 months."
        },
        {
            title: "AI Successfully Identifies New Antibiotics",
            type: "Real",
            isUrl: false,
            content: "Using machine learning, MIT researchers have identified a powerful new antibiotic compound that can kill some of the world's most dangerous drug-resistant bacteria, marking a new era in medicine."
        },
        {
            title: "BBC: Science & Environment News",
            type: "Real",
            isUrl: true,
            content: "https://www.bbc.com/news/science_and_environment"
        },
        {
            title: "Reuters: Technology News",
            type: "Real",
            isUrl: true,
            content: "https://www.reuters.com/technology/"
        },
        {
            title: "The Guardian: Science Section",
            type: "Real",
            isUrl: true,
            content: "https://www.theguardian.com/science"
        },
        {
            title: "NPR: Science News",
            type: "Real",
            isUrl: true,
            content: "https://www.npr.org/sections/science/"
        },
        {
            title: "National Geographic: Environment",
            type: "Real",
            isUrl: true,
            content: "https://www.nationalgeographic.com/environment"
        },
        // Tamil Samples
        {
            title: "தமிழகத்தில் புதிய அகழ்வாராய்ச்சி கண்டுபிடிப்பு",
            type: "Real",
            isUrl: false,
            lang: "ta",
            content: "கீழடியில் நடத்தப்பட்ட அகழ்வாராய்ச்சியில் 2600 ஆண்டுகளுக்கு முந்தைய பழைமையான பொருட்கள் கண்டெடுக்கப்பட்டுள்ளன. இது தமிழர்களின் நாகரிகம் மிகவும் பழமையானது என்பதை உறுதிப்படுத்துகிறது."
        },
        {
            title: "இரவில் சூரிய ஒளி மின்சாரம் தயாரிக்கும் புதிய கருவி",
            type: "Fake",
            isUrl: false,
            lang: "ta",
            content: "விஞ்ஞானிகள் இரவில் நிலவொளியிலிருந்து சூரிய மின்சாரம் தயாரிக்கும் புதிய கண்ணாடியை கண்டுபிடித்துள்ளனர். இனி 24 மணி நேரமும் இலவச மின்சாரம் கிடைக்கும் என்று அறிவிக்கப்பட்டுள்ளது."
        },
        // Hindi Samples
        {
            title: "भारत ने अंतरिक्ष में रचा इतिहास - चंद्रयान की सफलता",
            type: "Real",
            isUrl: false,
            lang: "hi",
            content: "इसरो के वैज्ञानिकों ने चंद्रयान मिशन को सफलतापूर्वक पूरा कर लिया है। भारत चंद्रमा के दक्षिणी ध्रुव पर उतरने वाला दुनिया का पहला देश बन गया है।"
        },
        {
            title: "हर नागरिक के खाते में आएंगे 15 लाख रुपये - नई घोषणा",
            type: "Fake",
            isUrl: false,
            lang: "hi",
            content: "सरकार ने घोषणा की है कि डिजिटल इंडिया मिशन के तहत सभी नागरिकों के बैंक खातों में 15 लाख रुपये जमा किए जाएंगे। इसके लिए केवल आधार कार्ड की आवश्यकता है।"
        },
        // Malayalam Samples
        {
            title: "കേരളത്തിൽ പുതിയ മെട്രോ പാത വരുന്നു",
            type: "Real",
            isUrl: false,
            lang: "ml",
            content: "കൊച്ചി മെട്രോയുടെ രണ്ടാം ഘട്ടം ഉടൻ ആരംഭിക്കുമെന്ന് സർക്കാർ അറിയിച്ചു. ഇത് നഗരത്തിലെ യാത്രാ സൗകര്യങ്ങൾ വർദ്ധിപ്പിക്കുകയും ഗതാഗതക്കുരുക്ക് കുറയ്ക്കുകയും ചെയ്യും."
        },
        {
            title: "വെള്ളം കൊണ്ട് ഓടുന്ന കാർ വികസിപ്പിച്ചു",
            type: "Fake",
            isUrl: false,
            lang: "ml",
            content: "ഇന്ധനത്തിന് പകരം വെറും വെള്ളം ഉപയോഗിച്ച് ഓടുന്ന കാർ ഒരു യുവാവ് കണ്ടുപിടിച്ചു. 1 ലിറ്റർ വെള്ളം കൊണ്ട് 100 കിലോമീറ്റർ മൈലേജ് ലഭിക്കുമെന്ന് അദ്ദേഹം അവകാശപ്പെടുന്നു."
        },
        // French Samples
        {
            title: "Découverte d'un remède contre le vieillissement",
            type: "Fake",
            isUrl: false,
            lang: "fr",
            content: "Des chercheurs d'une petite université ont trouvé une molécule capable d'arrêter complètement le processus de vieillissement humain. Une pilule sera bientôt disponible pour vivre mille ans."
        },
        {
            title: "La France renforce ses mesures écologiques",
            type: "Real",
            isUrl: false,
            lang: "fr",
            content: "Le gouvernement français a annoncé de nouvelles subventions pour les voitures électriques et les panneaux solaires, visant à réduire les émissions de carbone de 40% d'ici 2030."
        }
    ];

    const loadHistory = () => {
        try {
            const rawHistory = localStorage.getItem('veriscan_history');
            const history = JSON.parse(rawHistory || '[]');
            setUserHistory(Array.isArray(history) ? history : []);
        } catch (err) {
            console.error("Failed to load history:", err);
            setUserHistory([]);
        }
    };

    const saveToHistory = (item) => {
        const history = JSON.parse(localStorage.getItem('veriscan_history') || '[]');
        const newHistory = [item, ...history].slice(0, 10); // Keep last 10
        localStorage.setItem('veriscan_history', JSON.stringify(newHistory));
        setUserHistory(newHistory);
    };

    const handleClear = () => {
        setInput('');
        setResult(null);
        setError(null);
        setSelectedSample(null);
    };

    const resultRef = React.useRef(null);

    const handleDetect = async () => {
        setLoading(true);
        setError(null);
        try {
            const currentSample = mode === 'sample' && selectedSample !== null ? samples[selectedSample] : null;
            const payload = (mode === 'url' || (currentSample && currentSample.isUrl))
                ? { url: input }
                : { text: input };

            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            const res = await axios.post(`${apiBaseUrl}/api/detect`, payload, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            const data = res.data.data;
            setResult(data);

            // Save to history
            saveToHistory({
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                prediction: data.prediction,
                probability: data.probability,
                content: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
                type: mode === 'url' ? 'URL' : 'Text'
            });

            // Scroll to result
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail || err.message;
            setError(`Detection failed: ${detail}. Please check if the backend is running and all models are loaded.`);
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.message) return;

        setFeedbackStatus('loading');
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            await axios.post(`${apiBaseUrl}/api/feedback/submit`, feedback, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            setFeedbackStatus('success');
            setFeedback({ type: 'Accuracy Discrepancy', message: '' });
            setTimeout(() => setFeedbackStatus(null), 5000);
        } catch (err) {
            console.error(err);
            setFeedbackStatus('error');
        }
    };

    return (
        <div className="container max-w-[1400px] flex gap-8 py-8 animate-fade min-h-[90vh]">
            {/* Professional Sidebar */}
            <aside className="w-80 flex flex-col gap-6">
                <div className="glass p-8 flex flex-col gap-8 h-full">
                    <div className="flex items-center gap-3 px-2">
                        <Shield size={32} className="text-primary" />
                        <h2 className="text-2xl font-bold tracking-tighter text-white">VERISCAN</h2>
                    </div>

                    <nav className="flex flex-col gap-4">
                        <NavButton
                            active={activeModule === 'detection'}
                            onClick={() => setActiveModule('detection')}
                            icon={<Search size={22} />}
                            label="Detection"
                        />
                        <NavButton
                            active={activeModule === 'history'}
                            onClick={() => setActiveModule('history')}
                            icon={<History size={22} />}
                            label="History"
                        />
                        <NavButton
                            active={activeModule === 'profile'}
                            onClick={() => setActiveModule('profile')}
                            icon={<User size={22} />}
                            label="Profile"
                        />
                        <NavButton
                            active={activeModule === 'feedback'}
                            onClick={() => setActiveModule('feedback')}
                            icon={<MessageSquare size={22} />}
                            label="Feedback"
                        />
                    </nav>

                    <div className="mt-auto pt-6 border-t border-border/20 px-4">
                        <p className="text-xs text-text-muted font-medium uppercase tracking-widest">System Status</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-green animate-pulse"></div>
                            <span className="text-sm text-white/80">Neural Engine Active</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activeModule === 'detection' && (
                        <motion.div
                            key="detection"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-8"
                        >
                            <div className="glass p-10 shadow-2xl">
                                <header className="mb-8">
                                    <h1 className="text-3xl font-bold mb-2">News Verification Engine</h1>
                                    <p className="text-text-muted">Analyze news credibility with advanced AI modules.</p>
                                </header>

                                <div className="flex gap-4 mb-8 flex-wrap">
                                    <button
                                        onClick={() => { setMode('text'); setResult(null); }}
                                        className={`btn text-sm px-6 ${mode === 'text' ? 'btn-primary' : 'bg-transparent text-text-muted border-border hover:border-primary/50'}`}
                                    >
                                        Text Input
                                    </button>
                                    <button
                                        onClick={() => { setMode('url'); setResult(null); }}
                                        className={`btn text-sm px-6 ${mode === 'url' ? 'btn-primary' : 'bg-transparent text-text-muted border-border hover:border-primary/50'}`}
                                    >
                                        URL Analysis
                                    </button>
                                    <button
                                        onClick={() => { setMode('sample'); setResult(null); }}
                                        className={`btn text-sm px-6 ${mode === 'sample' ? 'btn-primary' : 'bg-transparent text-text-muted border-border hover:border-primary/50'}`}
                                    >
                                        Sample News
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className="btn bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all px-4 text-sm"
                                    >
                                        <AlertCircle size={16} /> Clear
                                    </button>
                                </div>

                                <div className="relative">
                                    {mode === 'url' ? (
                                        <div className="flex items-center">
                                            <LinkIcon className="absolute left-4 text-text-muted" size={18} />
                                            <input
                                                className="input-field pl-12 mb-0 py-4"
                                                placeholder="Paste news URL here..."
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                            />
                                        </div>
                                    ) : mode === 'text' ? (
                                        <textarea
                                            className="input-field h-48 py-4 px-5 text-base leading-relaxed"
                                            placeholder="Paste news content here (min 20 words)..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                        />
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                            {samples.map((s, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => {
                                                        setInput(s.content);
                                                        setSelectedSample(idx);
                                                        setResult(null);
                                                    }}
                                                    className={`p-5 rounded-xl bg-background border transition-all cursor-pointer group ${selectedSample === idx ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h3 className="font-semibold group-hover:text-primary transition-colors">{s.title}</h3>
                                                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${selectedSample === idx ? 'bg-primary text-white' : 'bg-surface text-text-muted'}`}>
                                                            {s.isUrl ? 'URL' : 'Text'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-text-muted line-clamp-1 italic">{s.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleDetect()}
                                    disabled={loading || (mode === 'sample' && selectedSample === null) || (mode !== 'sample' && !input)}
                                    className="btn btn-primary w-full mt-8 flex items-center justify-center gap-3 py-5 text-lg font-bold"
                                >
                                    {loading ? 'Analyzing Neural Data...' : <><Search size={22} /> Start Credibility Analysis</>}
                                </button>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3"
                                    >
                                        <AlertCircle size={18} /> {error}
                                    </motion.div>
                                )}
                            </div>

                            {result && (
                                <motion.div
                                    ref={resultRef}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                                >
                                    <div className="glass p-8 border-l-4 border-primary relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <BarChart2 size={80} />
                                        </div>
                                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            Analysis Result
                                        </h2>
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Classification</p>
                                                <p className={`text-4xl font-extrabold tracking-tighter ${result.prediction.toUpperCase() === 'REAL' ? 'text-green' : 'text-red'}`}>
                                                    {result.prediction.toUpperCase()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Credibility</p>
                                                <p className="text-4xl font-extrabold tracking-tighter text-white">{result.probability}%</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-border/20 h-2.5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.probability}%` }}
                                                className={`h-full ${result.prediction.toUpperCase() === 'REAL' ? 'bg-secondary' : 'bg-red-500'}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="glass p-8">
                                        <h2 className="text-xl font-bold mb-6">Detailed Insights</h2>
                                        <div className="grid grid-cols-1 gap-4">
                                            <InsightItem label="Sentiment Tone" value={result.sentiment} />
                                            <InsightItem label="Word Count" value={result.detailed_report.word_count} />
                                            <InsightItem label="Language" value={result.detailed_report.language.toUpperCase()} />
                                            <InsightItem label="Trust Score" value={`${result.detailed_report.credibility_score} / 10`} highlight />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {activeModule === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass p-10 min-h-[600px] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold">History Log</h2>
                                    <p className="text-text-muted mt-1">Monitor your recent analysis activities.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('veriscan_history');
                                        setUserHistory([]);
                                    }}
                                    className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20"
                                >
                                    Clear History
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {userHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                        <History size={64} className="mb-4" />
                                        <p className="text-xl font-medium">No history found</p>
                                        <p className="text-sm mt-2">Your analysis activities will appear here.</p>
                                    </div>
                                ) : (
                                    userHistory.map((item) => (
                                        <div key={item.id} className="glass p-5 border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between group">
                                            <div className="flex gap-5 items-center">
                                                <div className={`p-3 rounded-xl ${item.prediction === 'Real' ? 'bg-green/10 text-green' : 'bg-red-500/10 text-red-400'}`}>
                                                    {item.prediction === 'Real' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-lg text-white">{item.prediction.toUpperCase()}</span>
                                                        <span className="text-xs text-text-muted border border-border px-2 py-0.5 rounded uppercase">{item.type}</span>
                                                        <span className="text-xs text-text-muted">• {item.timestamp}</span>
                                                    </div>
                                                    <p className="text-sm text-text-muted line-clamp-1 italic max-w-lg">{item.content}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-text-muted mb-1 uppercase tracking-widest">Confidence</p>
                                                <p className="text-2xl font-black text-white">{item.probability}%</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeModule === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass p-10 min-h-[600px]"
                        >
                            <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Investigator Profile</h2>

                            {userInfo && (
                                <div className="flex flex-col md:flex-row gap-12 items-center md:items-start mt-10">
                                    <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white shadow-xl">
                                        <User size={96} />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <ProfileField label="Full Name" value={userInfo.username} />
                                            <ProfileField label="Email Address" value={userInfo.email || 'admin@veritas.ai'} />
                                            <ProfileField label="Access Level" value={userInfo.role || 'Tier 1 Agent'} />
                                            <ProfileField label="Member Since" value="February 2026" />
                                        </div>
                                        <div className="pt-6 border-t border-border/20">
                                            <button className="btn btn-primary px-8">Update Credentials</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeModule === 'feedback' && (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass p-10 min-h-[600px]"
                        >
                            <h2 className="text-3xl font-bold mb-6">Neural Feedback</h2>
                            <p className="text-text-muted mb-10">Submit reports to help improve the accuracy of our AI detection engine.</p>

                            {feedbackStatus === 'success' ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-8 bg-secondary/10 border border-secondary/20 rounded-3xl text-center"
                                >
                                    <CheckCircle size={64} className="text-secondary mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">Report Received</h3>
                                    <p className="text-text-muted">Thank you for your intelligence report. Our neural engineers will investigate immediately.</p>
                                    <button
                                        className="btn btn-primary mt-8 px-10"
                                        onClick={() => setFeedbackStatus(null)}
                                    >
                                        Send Another Report
                                    </button>
                                </motion.div>
                            ) : (
                                <form className="max-w-2xl flex flex-col gap-6" onSubmit={handleFeedbackSubmit}>
                                    <div>
                                        <label className="text-sm font-bold text-text-muted uppercase tracking-widest mb-3 block">Reporting Type</label>
                                        <select
                                            className="input-field py-4"
                                            value={feedback.type}
                                            onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
                                        >
                                            <option>Accuracy Discrepancy</option>
                                            <option>False Positive</option>
                                            <option>False Negative</option>
                                            <option>Model Suggestion</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-text-muted uppercase tracking-widest mb-3 block">Detailed Report</label>
                                        <textarea
                                            className="input-field h-40 py-4 px-5"
                                            placeholder="Explain the discrepancy or suggest an improvement..."
                                            value={feedback.message}
                                            onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={feedbackStatus === 'loading'}
                                        className="btn btn-primary py-4 px-10 font-bold text-lg"
                                    >
                                        {feedbackStatus === 'loading' ? 'Transmitting Data...' : 'Send Intelligence Report'}
                                    </button>
                                    {feedbackStatus === 'error' && (
                                        <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                                            <AlertCircle size={16} /> Connection failed. Please ensure the backend is running.
                                        </p>
                                    )}
                                </form>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

const NavButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`btn w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all font-bold group ${active ? 'btn-primary shadow-lg shadow-primary/20' : 'bg-transparent text-text-muted border border-border/50 hover:border-primary/50 hover:text-white'}`}
    >
        <span className={`${active ? 'text-white' : 'text-primary/70 group-hover:text-primary'} transition-colors`}>
            {icon}
        </span>
        <span className="text-base tracking-wide">{label}</span>
    </button>
);

const InsightItem = ({ label, value, highlight }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/10 last:border-0">
        <span className="text-text-muted text-sm tracking-wide">{label}</span>
        <span className={`font-bold ${highlight ? 'text-primary' : 'text-white'}`}>{value}</span>
    </div>
);

const ProfileField = ({ label, value }) => (
    <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">{label}</span>
        <span className="text-xl font-bold text-white tracking-tight">{value}</span>
    </div>
);

export default Dashboard;
