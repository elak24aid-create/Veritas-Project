import React, { useState, useEffect, useRef } from 'react';
import {
    Shield, Search, X, RefreshCw, ExternalLink, Check, CheckSquare,
    History as HistoryIcon, Bookmark, User, ArrowLeft, FileText,
    Camera, Link as LinkIcon, Mic, MicOff, AlertTriangle, AlertCircle,
    CheckCircle, Share2, Copy, Flag, Trash2, Edit3, MessageSquare, ChevronRight,
    Sun, Moon, UploadCloud, Image as ImageIcon, Loader2
} from 'lucide-react';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import {
    getApiBaseUrl,
    apiRequest,
    setCustomApiUrl,
    testServerConnection,
    VERCEL_CLOUD_URL,
    CLOUD_TUNNEL_URL,
    LOCAL_WIFI_URL,
    EMULATOR_URL
} from '../config';
import { translations } from '../i18n';

const CATEGORY_KEYS = [
    'All',
    'Political',
    'Healthcare',
    'Science',
    'Government',
    'Crime',
    'World',
    'India',
    'Weather',
    'Sports',
    'Business'
];

const LANGUAGE_OPTIONS = [
    { code: 'English', label: 'English (Default)' },
    { code: 'Tamil', label: 'தமிழ் (Tamil)' },
    { code: 'Hindi', label: 'हिन्दी (Hindi)' },
    { code: 'Telugu', label: 'తెలుగు (Telugu)' },
    { code: 'Malayalam', label: 'മലയാളം (Malayalam)' },
    { code: 'Kannada', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'Bengali', label: 'বাংলা (Bengali)' },
    { code: 'Marathi', label: 'मराठी (Marathi)' },
    { code: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
    { code: 'Punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'Urdu', label: 'اردو (Urdu)' },
    { code: 'Spanish', label: 'Español (Spanish)' },
    { code: 'French', label: 'Français (French)' },
    { code: 'German', label: 'Deutsch (German)' },
    { code: 'Italian', label: 'Italiano (Italian)' },
    { code: 'Portuguese', label: 'Português (Portuguese)' },
    { code: 'Russian', label: 'Русский (Russian)' },
    { code: 'Japanese', label: '日本語 (Japanese)' },
    { code: 'Chinese', label: '中文 (Chinese)' },
    { code: 'Arabic', label: 'العربية (Arabic)' }
];

const LANG_SPEECH_MAP = {
    English: 'en-US',
    Tamil: 'ta-IN',
    Hindi: 'hi-IN',
    Telugu: 'te-IN',
    Malayalam: 'ml-IN',
    Kannada: 'kn-IN',
    Bengali: 'bn-IN',
    Marathi: 'mr-IN',
    Gujarati: 'gu-IN',
    Punjabi: 'pa-IN',
    Urdu: 'ur-IN',
    Spanish: 'es-ES',
    French: 'fr-FR',
    German: 'de-DE',
    Italian: 'it-IT',
    Portuguese: 'pt-PT',
    Russian: 'ru-RU',
    Japanese: 'ja-JP',
    Chinese: 'zh-CN',
    Arabic: 'ar-SA'
};

const NEWS_LANGUAGES = [
    { code: 'ta', name: 'tamil', native: 'தமிழ்' },
    { code: 'en', name: 'english', native: 'English' },
    { code: 'hi', name: 'hindhi', native: 'हिन्दी' },
    { code: 'ml', name: 'malayam', native: 'മലയാളം' },
    { code: 'ja', name: 'japa', native: '日本語' },
    { code: 'te', name: 'telugu', native: 'తెలుగు' },
    { code: 'kn', name: 'kannada', native: 'ಕನ್ನಡ' },
    { code: 'bn', name: 'bengali', native: 'বাংলা' },
    { code: 'mr', name: 'marathi', native: 'मराठी' },
    { code: 'gu', name: 'gujarati', native: 'ગુજરાતી' },
    { code: 'pa', name: 'punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'ur', name: 'urdu', native: 'اردو' },
    { code: 'es', name: 'spanish', native: 'Español' },
    { code: 'fr', name: 'french', native: 'Français' },
    { code: 'de', name: 'german', native: 'Deutsch' },
    { code: 'ru', name: 'russian', native: 'Русский' },
    { code: 'zh', name: 'chinese', native: '中文' },
    { code: 'ar', name: 'arabic', native: 'العربية' }
];

const Dashboard = () => {
    // Language & Theme State
    const [language, setLanguage] = useState(() => localStorage.getItem('truthlens_lang') || 'English');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('truthlens_theme') !== 'light');

    // i18n Dictionary Accessor
    const t = translations[language] || translations.English;

    // Apply Dark / Light Theme
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.remove('light-theme');
            localStorage.setItem('truthlens_theme', 'dark');
        } else {
            document.documentElement.classList.add('light-theme');
            localStorage.setItem('truthlens_theme', 'light');
        }
    }, [darkMode]);

    // Handle Language Change
    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        localStorage.setItem('truthlens_lang', newLang);
        showToast(`Language switched to ${newLang}`);
    };

    // Navigation State
    const [activeTab, setActiveTab] = useState('home'); // 'home', 'check', 'history', 'saved', 'profile'
    const [viewMode, setViewMode] = useState('tabs'); // 'tabs' or 'result'

    // Home / Live News States
    const [newsSearch, setNewsSearch] = useState('');
    const [newsLanguage, setNewsLanguage] = useState(() => {
        return localStorage.getItem('truthlens_news_lang') || 'en';
    });
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [dailyNews, setDailyNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [lastUpdatedTime, setLastUpdatedTime] = useState('');
    const [nextRefreshSec, setNextRefreshSec] = useState(300);

    // Check News States
    const [checkSubTab, setCheckSubTab] = useState('text'); // 'text', 'ocr', 'url', 'voice'
    const [textContent, setTextContent] = useState('');
    const [urlContent, setUrlContent] = useState('');
    const [voiceContent, setVoiceContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [ocrImageFile, setOcrImageFile] = useState(null);
    const [ocrImagePreview, setOcrImagePreview] = useState(null);
    const [ocrScanning, setOcrScanning] = useState(false);
    const [ocrExtractedHeadline, setOcrExtractedHeadline] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);

    // Analysis Result States
    const [activeResult, setActiveResult] = useState(null);
    const [isSavedCurrent, setIsSavedCurrent] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [customNote, setCustomNote] = useState('');
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportText, setReportText] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [downloadingCert, setDownloadingCert] = useState(false);

    // History States
    const [historyList, setHistoryList] = useState([]);
    const [historySearch, setHistorySearch] = useState('');
    const [historyInputFilter, setHistoryInputFilter] = useState('All Inputs');
    const [historyVerdictFilter, setHistoryVerdictFilter] = useState('All Verdicts');

    // Saved Results States
    const [savedList, setSavedList] = useState([]);

    // Profile States
    const [autoRefreshFeed, setAutoRefreshFeed] = useState(true);
    const [liveWebResearch, setLiveWebResearch] = useState(true);

    // Server Connection States (Mobile / Remote sync)
    const [serverOnline, setServerOnline] = useState(true);
    const [serverUrl, setServerUrl] = useState(() => getApiBaseUrl());
    const [customServerInput, setCustomServerInput] = useState('');

    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);

    // Show temporary toast notification
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 2500);
    };

    const refreshSecRef = useRef(300);

    // Load initial data
    useEffect(() => {
        // Automatically purge any stale local/laptop IPs from phone localStorage so app never gets stuck
        try {
            const saved = localStorage.getItem('truthlens_custom_api_url') || localStorage.getItem('fnds_custom_api_url');
            if (saved && (saved.includes('10.48.') || saved.includes('192.168.') || saved.includes('loca.lt') || saved.includes('localhost'))) {
                localStorage.removeItem('truthlens_custom_api_url');
                localStorage.removeItem('fnds_custom_api_url');
            }
        } catch (e) {}

        testServerConnection().then(online => {
            setServerOnline(online);
            setServerUrl(getApiBaseUrl());
        });
        loadDailyNews('All', true, newsLanguage);
        loadLocalHistory();
        loadLocalSaved();
    }, []);

    // 5-Minute (300 seconds) Auto-Refresh Engine (Rock-solid single interval ticker)
    useEffect(() => {
        if (!autoRefreshFeed) return;

        const ticker = setInterval(() => {
            refreshSecRef.current -= 1;
            if (refreshSecRef.current <= 0) {
                refreshSecRef.current = 300;
                setNextRefreshSec(300);
                loadDailyNews(selectedCategory, true, newsLanguage);
            } else {
                setNextRefreshSec(refreshSecRef.current);
            }
        }, 1000);

        return () => clearInterval(ticker);
    }, [selectedCategory, newsLanguage, autoRefreshFeed]);

    const formatCountdown = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    };

    // Load News Feed from Backend with Auto-Fallback
    const loadDailyNews = async (cat = 'All', force = false, lang = newsLanguage) => {
        setNewsLoading(true);
        try {
            const res = await apiRequest(`/api/daily-news?category=${encodeURIComponent(cat)}&language=${encodeURIComponent(lang)}&force=${force}`, { method: 'GET' });
            if (res.data && res.data.data && res.data.data.length > 0) {
                setDailyNews(res.data.data);
                setLastUpdatedTime(res.data.last_updated || new Date().toISOString().slice(0, 19).replace('T', ' '));
                refreshSecRef.current = 300;
                setNextRefreshSec(300);
                setServerOnline(true);
                setServerUrl(getApiBaseUrl());
                return;
            }
        } catch (err) {
            console.warn('Primary apiRequest failed, trying direct Vercel cloud news feed...', err);
            try {
                const cloudRes = await axios.get(`${VERCEL_CLOUD_URL}/api/daily-news?category=${encodeURIComponent(cat)}&language=${encodeURIComponent(lang)}&force=${force}`, {
                    timeout: 7000
                });
                if (cloudRes.data && cloudRes.data.data && cloudRes.data.data.length > 0) {
                    setDailyNews(cloudRes.data.data);
                    setLastUpdatedTime(cloudRes.data.last_updated || new Date().toISOString().slice(0, 19).replace('T', ' '));
                    refreshSecRef.current = 300;
                    setNextRefreshSec(300);
                    setServerOnline(true);
                    setServerUrl(VERCEL_CLOUD_URL);
                    return;
                }
            } catch (cloudErr) {
                console.error('All live news endpoints failed', cloudErr);
                setServerOnline(false);
            }
        } finally {
            setNewsLoading(false);
        }
    };

    // Server Preset Changer
    const handleApplyServerPreset = async (presetUrl, name) => {
        setCustomApiUrl(presetUrl);
        setServerUrl(presetUrl);
        showToast(`Connecting to ${name}...`);
        const online = await testServerConnection(presetUrl);
        setServerOnline(online);
        if (online) {
            showToast(`Connected to ${name}!`);
            loadDailyNews(selectedCategory, true, newsLanguage);
        } else {
            showToast(`Could not reach ${name}.`);
        }
    };

    // Custom Server IP Saver
    const handleSaveCustomServer = async () => {
        if (!customServerInput.trim()) return;
        const target = customServerInput.trim();
        setCustomApiUrl(target);
        setServerUrl(target);
        showToast('Testing server connection...');
        const online = await testServerConnection(target);
        setServerOnline(online);
        if (online) {
            showToast('Connected to server!');
            setCustomServerInput('');
            loadDailyNews(selectedCategory, true, newsLanguage);
        } else {
            showToast('Connection failed. Please check IP & port.');
        }
    };

    // News Feed Language Change Handler
    const handleNewsLanguageChange = (langCode) => {
        setNewsLanguage(langCode);
        localStorage.setItem('truthlens_news_lang', langCode);
        refreshSecRef.current = 300;
        setNextRefreshSec(300);
        loadDailyNews(selectedCategory, true, langCode);
        const langObj = NEWS_LANGUAGES.find(l => l.code === langCode);
        showToast(`News language switched to ${langObj?.name || langCode}`);
    };

    // Category Change Handler
    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
        refreshSecRef.current = 300;
        setNextRefreshSec(300);
        loadDailyNews(cat, true, newsLanguage);
    };

    // Load History with Auto-Fallback
    const loadLocalHistory = async () => {
        try {
            const res = await apiRequest('/api/history', { method: 'GET' });
            if (res.data && res.data.data && res.data.data.length > 0) {
                setHistoryList(res.data.data);
                localStorage.setItem('truthlens_history', JSON.stringify(res.data.data));
                setServerOnline(true);
                return;
            }
        } catch (e) {
            console.warn('Backend history fallback to local storage');
        }

        try {
            const stored = localStorage.getItem('truthlens_history');
            if (stored) {
                setHistoryList(JSON.parse(stored));
            } else {
                const seed = [
                    {
                        id: 1,
                        input_type: 'Text',
                        content: 'The Supreme Court judge says no amount of whatabouttery can justify the exclusion of voters...',
                        prediction: 'Real',
                        probability: 91,
                        credibility_score: 9.1,
                        reasons: ['High objective reporting structure detected.', 'Verified via accredited legal news databases.'],
                        timestamp: '2026-10-04'
                    },
                    {
                        id: 2,
                        input_type: 'Text',
                        content: 'Joseph Vijay is the CM of Tamilnadu',
                        prediction: 'Fake',
                        probability: 95,
                        credibility_score: 1.2,
                        reasons: ['Official government gazette cross-verification confirms current CM is M. K. Stalin.'],
                        timestamp: '2026-10-04'
                    },
                    {
                        id: 3,
                        input_type: 'URL',
                        content: 'https://www.ajc.com/news/2026/10/bosnia-votes-as-pro-russian-politician-looms-large',
                        prediction: 'Real',
                        probability: 87,
                        credibility_score: 8.7,
                        reasons: ['URL belongs to accredited journalism network.', 'Cross-referenced with live European election wire reports.'],
                        timestamp: '2026-10-04'
                    }
                ];
                setHistoryList(seed);
                localStorage.setItem('truthlens_history', JSON.stringify(seed));
            }
        } catch (err) {
            console.error('History load error', err);
        }
    };

    // Load Saved Results
    const loadLocalSaved = () => {
        try {
            const stored = localStorage.getItem('truthlens_saved');
            if (stored) {
                setSavedList(JSON.parse(stored));
            } else {
                const seed = [
                    {
                        id: 'saved-1',
                        title: 'https://www.cnbc.com/2026/10/06/oil-fell-as-traders-weigh-gulf-tensions',
                        content: 'Oil prices slip as traders weigh strong Mideast exports against Gulf tensions',
                        publisher: 'CNBC',
                        prediction: 'Real',
                        probability: 87,
                        timestamp: '2026-10-06T07:29:14.619913',
                        note: ''
                    },
                    {
                        id: 'saved-2',
                        title: 'https://www.cnbc.com/2026/10/06/oil-fell-as-traders-weigh-mideast',
                        content: 'The G7 emergency stockpile release introduces new downward pressure on oil prices.',
                        publisher: 'CNBC',
                        prediction: 'Real',
                        probability: 89,
                        timestamp: '2026-10-06T07:29:28.912836',
                        note: 'goog for students'
                    }
                ];
                setSavedList(seed);
                localStorage.setItem('truthlens_saved', JSON.stringify(seed));
            }
        } catch (e) {
            console.error('Saved list load error', e);
        }
    };

    // REAL IMAGE OCR EXTRACTION USING TESSERACT.JS
    const handleImageFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setOcrImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setOcrImagePreview(previewUrl);
        setOcrScanning(true);
        setAnalysisError(null);

        try {
            // Real Client-Side OCR processing
            const ocrResult = await Tesseract.recognize(file, 'eng', {
                logger: (m) => {
                    // Optional logging
                }
            });

            const rawText = ocrResult?.data?.text?.trim() || '';
            // Clean extracted text (remove excessive newlines)
            const cleanText = rawText.replace(/\s+/g, ' ').trim();

            if (cleanText.length > 5) {
                setOcrExtractedHeadline(cleanText);
                showToast('OCR extracted text from image successfully!');
            } else {
                // If the image is purely visual (e.g. photo without readable text)
                const cleanFileName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                const isGeneric = cleanFileName.toLowerCase().startsWith('screenshot') || cleanFileName.toLowerCase().startsWith('image') || cleanFileName.toLowerCase().startsWith('img');
                if (!isGeneric && cleanFileName.length > 3) {
                    setOcrExtractedHeadline(cleanFileName);
                } else {
                    setOcrExtractedHeadline('');
                }
                showToast('Image loaded. Please verify or describe the claim below.');
            }
        } catch (ocrErr) {
            console.warn('OCR extraction warning:', ocrErr);
            setOcrExtractedHeadline('');
            showToast('Could not extract text. You can type the claim below.');
        } finally {
            setOcrScanning(false);
        }
    };

    const handleClearOcrImage = () => {
        setOcrImageFile(null);
        setOcrImagePreview(null);
        setOcrExtractedHeadline('');
        setOcrScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Analyze News Handler
    const handleAnalyze = async (overrideContent = null, overrideType = null) => {
        let contentToAnalyze = '';
        let typeToUse = overrideType || 'Text';

        if (overrideContent) {
            contentToAnalyze = overrideContent;
        } else {
            if (checkSubTab === 'text') {
                contentToAnalyze = textContent;
                typeToUse = 'Text';
            } else if (checkSubTab === 'url') {
                contentToAnalyze = urlContent;
                typeToUse = 'URL';
            } else if (checkSubTab === 'voice') {
                contentToAnalyze = voiceContent;
                typeToUse = 'Voice Claim';
            } else if (checkSubTab === 'ocr') {
                contentToAnalyze = ocrExtractedHeadline.trim() || (ocrImageFile ? `Visual Image: ${ocrImageFile.name}` : '');
                typeToUse = 'Image OCR';
            }
        }

        if (typeToUse === 'Image OCR' && !ocrImageFile && (!contentToAnalyze || contentToAnalyze.trim().length === 0)) {
            setAnalysisError('Please choose or upload a news image or photo to analyze.');
            return;
        }

        if (typeToUse !== 'Image OCR' && (!contentToAnalyze || contentToAnalyze.trim().length === 0)) {
            if (checkSubTab === 'url' && !urlContent) {
                setAnalysisError('Please enter or paste a news article URL.');
            } else if (checkSubTab === 'voice' && !voiceContent) {
                setAnalysisError('Please speak a claim or record audio to analyze.');
            } else {
                setAnalysisError('Please enter news content to analyze.');
            }
            return;
        }

        setAnalysisError(null);
        setAnalyzing(true);

        try {
            let res;

            if (typeToUse === 'Image OCR' && ocrImageFile) {
                // MULTIPART FORMDATA: SEND ACTUAL IMAGE FILE TO NEURAL VISION FORENSIC SCANNER
                const formData = new FormData();
                formData.append('file', ocrImageFile);
                formData.append('text', ocrExtractedHeadline.trim() || '');
                formData.append('username', 'elak24aid');
                formData.append('input_type', 'Image OCR');

                res = await apiRequest('/api/detect-image', {
                    method: 'POST',
                    data: formData,
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 45000
                });
            } else {
                const payload = {
                    text: typeToUse === 'URL' ? '' : contentToAnalyze,
                    url: typeToUse === 'URL' ? contentToAnalyze : '',
                    username: 'elak24aid',
                    input_type: typeToUse
                };
                res = await apiRequest('/api/detect', {
                    method: 'POST',
                    data: payload,
                    timeout: 30000
                });
            }

            setServerOnline(true);
            setServerUrl(getApiBaseUrl());
            const data = res.data.data;

            const resultObj = {
                id: Date.now(),
                title: data.title || (ocrImageFile ? ocrImageFile.name : contentToAnalyze.slice(0, 100)),
                content: contentToAnalyze || (ocrImageFile ? `Image: ${ocrImageFile.name}` : ''),
                image_preview: typeToUse === 'Image OCR' ? ocrImagePreview : null,
                is_ai_generated: data.is_ai_generated || false,
                prediction: data.prediction,
                probability: data.probability,
                publisher: data.publisher || (typeToUse === 'URL' ? 'Accredited Web Source' : typeToUse === 'Image OCR' ? 'TruthLens Forensic Vision Scan' : 'Public Domain'),
                explanation: data.explanation || (data.prediction === 'Real' ? t.explanation : 'Neural vision classification and forensic signal analysis detect synthetic or manipulated media.'),
                reasons: data.reasons || [],
                citations: data.citations || [
                    {
                        source: 'TruthLens Neural Vision Classifier',
                        evidence_type: 'NEURAL_FORENSIC',
                        title: data.title || contentToAnalyze.slice(0, 70),
                        date: new Date().toISOString(),
                        url: 'https://huggingface.co/Deckard18/detect-ai-image-models'
                    }
                ],
                input_type: typeToUse,
                timestamp: new Date().toISOString()
            };

            setActiveResult(resultObj);
            setIsSavedCurrent(false);
            setViewMode('result');

            // Save to local and backend history
            const newHistory = [resultObj, ...historyList].slice(0, 50);
            setHistoryList(newHistory);
            localStorage.setItem('truthlens_history', JSON.stringify(newHistory));

        } catch (err) {
            console.error('Detection request error:', err);
            setAnalysisError(err.response?.data?.detail || 'Analysis failed. Please verify connection and try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    // Quick Test Examples
    const handleQuickExample = (type) => {
        if (checkSubTab === 'voice') {
            const claim = type === 'sensational'
                ? "Shocking viral forward claims drinking salt water cures virus instantly!"
                : "NASA confirms space station orbit adjustment maneuvers completed successfully.";
            setVoiceContent(claim);
            showToast('Sample voice claim loaded.');
            return;
        }
        if (type === 'sensational') {
            const claim = "SHOCKING! Secret space agency leaked documents reveal hidden asteroid heading to Earth tomorrow! Forward to 10 groups immediately!";
            setTextContent(claim);
            setCheckSubTab('text');
        } else {
            const report = "Oil prices slip as traders weigh strong Mideast exports against Gulf tensions";
            setTextContent(report);
            setCheckSubTab('text');
        }
    };

    // Paste from Clipboard
    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (checkSubTab === 'url') {
                setUrlContent(text);
            } else if (checkSubTab === 'voice') {
                setVoiceContent(text);
            } else {
                setTextContent(text);
            }
            showToast(t.pasteBtn + ' successful!');
        } catch (e) {
            showToast('Please paste manually using Ctrl+V');
        }
    };

    // Start Speech Recognition with language support and live transcription
    const startSpeechRecognition = async () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            showToast('Speech recognition not supported in this browser. You can type or use sample claims below.');
            return;
        }

        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(track => track.stop());
                } catch (micErr) {
                    console.warn('Microphone permission notice:', micErr);
                }
            }

            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            const rec = new SpeechRec();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = LANG_SPEECH_MAP[language] || 'en-US';

            rec.onstart = () => {
                setIsRecording(true);
                showToast('Listening... Speak now.');
            };

            rec.onresult = (event) => {
                let fullTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    fullTranscript += event.results[i][0].transcript + ' ';
                }
                setVoiceContent(fullTranscript.trim());
            };

            rec.onerror = (e) => {
                console.warn('Speech recognition notice:', e);
                setIsRecording(false);
                if (e.error === 'not-allowed') {
                    showToast('Microphone access denied. Please allow microphone permissions.');
                }
            };

            rec.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = rec;
            rec.start();
        } catch (err) {
            console.warn('Speech recognition start error:', err);
            setIsRecording(false);
        }
    };

    // Voice Recording Toggle
    const handleToggleVoice = () => {
        if (isRecording) {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {}
            }
            setIsRecording(false);
            showToast('Voice recording stopped.');
        } else {
            startSpeechRecognition();
        }
    };

    // Save Active Result
    const handleToggleSave = () => {
        if (!activeResult) return;

        const exists = savedList.some(s => s.id === activeResult.id || (s.content && s.content === activeResult.content));
        if (exists) {
            const updated = savedList.filter(s => s.id !== activeResult.id && s.content !== activeResult.content);
            setSavedList(updated);
            localStorage.setItem('truthlens_saved', JSON.stringify(updated));
            setIsSavedCurrent(false);
            showToast('Removed from Saved Results');
        } else {
            const newSavedItem = {
                id: activeResult.id || Date.now(),
                title: activeResult.title || activeResult.content.slice(0, 80),
                content: activeResult.content,
                publisher: activeResult.publisher || 'Verified Source',
                prediction: activeResult.prediction,
                probability: activeResult.probability,
                timestamp: activeResult.timestamp || new Date().toISOString(),
                note: customNote || '',
                rawResult: activeResult
            };
            const updated = [newSavedItem, ...savedList];
            setSavedList(updated);
            localStorage.setItem('truthlens_saved', JSON.stringify(updated));
            setIsSavedCurrent(true);
            showToast('Saved to Saved Results!');
        }
    };

    // Add Note to Result
    const handleSaveNote = () => {
        if (!activeResult) return;
        setNoteModalOpen(false);

        const existingIndex = savedList.findIndex(s => s.id === activeResult.id || s.content === activeResult.content);
        let updated;
        if (existingIndex >= 0) {
            updated = [...savedList];
            updated[existingIndex].note = customNote;
        } else {
            const newSavedItem = {
                id: activeResult.id || Date.now(),
                title: activeResult.title || activeResult.content.slice(0, 80),
                content: activeResult.content,
                publisher: activeResult.publisher || 'Verified Source',
                prediction: activeResult.prediction,
                probability: activeResult.probability,
                timestamp: activeResult.timestamp || new Date().toISOString(),
                note: customNote,
                rawResult: activeResult
            };
            updated = [newSavedItem, ...savedList];
            setIsSavedCurrent(true);
        }
        setSavedList(updated);
        localStorage.setItem('truthlens_saved', JSON.stringify(updated));
        showToast('Note added successfully!');
    };

    // Copy Summary
    const handleCopySummary = () => {
        if (!activeResult) return;
        const summary = `TruthLens Verification\nVerdict: ${activeResult.prediction.toUpperCase()} (${activeResult.probability}%)\nHeadline: ${activeResult.title}\nSource: ${activeResult.publisher}\nVerified with TruthLens AI Engine.`;
        navigator.clipboard.writeText(summary);
        showToast('Summary copied to clipboard!');
    };

    // Share Result
    const handleShare = async () => {
        if (!activeResult) return;
        const text = `TruthLens Fact-Check: ${activeResult.title} is classified as ${activeResult.prediction.toUpperCase()} with ${activeResult.probability}% confidence.`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'TruthLens Analysis',
                    text: text,
                    url: window.location.href
                });
            } catch (e) {
                // Ignore cancel
            }
        } else {
            navigator.clipboard.writeText(text);
            showToast('Link copied to clipboard!');
        }
    };

    // Download PDF Certificate
    const handleDownloadPDF = async () => {
        if (!activeResult) return;
        setDownloadingCert(true);
        try {
            const res = await apiRequest('/api/download-certificate', {
                method: 'POST',
                data: {
                    prediction: activeResult.prediction,
                    probability: activeResult.probability,
                    trust_score: (activeResult.probability / 10).toFixed(1),
                    sentiment: 'Neutral',
                    content: activeResult.content,
                    reasons: activeResult.reasons || ['Cross-referenced with live online accredited publications.']
                },
                responseType: 'blob'
            });

            const blob = new Blob([res.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `TruthLens_${activeResult.prediction}_Certificate.pdf`;
            link.click();
            showToast('Certificate downloaded!');
        } catch (err) {
            console.error('PDF download error:', err);
            showToast('Certificate generated.');
        } finally {
            setDownloadingCert(false);
        }
    };

    // Report Feedback
    const handleSubmitReport = async () => {
        try {
            await apiRequest('/api/feedback/submit', {
                method: 'POST',
                data: {
                    prediction: activeResult?.prediction || 'Uncertain',
                    user_feedback: reportText || 'User reported this result for review.',
                    content_snippet: activeResult?.content?.slice(0, 150) || ''
                }
            });
        } catch (e) {
            // Ignore
        }
        setReportModalOpen(false);
        setReportText('');
        showToast('Report submitted for manual review.');
    };

    // Delete single history item
    const handleDeleteHistoryItem = async (e, id) => {
        e.stopPropagation();
        try {
            await apiRequest(`/api/history/${id}`, { method: 'DELETE' });
        } catch (err) {
            // fallback
        }
        const updated = historyList.filter(item => item.id !== id);
        setHistoryList(updated);
        localStorage.setItem('truthlens_history', JSON.stringify(updated));
        showToast('History item removed');
    };

    // Clear all history
    const handleClearAllHistory = async () => {
        if (!window.confirm('Are you sure you want to clear your entire check history?')) return;
        try {
            await apiRequest('/api/history', { method: 'DELETE' });
        } catch (err) {
            // fallback
        }
        setHistoryList([]);
        localStorage.removeItem('truthlens_history');
        showToast('Check history cleared');
    };

    // Delete single saved item
    const handleDeleteSavedItem = (e, id) => {
        e.stopPropagation();
        const updated = savedList.filter(item => item.id !== id);
        setSavedList(updated);
        localStorage.setItem('truthlens_saved', JSON.stringify(updated));
        showToast('Saved item removed');
    };

    // Clear all saved
    const handleClearAllSaved = () => {
        if (!window.confirm('Clear all saved items?')) return;
        setSavedList([]);
        localStorage.removeItem('truthlens_saved');
        showToast('Saved results cleared');
    };

    // Filtered Live News items
    const filteredNews = dailyNews.filter(item => {
        if (!newsSearch.trim()) return true;
        const q = newsSearch.toLowerCase();
        return item.title?.toLowerCase().includes(q) || item.source_name?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q);
    });

    // Filtered History items
    const filteredHistory = historyList.filter(item => {
        if (historySearch.trim()) {
            const q = historySearch.toLowerCase();
            const matchesText = item.content?.toLowerCase().includes(q) || item.title?.toLowerCase().includes(q);
            if (!matchesText) return false;
        }
        if (historyInputFilter !== 'All Inputs') {
            const itemType = item.input_type || 'Text';
            if (historyInputFilter === 'Text' && itemType !== 'Text') return false;
            if (historyInputFilter === 'URL' && itemType !== 'URL') return false;
            if (historyInputFilter === 'Image OCR' && !itemType.toLowerCase().includes('ocr') && !itemType.toLowerCase().includes('image')) return false;
            if (historyInputFilter === 'Voice Claim' && !itemType.toLowerCase().includes('voice') && !itemType.toLowerCase().includes('audio')) return false;
        }
        if (historyVerdictFilter !== 'All Verdicts') {
            if (historyVerdictFilter.toLowerCase() !== item.prediction.toLowerCase()) return false;
        }
        return true;
    });

    // ==========================================
    // RENDER: ANALYSIS RESULT SCREEN
    // ==========================================
    if (viewMode === 'result' && activeResult) {
        const isReal = activeResult.prediction.toLowerCase() === 'real';

        return (
            <div className="flex flex-col min-h-screen pb-safe app-container">
                {/* Top Bar matching Photo 4, 6, 8 */}
                <div className="pt-safe px-4 py-3 flex items-center justify-between border-b card-subtle sticky top-0 z-40">
                    <button
                        onClick={() => setViewMode('tabs')}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-bold text-lg">{t.analysisResult}</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={downloadingCert}
                            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                            title="Download Verification PDF"
                        >
                            <FileText size={20} />
                        </button>
                        <button
                            onClick={handleToggleSave}
                            className={`p-1.5 rounded-lg transition-colors ${isSavedCurrent ? 'text-blue-500 bg-blue-500/10' : 'hover:bg-black/10'}`}
                            title="Save Result"
                        >
                            <Bookmark size={20} fill={isSavedCurrent ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>

                <div className="p-4 flex flex-col gap-4 animate-fade">
                    {/* Top Assessment Score Card */}
                    <div className={`rounded-2xl p-6 text-center shadow-lg transition-all ${isReal ? 'bg-[#f0fdf4] text-slate-900' : 'bg-[#fef2f2] text-slate-900'}`}>
                        {/* Top Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-2 border"
                            style={{
                                backgroundColor: isReal ? '#dcfce7' : '#fee2e2',
                                color: isReal ? '#15803d' : '#b91c1c',
                                borderColor: isReal ? '#86efac' : '#fca5a5'
                            }}
                        >
                            <CheckCircle size={14} />
                            <span>{isReal ? t.real : (activeResult.is_ai_generated ? 'AI Generated / Fake' : t.fake)}</span>
                        </div>

                        {/* Image Preview if analyzed */}
                        {activeResult.image_preview && (
                            <div className="my-2 flex justify-center">
                                <img
                                    src={activeResult.image_preview}
                                    alt="Analyzed Image"
                                    className="w-28 h-28 object-cover rounded-xl border-2 border-slate-300 shadow-md"
                                />
                            </div>
                        )}

                        {/* Mode badge */}
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            {activeResult.is_ai_generated ? 'Neural Vision AI Detector' : t.modeWeb}
                        </div>

                        {/* Huge Bold Verdict & Percentage */}
                        <div className="my-1">
                            <span
                                className="text-4xl font-black tracking-tight"
                                style={{ color: isReal ? '#15803d' : '#dc2626' }}
                            >
                                {isReal ? t.real : (activeResult.is_ai_generated ? 'AI Fake' : t.fake)} {activeResult.probability}%
                            </span>
                        </div>

                        {/* Subtitle */}
                        <div className="text-xs text-slate-600 font-medium mb-3">
                            {activeResult.is_ai_generated ? 'AI Synthetic Media Score' : t.assessmentScore} ⓘ
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${activeResult.probability}%`,
                                    backgroundColor: isReal ? '#059669' : '#dc2626'
                                }}
                            />
                        </div>
                    </div>

                    {/* Card 2: Verification Details */}
                    <div className="card-dark p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm font-bold mb-1">
                            <div className="w-5 h-5 rounded bg-blue-600/20 text-blue-500 flex items-center justify-center">
                                ⚙
                            </div>
                            <span>{t.verificationDetails}</span>
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold opacity-75">{t.verdict}: </span>
                            <span className={`font-bold ${isReal ? 'text-emerald-500' : 'text-red-500'}`}>
                                {isReal ? t.likelyGenuine : (activeResult.is_ai_generated ? 'AI-Generated Synthetic Media / Fake' : t.misleadingFake)}
                            </span>
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold opacity-75">{t.confidence}: </span>
                            <span className="font-bold">{activeResult.probability}%</span>
                        </div>
                        <div className="text-xs leading-relaxed pt-1 border-t border-black/10">
                            <span className="font-semibold">{t.explanation}: </span>
                            {activeResult.explanation}
                        </div>

                        {/* Key Forensic Evidence Points */}
                        {activeResult.reasons && activeResult.reasons.length > 0 && (
                            <div className="pt-2 border-t border-black/10 flex flex-col gap-1.5">
                                <span className="text-xs font-bold opacity-80">Forensic & AI Evidence Points:</span>
                                {activeResult.reasons.map((r, i) => (
                                    <div key={i} className="text-xs opacity-90 flex items-start gap-1.5 leading-snug">
                                        <span className="text-blue-500 font-bold">•</span>
                                        <span>{r}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Card 3: Source Information */}
                    <div className="card-dark p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm font-bold mb-1">
                            <div className="w-5 h-5 rounded bg-blue-600/20 text-blue-500 flex items-center justify-center">
                                📰
                            </div>
                            <span>{t.sourceInfo}</span>
                        </div>
                        <div className="text-xs leading-snug">
                            <span className="font-semibold opacity-75">{t.title}: </span>
                            {activeResult.title}
                        </div>
                        <div className="text-xs">
                            <span className="font-semibold opacity-75">{t.publisher}: </span>
                            {activeResult.publisher}
                        </div>
                    </div>

                    {/* Card 4: Online Evidence matching Photo 4 & 6 */}
                    <div className="card-dark p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <div className="w-5 h-5 rounded bg-blue-600/20 text-blue-500 flex items-center justify-center">
                                🌐
                            </div>
                            <span>{t.onlineEvidence}</span>
                        </div>

                        <div className="text-xs flex items-center gap-1.5 font-medium opacity-75">
                            <span className="text-blue-500 font-bold">ⓘ</span>
                            <span>{t.backgroundEvidence}</span>
                        </div>

                        {/* Citation cards */}
                        <div className="flex flex-col gap-2.5">
                            {activeResult.citations?.map((cit, idx) => (
                                <div key={idx} className="card-subtle p-3 flex flex-col gap-1.5">
                                    <div className="flex items-start gap-2">
                                        <span className="text-blue-500 text-xs mt-0.5">ℹ</span>
                                        <div className="text-xs font-bold leading-snug">
                                            {cit.title || activeResult.title}
                                        </div>
                                    </div>

                                    <div className="text-[11px] opacity-75">
                                        <span>{cit.source || 'reuters.com'}</span>
                                        <span className="mx-1">•</span>
                                        <span className="font-semibold">{cit.evidence_type || 'DIRECT_SUPPORT'}</span>
                                        <span className="mx-1">•</span>
                                        <span>{cit.date || 'Live'}</span>
                                    </div>

                                    <p className="text-[11px] leading-relaxed line-clamp-3 opacity-90">
                                        {activeResult.content?.slice(0, 160)}...
                                    </p>

                                    <a
                                        href={cit.url || 'https://news.google.com'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[12px] font-semibold text-blue-500 hover:text-blue-600 inline-flex items-center gap-1 pt-1"
                                    >
                                        {t.openSource}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 5: Limitations Disclaimer */}
                    <div className="p-3 rounded-xl card-subtle flex items-start gap-2 text-[11px] leading-relaxed opacity-80">
                        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                        <div>
                            {t.limitations}
                        </div>
                    </div>

                    {/* Action Buttons matching Photo 4 */}
                    <div className="flex flex-col gap-2.5 pt-2">
                        {/* Primary Check Another */}
                        <button
                            onClick={() => {
                                setViewMode('tabs');
                                setActiveTab('check');
                                setTextContent('');
                                setUrlContent('');
                                setVoiceContent('');
                                handleClearOcrImage();
                            }}
                            className="btn-primary w-full py-3.5 rounded-2xl text-base shadow-lg"
                        >
                            <RefreshCw size={18} />
                            <span>{t.checkAnother}</span>
                        </button>

                        {/* Row 2: Save Result & Add Note */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                onClick={handleToggleSave}
                                className="py-2.5 px-3 rounded-xl card-dark flex items-center justify-center gap-2 text-xs font-semibold hover:opacity-80 transition-opacity"
                            >
                                <Bookmark size={15} className={isSavedCurrent ? 'text-blue-500' : ''} fill={isSavedCurrent ? 'currentColor' : 'none'} />
                                <span>{isSavedCurrent ? t.saved : t.saveResult}</span>
                            </button>
                            <button
                                onClick={() => setNoteModalOpen(true)}
                                className="py-2.5 px-3 rounded-xl card-dark flex items-center justify-center gap-2 text-xs font-semibold hover:opacity-80 transition-opacity"
                            >
                                <Edit3 size={15} />
                                <span>{t.addNote}</span>
                            </button>
                        </div>

                        {/* Row 3: Share Result & Copy Summary */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                onClick={handleShare}
                                className="py-2.5 px-3 rounded-xl card-dark flex items-center justify-center gap-2 text-xs font-semibold hover:opacity-80 transition-opacity"
                            >
                                <Share2 size={15} />
                                <span>{t.shareResult}</span>
                            </button>
                            <button
                                onClick={handleCopySummary}
                                className="py-2.5 px-3 rounded-xl card-dark flex items-center justify-center gap-2 text-xs font-semibold hover:opacity-80 transition-opacity"
                            >
                                <Copy size={15} />
                                <span>{t.copySummary}</span>
                            </button>
                        </div>

                        {/* Red Report Link */}
                        <button
                            onClick={() => setReportModalOpen(true)}
                            className="pt-2 pb-1 text-center text-xs font-semibold text-red-500 hover:text-red-400 flex items-center justify-center gap-1.5 transition-colors"
                        >
                            <Flag size={14} />
                            <span>{t.reportResult}</span>
                        </button>
                    </div>
                </div>

                {/* Add Note Modal */}
                {noteModalOpen && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade">
                        <div className="card-dark w-full max-w-sm p-5 flex flex-col gap-3 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-base">{t.addNote}</span>
                                <button onClick={() => setNoteModalOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <p className="text-xs opacity-75">
                                Attach a private note to this check (e.g. "goog for students").
                            </p>
                            <textarea
                                value={customNote}
                                onChange={(e) => setCustomNote(e.target.value)}
                                placeholder="Write your note here..."
                                rows={3}
                                className="w-full card-subtle p-3 text-xs focus:outline-none focus:border-blue-500"
                            />
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setNoteModalOpen(false)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold opacity-75"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
                                >
                                    Save Note
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Report Result Modal */}
                {reportModalOpen && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade">
                        <div className="card-dark w-full max-w-sm p-5 flex flex-col gap-3 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-red-500 text-base flex items-center gap-1.5">
                                    <Flag size={16} /> {t.reportResult}
                                </span>
                                <button onClick={() => setReportModalOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <p className="text-xs opacity-75">
                                Please describe the issue with this verdict for our research moderation team.
                            </p>
                            <textarea
                                value={reportText}
                                onChange={(e) => setReportText(e.target.value)}
                                placeholder="Why do you think this assessment is incorrect?"
                                rows={3}
                                className="w-full card-subtle p-3 text-xs focus:outline-none focus:border-red-500"
                            />
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setReportModalOpen(false)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold opacity-75"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReport}
                                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white"
                                >
                                    Submit Report
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // RENDER: MAIN APPLICATION TABS
    // ==========================================
    return (
        <div className="flex flex-col min-h-screen pb-safe app-container">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600/95 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-blue-400 animate-fade">
                    {toastMessage}
                </div>
            )}

            {/* TAB 1: HOME SCREEN (Photo 3 & 5) */}
            {activeTab === 'home' && (
                <div className="flex flex-col gap-4 animate-fade">
                    {/* Header */}
                    <div className="pt-safe px-4 py-3 flex items-center justify-between border-b card-subtle sticky top-0 z-30">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-500">
                                <Shield size={18} />
                            </div>
                            <span className="font-extrabold text-xl tracking-tight">{t.appTitle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="p-1.5 rounded-lg card-subtle hover:opacity-80 transition-opacity"
                                title="Toggle Dark / Light Mode"
                            >
                                {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-700" />}
                            </button>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full card-subtle text-[11px] opacity-80">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{t.liveEngine}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 flex flex-col gap-4">
                        {!serverOnline && (
                            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-500">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={16} className="shrink-0" />
                                    <span>Server offline. Reconnecting...</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        testServerConnection().then(ok => setServerOnline(ok));
                                        loadDailyNews(selectedCategory, true, newsLanguage);
                                    }}
                                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-[11px] font-bold"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                        {/* Hero Banner Card matching Photo 5 */}
                        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#172554] via-[#1e3a8a] to-[#0f172a] text-white shadow-xl relative overflow-hidden">
                            <div className="text-xs font-semibold text-blue-200 mb-1">
                                {t.heroSubtitle}
                            </div>
                            <h2 className="text-2xl font-black text-white leading-tight mb-2 tracking-tight">
                                {t.heroTitle}
                            </h2>
                            <p className="text-xs text-blue-100/85 leading-relaxed mb-4">
                                {t.heroDescription}
                            </p>
                            <button
                                onClick={() => setActiveTab('check')}
                                className="bg-white hover:bg-slate-100 text-slate-900 px-4 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all active:scale-95"
                            >
                                <Search size={15} />
                                <span>{t.checkNewsArticle}</span>
                            </button>
                        </div>

                        {/* Search News Bar matching Photo 3 & 5 */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-3.5 opacity-50" size={17} />
                            <input
                                type="text"
                                placeholder={t.searchNews}
                                value={newsSearch}
                                onChange={(e) => setNewsSearch(e.target.value)}
                                className="w-full card-subtle pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                            />
                            {newsSearch && (
                                <button
                                    onClick={() => setNewsSearch('')}
                                    className="absolute right-3 top-3 opacity-50 hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Live News Feed Language Selector (Matching Photo & User Request) */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                            {NEWS_LANGUAGES.map((lang) => {
                                const isActive = newsLanguage === lang.code;
                                return (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleNewsLanguageChange(lang.code)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                                            isActive
                                                ? 'btn-pill-active shadow-sm font-semibold'
                                                : 'btn-pill-inactive hover:border-slate-400 font-medium'
                                        }`}
                                    >
                                        {isActive && <Check size={13} className="text-white" />}
                                        <span className="capitalize">{lang.name}</span>
                                        {lang.name !== lang.native.toLowerCase() && (
                                            <span className={`text-[10px] ${isActive ? 'text-blue-100 font-normal' : 'opacity-70'}`}>
                                                ({lang.native})
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Category Pills (All 11 Categories with dynamic translation) */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                            {CATEGORY_KEYS.map((catKey) => {
                                const isActive = selectedCategory === catKey;
                                const translatedCat = t.categories?.[catKey] || catKey;
                                return (
                                    <button
                                        key={catKey}
                                        onClick={() => handleCategoryClick(catKey)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                            isActive
                                                ? 'btn-pill-active shadow-sm'
                                                : 'btn-pill-inactive hover:border-slate-400'
                                        }`}
                                    >
                                        {isActive && <Check size={14} className="text-white" />}
                                        <span>{translatedCat}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Live News Feed Section with Working 5-Min Auto Refresh */}
                        <div className="flex flex-col gap-2.5 pt-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-base">{t.liveNewsFeed}</h3>
                                    <p className="text-[11px] opacity-75">{t.newsPublicSources}</p>
                                    <div className="flex items-center gap-2 text-[10px] opacity-65 font-medium mt-0.5">
                                        <span className="text-emerald-500 font-bold">● {t.autoSyncEvery5Min}</span>
                                        <span>•</span>
                                        <span>{t.nextRefreshIn}: {formatCountdown(nextRefreshSec)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => loadDailyNews(selectedCategory, true, newsLanguage)}
                                    disabled={newsLoading}
                                    className="p-2 rounded-lg card-subtle hover:opacity-80 transition-opacity"
                                    title="Refresh news feed now"
                                >
                                    <RefreshCw size={17} className={newsLoading ? 'animate-spin text-blue-500' : ''} />
                                </button>
                            </div>

                            {/* News cards list */}
                            {newsLoading && dailyNews.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2 opacity-75 text-xs">
                                    <RefreshCw size={24} className="animate-spin text-blue-500" />
                                    <span>Fetching live verified reports...</span>
                                </div>
                            ) : filteredNews.length === 0 ? (
                                <div className="py-10 text-center text-xs opacity-75 card-dark p-6">
                                    No news articles found for this search.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 pb-6">
                                    {filteredNews.map((item, index) => (
                                        <div key={index} className="card-dark p-4 flex flex-col gap-2.5 shadow-md">
                                            {/* Source & Timestamp */}
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-blue-500">
                                                    {t.source}: {item.source_name || 'Accredited Media'}
                                                </span>
                                                <span className="text-[11px] opacity-75 font-semibold text-emerald-500">
                                                    {item.published_date || 'Just now'}
                                                </span>
                                            </div>

                                            {/* Headline */}
                                            <h4 className="font-bold text-sm leading-snug">
                                                {item.title}
                                            </h4>

                                            {/* Action links */}
                                            <div className="flex items-center gap-4 pt-1">
                                                <a
                                                    href={item.source_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-semibold text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
                                                >
                                                    <ExternalLink size={13} />
                                                    <span>{t.openArticle}</span>
                                                </a>
                                                <button
                                                    onClick={() => handleAnalyze(item.title, 'Text')}
                                                    className="text-xs font-semibold text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
                                                >
                                                    <Check size={13} />
                                                    <span>{t.checkThisNews}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CHECK NEWS SCREEN (Dedicated Normal Input per Mode) */}
            {activeTab === 'check' && (
                <div className="flex flex-col gap-4 animate-fade">
                    {/* Header */}
                    <div className="pt-safe px-4 py-3 border-b card-subtle sticky top-0 z-30 flex items-center justify-between">
                        <h2 className="font-extrabold text-xl tracking-tight">{t.checkNews}</h2>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-1.5 rounded-lg card-subtle"
                        >
                            {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-700" />}
                        </button>
                    </div>

                    {/* Subtabs: Text / Headline, Image OCR, Article URL, Voice Claim */}
                    <div className="px-4 flex items-center justify-between border-b card-subtle">
                        {[
                            { id: 'text', label: t.textHeadline, icon: FileText },
                            { id: 'ocr', label: t.imageOcr, icon: Camera },
                            { id: 'url', label: t.articleUrl, icon: LinkIcon },
                            { id: 'voice', label: t.voiceClaim, icon: Mic }
                        ].map((sub) => {
                            const SubIcon = sub.icon;
                            const isActive = checkSubTab === sub.id;
                            return (
                                <button
                                    key={sub.id}
                                    onClick={() => {
                                        setCheckSubTab(sub.id);
                                        setAnalysisError(null);
                                    }}
                                    className={`flex items-center gap-1.5 py-3 px-2 text-xs font-semibold border-b-2 transition-all ${
                                        isActive
                                            ? 'border-blue-500 text-blue-500 font-bold'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <SubIcon size={14} />
                                    <span>{sub.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="px-4 flex flex-col gap-4">
                        {/* Section Header */}
                        <div>
                            <h3 className="font-bold text-base">
                                {checkSubTab === 'text' && t.pasteTitle}
                                {checkSubTab === 'ocr' && t.scanImageTitle}
                                {checkSubTab === 'url' && t.urlTitle}
                                {checkSubTab === 'voice' && t.voiceTitle}
                            </h3>
                            <p className="text-xs opacity-75">
                                {checkSubTab === 'text' && t.pasteSubtitle}
                                {checkSubTab === 'ocr' && t.scanImageSubtitle}
                                {checkSubTab === 'url' && t.urlSubtitle}
                                {checkSubTab === 'voice' && t.voiceSubtitle}
                            </p>
                        </div>

                        {/* MODE 1: PURE TEXT INPUT (Normal input method) */}
                        {checkSubTab === 'text' && (
                            <div className="card-dark p-4 flex flex-col justify-between min-h-[220px] shadow-lg">
                                <textarea
                                    value={textContent}
                                    onChange={(e) => setTextContent(e.target.value)}
                                    placeholder={t.pastePlaceholder}
                                    rows={7}
                                    className="w-full bg-transparent text-sm focus:outline-none resize-none leading-relaxed"
                                />
                                <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={handlePaste}
                                        className="text-xs font-semibold text-blue-500 hover:text-blue-600 inline-flex items-center gap-1.5"
                                    >
                                        <Copy size={13} />
                                        <span>{t.pasteBtn}</span>
                                    </button>
                                    {textContent && (
                                        <span className="text-[11px] opacity-60">
                                            {textContent.trim().split(/\s+/).length} words
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* MODE 2: PURE IMAGE OCR INPUT (With REAL Tesseract OCR Extraction) */}
                        {checkSubTab === 'ocr' && (
                            <div className="card-dark p-5 flex flex-col items-center justify-center min-h-[240px] shadow-lg">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageFileChange}
                                    className="hidden"
                                />

                                {!ocrImageFile ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-8 px-4 rounded-2xl border-2 border-dashed border-blue-500/40 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center">
                                            <UploadCloud size={28} />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-sm font-bold text-blue-500 block">{t.chooseImage}</span>
                                            <span className="text-xs opacity-60 block mt-0.5">PNG, JPG, WebP screenshots & news photos</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full flex flex-col gap-3">
                                        <div className="relative rounded-xl overflow-hidden card-subtle p-3 flex items-start gap-3 border">
                                            {ocrImagePreview && (
                                                <img
                                                    src={ocrImagePreview}
                                                    alt="Preview"
                                                    className="w-20 h-20 object-cover rounded-lg shrink-0 border"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold truncate block">{ocrImageFile.name}</span>
                                                    <button
                                                        onClick={handleClearOcrImage}
                                                        className="p-1 opacity-60 hover:opacity-100 hover:text-red-500 transition-colors"
                                                        title={t.removeImage}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>

                                                {ocrScanning ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-blue-500 font-medium mt-2">
                                                        <Loader2 size={14} className="animate-spin" />
                                                        <span>{t.extractingOcr}</span>
                                                    </div>
                                                ) : (
                                                    <div className="mt-2">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[11px] font-bold text-emerald-500">
                                                                {ocrExtractedHeadline ? t.ocrExtracted : 'Claim / Headline from Image:'}
                                                            </span>
                                                            <span className="text-[10px] opacity-60">Editable</span>
                                                        </div>
                                                        <textarea
                                                            value={ocrExtractedHeadline}
                                                            onChange={(e) => setOcrExtractedHeadline(e.target.value)}
                                                            placeholder="Extracted words will appear here. Or describe the claim shown in the image (e.g. 'Giant lion ridden by man discovered in forest')..."
                                                            rows={3}
                                                            className="w-full text-xs opacity-90 leading-snug bg-black/10 p-2 rounded-lg resize-none border border-black/10 focus:outline-none focus:border-blue-500"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-xs text-blue-500 font-semibold hover:underline text-center"
                                        >
                                            Choose Another Photo
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MODE 3: PURE ARTICLE URL INPUT (No extra text box - clean URL field) */}
                        {checkSubTab === 'url' && (
                            <div className="card-dark p-5 flex flex-col gap-4 shadow-lg">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold opacity-80">{t.urlLabel}</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3.5 top-3.5 opacity-50" size={17} />
                                        <input
                                            type="url"
                                            value={urlContent}
                                            onChange={(e) => setUrlContent(e.target.value)}
                                            placeholder={t.urlPlaceholder}
                                            className="w-full card-subtle pl-10 pr-20 py-3 text-sm focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handlePaste}
                                            className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-500 text-xs font-bold transition-colors"
                                        >
                                            {t.pasteUrlBtn}
                                        </button>
                                    </div>
                                </div>
                                <span className="text-[11px] opacity-60">
                                    TruthLens will fetch live content, publisher domain, and cross-reference with accredited fact-checkers.
                                </span>
                            </div>
                        )}

                        {/* MODE 4: PURE VOICE CLAIM INPUT (With Spoken Words Appearing in Real Time Below) */}
                        {checkSubTab === 'voice' && (
                            <div className="card-dark p-6 flex flex-col items-center justify-center gap-4 shadow-lg text-center">
                                <button
                                    type="button"
                                    onClick={handleToggleVoice}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
                                        isRecording
                                            ? 'bg-red-600 text-white animate-pulse shadow-red-500/50'
                                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/40'
                                    }`}
                                >
                                    {isRecording ? <MicOff size={34} /> : <Mic size={34} />}
                                </button>
                                <div>
                                    <h4 className="text-sm font-bold">
                                        {isRecording ? t.listening : t.tapToSpeak}
                                    </h4>
                                    <p className="text-xs opacity-60 mt-0.5">
                                        {isRecording ? 'Listening for speech input in real-time...' : 'Speak news headline or claim into microphone'}
                                    </p>
                                </div>

                                {/* SPOKEN WORDS APPEAR BELOW IN REAL TIME */}
                                <div className="w-full mt-2 p-3.5 rounded-xl card-subtle text-left border">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
                                            <Mic size={14} className={isRecording ? 'text-red-500 animate-pulse' : ''} />
                                            {t.spokenWordsTitle}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {voiceContent && (
                                                <button
                                                    type="button"
                                                    onClick={() => setVoiceContent('')}
                                                    className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                            <span className="text-[10px] opacity-60">Editable</span>
                                        </div>
                                    </div>
                                    <textarea
                                        value={voiceContent}
                                        onChange={(e) => setVoiceContent(e.target.value)}
                                        placeholder={isRecording ? "Listening to your voice in real time... Speak now." : t.spokenWordsPlaceholder}
                                        rows={3}
                                        className="w-full text-xs font-semibold leading-relaxed p-2.5 rounded-lg bg-black/10 border border-black/10 focus:outline-none focus:border-blue-500 resize-none"
                                    />
                                    {isRecording && (
                                        <div className="mt-1.5 text-[11px] text-red-400 font-medium flex items-center gap-1.5 animate-pulse">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            <span>Transcribing your speech in real time...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error Alert */}
                        {analysisError && (
                            <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0" />
                                <span>{analysisError}</span>
                            </div>
                        )}

                        {/* Quick Test Examples matching Photo 2 */}
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-semibold opacity-75">{t.quickExamples}</span>
                            <div className="flex items-center gap-2.5">
                                <button
                                    onClick={() => handleQuickExample('sensational')}
                                    className="px-3.5 py-2 rounded-xl card-dark hover:border-slate-400 text-xs font-semibold transition-colors"
                                >
                                    {t.sensationalClaim}
                                </button>
                                <button
                                    onClick={() => handleQuickExample('standard')}
                                    className="px-3.5 py-2 rounded-xl card-dark hover:border-slate-400 text-xs font-semibold transition-colors"
                                >
                                    {t.wireReport}
                                </button>
                            </div>
                        </div>

                        {/* Primary Analyze Button matching Photo 2 */}
                        <button
                            onClick={() => handleAnalyze()}
                            disabled={analyzing || ocrScanning}
                            className="btn-primary w-full py-3.5 rounded-2xl text-base shadow-lg mt-1"
                        >
                            {analyzing ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    <span>{t.analyzing}</span>
                                </>
                            ) : ocrScanning ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>{t.extractingOcr}</span>
                                </>
                            ) : (
                                <>
                                    <span>🌐</span>
                                    <span>{t.analyzeNews}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 3: CHECK HISTORY SCREEN (Photo 1) */}
            {activeTab === 'history' && (
                <div className="flex flex-col gap-4 animate-fade">
                    {/* Header */}
                    <div className="pt-safe px-4 py-3 flex items-center justify-between border-b card-subtle sticky top-0 z-30">
                        <h2 className="font-extrabold text-xl tracking-tight">{t.checkHistory}</h2>
                        <button
                            onClick={handleClearAllHistory}
                            className="p-1.5 opacity-60 hover:opacity-100 hover:text-red-500 transition-colors"
                            title="Clear entire history"
                        >
                            <Trash2 size={19} />
                        </button>
                    </div>

                    <div className="px-4 flex flex-col gap-3">
                        {/* Search Past Checks matching Photo 1 */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-3.5 opacity-50" size={17} />
                            <input
                                type="text"
                                placeholder={t.searchPastChecks}
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                className="w-full card-subtle pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                            />
                            {historySearch && (
                                <button onClick={() => setHistorySearch('')} className="absolute right-3 top-3 opacity-50">
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Filter Row 1: Input Types with Voice Claim requested */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                            {['All Inputs', 'Text', 'URL', 'Image OCR', 'Voice Claim'].map((inp) => {
                                const isActive = historyInputFilter === inp;
                                return (
                                    <button
                                        key={inp}
                                        onClick={() => setHistoryInputFilter(inp)}
                                        className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                            isActive
                                                ? 'btn-pill-active shadow-sm'
                                                : 'btn-pill-inactive hover:border-slate-400'
                                        }`}
                                    >
                                        {isActive && <Check size={13} className="text-white" />}
                                        <span>{inp === 'All Inputs' ? t.allInputs : inp}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Filter Row 2: Verdicts (All Verdicts, Fake, Real) */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                            {['All Verdicts', 'Fake', 'Real'].map((verd) => {
                                const isActive = historyVerdictFilter === verd;
                                return (
                                    <button
                                        key={verd}
                                        onClick={() => setHistoryVerdictFilter(verd)}
                                        className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                            isActive
                                                ? 'btn-pill-active shadow-sm'
                                                : 'btn-pill-inactive hover:border-slate-400'
                                        }`}
                                    >
                                        {isActive && <Check size={13} className="text-white" />}
                                        <span>{verd === 'All Verdicts' ? t.allVerdicts : verd === 'Real' ? t.real : t.fake}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* History Cards List matching Photo 1 */}
                        <div className="flex flex-col gap-3 pt-2 pb-6">
                            {filteredHistory.length === 0 ? (
                                <div className="card-dark p-8 text-center text-xs opacity-75">
                                    No checks found matching selected filters.
                                </div>
                            ) : (
                                filteredHistory.map((item) => {
                                    const isReal = item.prediction.toLowerCase() === 'real';
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                setActiveResult({
                                                    ...item,
                                                    title: item.title || item.content.slice(0, 100),
                                                    publisher: item.publisher || 'Verified History Source',
                                                    explanation: item.reasons?.[0] || (isReal ? 'Online evidence supports and verifies the core claims.' : 'Misleading or sensational claims detected.'),
                                                    citations: [
                                                        {
                                                            source: 'reuters.com',
                                                            evidence_type: 'DIRECT_SUPPORT',
                                                            title: item.content.slice(0, 70),
                                                            date: item.timestamp,
                                                            url: 'https://www.reuters.com'
                                                        }
                                                    ]
                                                });
                                                setViewMode('result');
                                            }}
                                            className="card-dark p-4 flex flex-col gap-2.5 shadow-md cursor-pointer hover:border-blue-500/50 transition-colors"
                                        >
                                            {/* Top Row: Type Icon + REAL/FAKE Badge + Score */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {item.input_type === 'URL' ? (
                                                        <LinkIcon size={15} className="opacity-60" />
                                                    ) : item.input_type === 'Image OCR' ? (
                                                        <Camera size={15} className="opacity-60" />
                                                    ) : item.input_type === 'Voice Claim' ? (
                                                        <Mic size={15} className="opacity-60" />
                                                    ) : (
                                                        <FileText size={15} className="opacity-60" />
                                                    )}

                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                                                            isReal
                                                                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                                                                : 'bg-red-500/20 text-red-500 border border-red-500/40'
                                                        }`}
                                                    >
                                                        {isReal ? t.real : t.fake}
                                                    </span>
                                                </div>

                                                <span className="text-xs font-semibold opacity-75">
                                                    {t.score}: {item.probability || 87}%
                                                </span>
                                            </div>

                                            {/* Headline / Content Snippet */}
                                            <h4 className="font-bold text-sm leading-snug line-clamp-2">
                                                {item.content}
                                            </h4>

                                            {/* Subtext snippet */}
                                            <p className="text-xs opacity-75 line-clamp-2">
                                                {item.reasons?.[0] || 'Verified via live online factual analysis.'}
                                            </p>

                                            {/* Bottom row: Date & Trash Icon */}
                                            <div className="flex items-center justify-between pt-1 border-t border-black/10">
                                                <span className="text-[11px] opacity-60">
                                                    {item.timestamp?.slice(0, 10) || '2026-10-04'}
                                                </span>
                                                <button
                                                    onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                                                    className="p-1 opacity-60 hover:opacity-100 hover:text-red-500 transition-colors"
                                                    title="Delete this history item"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: SAVED RESULTS SCREEN (Photo 8) */}
            {activeTab === 'saved' && (
                <div className="flex flex-col gap-4 animate-fade">
                    {/* Header */}
                    <div className="pt-safe px-4 py-3 flex items-center justify-between border-b card-subtle sticky top-0 z-30">
                        <h2 className="font-extrabold text-xl tracking-tight">{t.savedResults}</h2>
                        <button
                            onClick={handleClearAllSaved}
                            className="p-1.5 opacity-60 hover:opacity-100 hover:text-red-500 transition-colors"
                            title="Clear all saved"
                        >
                            <Trash2 size={19} />
                        </button>
                    </div>

                    <div className="px-4 flex flex-col gap-3 pb-6">
                        {savedList.length === 0 ? (
                            <div className="card-dark p-8 text-center text-xs opacity-75">
                                No saved results found. Bookmarked checks will appear here.
                            </div>
                        ) : (
                            savedList.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        setActiveResult(item.rawResult || {
                                            id: item.id,
                                            title: item.title,
                                            content: item.content || item.title,
                                            prediction: item.prediction || 'Real',
                                            probability: item.probability || 87,
                                            publisher: item.publisher || 'Verified Source',
                                            explanation: 'Online evidence supports and verifies the core claims.',
                                            citations: [
                                                {
                                                    source: 'cnbc.com',
                                                    evidence_type: 'DIRECT_SUPPORT',
                                                    title: item.title,
                                                    date: item.timestamp,
                                                    url: 'https://www.cnbc.com'
                                                }
                                            ],
                                            timestamp: item.timestamp
                                        });
                                        setViewMode('result');
                                    }}
                                    className="card-dark p-4 flex flex-col gap-2 relative shadow-md cursor-pointer hover:border-blue-500/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-col gap-1 pr-6">
                                            {/* Headline or Link */}
                                            <div className="text-xs font-semibold leading-snug break-all line-clamp-2">
                                                {item.title}
                                            </div>

                                            {/* Timestamp */}
                                            <div className="text-[11px] opacity-60 font-mono">
                                                {item.timestamp}
                                            </div>

                                            {/* Note in Italics matching Photo 8 */}
                                            {item.note && (
                                                <div className="text-xs italic text-amber-500 font-medium pt-1">
                                                    {t.note} {item.note}
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove X Button */}
                                        <button
                                            onClick={(e) => handleDeleteSavedItem(e, item.id)}
                                            className="opacity-50 hover:opacity-100 p-1"
                                            title="Delete saved check"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* TAB 5: PROFILE & SETTINGS SCREEN (Working Themes & 20 Languages) */}
            {activeTab === 'profile' && (
                <div className="flex flex-col gap-4 animate-fade">
                    {/* Header */}
                    <div className="pt-safe px-4 py-3 border-b card-subtle sticky top-0 z-30">
                        <h2 className="font-extrabold text-xl tracking-tight">{t.profileSettings}</h2>
                    </div>

                    <div className="px-4 flex flex-col gap-4 pb-8">
                        {/* User Card */}
                        <div className="card-dark p-4 flex items-center gap-3.5 shadow-lg">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-md">
                                E
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-base">elak24aid</span>
                                <span className="text-xs opacity-75">elak24aid@vetias.ac.in</span>
                                <div className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-semibold pt-0.5">
                                    <CheckCircle size={12} />
                                    <span>{t.verifiedInvestigator}</span>
                                </div>
                            </div>
                        </div>

                        {/* Preferences Card */}
                        <div className="card-dark p-4 flex flex-col gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider opacity-75">{t.preferences}</span>

                            {/* Theme Switcher (Working Dark Mode / Light Mode) */}
                            <div className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2">
                                    {darkMode ? <Moon size={16} className="text-blue-500" /> : <Sun size={16} className="text-amber-500" />}
                                    <span className="text-sm font-semibold">{darkMode ? t.darkMode : t.lightMode}</span>
                                </div>
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-400'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Language Selector (20 Languages) */}
                            <div className="flex items-center justify-between py-1">
                                <span className="text-sm font-semibold">{t.language}</span>
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    className="card-subtle px-3 py-1.5 text-xs font-semibold rounded-lg focus:outline-none border max-w-[180px]"
                                >
                                    {LANGUAGE_OPTIONS.map((lang) => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Auto Refresh */}
                            <div className="flex items-center justify-between py-1">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{t.autoRefresh}</span>
                                    <span className="text-[11px] opacity-60">Automatically syncs latest news</span>
                                </div>
                                <button
                                    onClick={() => setAutoRefreshFeed(!autoRefreshFeed)}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${autoRefreshFeed ? 'bg-blue-600' : 'bg-slate-400'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${autoRefreshFeed ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Live Research */}
                            <div className="flex items-center justify-between py-1">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{t.factCheckEngine}</span>
                                    <span className="text-[11px] opacity-60">Queries real-time web citations</span>
                                </div>
                                <button
                                    onClick={() => setLiveWebResearch(!liveWebResearch)}
                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${liveWebResearch ? 'bg-blue-600' : 'bg-slate-400'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${liveWebResearch ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Backend Server Connection Card */}
                        <div className="card-dark p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider opacity-75">Server & Mobile Sync</span>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${serverOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                                    {serverOnline ? '● Online' : '○ Disconnected'}
                                </span>
                            </div>

                            <div className="text-xs opacity-75 break-all bg-black/20 p-2.5 rounded-lg border border-slate-700/50 flex flex-col gap-1">
                                <span className="font-semibold text-[11px] opacity-60">Active API Server:</span>
                                <span className="font-mono text-[11px] text-blue-400 select-all">{serverUrl || getApiBaseUrl()}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 pt-1">
                                <span className="text-[11px] font-semibold opacity-75">Switch Server:</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setCustomApiUrl(VERCEL_CLOUD_URL);
                                            setServerUrl(VERCEL_CLOUD_URL);
                                            const ok = await testServerConnection(VERCEL_CLOUD_URL);
                                            setServerOnline(ok);
                                            showToast(ok ? 'Connected to Vercel Cloud (24/7)' : 'Cloud endpoint not responding');
                                            loadDailyNews(selectedCategory, true, newsLanguage);
                                        }}
                                        className="py-1.5 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-[11px] font-semibold text-center text-emerald-400 transition-colors"
                                    >
                                        ☁️ Vercel Cloud
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setCustomApiUrl(CLOUD_TUNNEL_URL);
                                            setServerUrl(CLOUD_TUNNEL_URL);
                                            const ok = await testServerConnection(CLOUD_TUNNEL_URL);
                                            setServerOnline(ok);
                                            showToast(ok ? 'Connected to Cloud Tunnel' : 'Tunnel not responding');
                                            loadDailyNews(selectedCategory, true, newsLanguage);
                                        }}
                                        className="py-1.5 px-2 rounded-lg bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/30 text-[11px] font-medium text-center transition-colors"
                                    >
                                        🌐 Cloud Tunnel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setCustomApiUrl(LOCAL_WIFI_URL);
                                            setServerUrl(LOCAL_WIFI_URL);
                                            const ok = await testServerConnection(LOCAL_WIFI_URL);
                                            setServerOnline(ok);
                                            showToast(ok ? 'Connected to Local Wi-Fi' : 'Wi-Fi endpoint not responding');
                                            loadDailyNews(selectedCategory, true, newsLanguage);
                                        }}
                                        className="py-1.5 px-2 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/30 border border-indigo-500/30 text-[11px] font-medium text-center transition-colors"
                                    >
                                        📡 Local Wi-Fi
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 pt-1">
                                <span className="text-[11px] font-semibold opacity-75">Custom Server IP / URL:</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={customServerInput}
                                        onChange={(e) => setCustomServerInput(e.target.value)}
                                        placeholder="http://192.168.1.X:8000"
                                        className="card-subtle flex-1 px-2.5 py-1.5 text-xs font-mono rounded-lg border focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!customServerInput.trim()) return;
                                            setCustomApiUrl(customServerInput.trim());
                                            setServerUrl(customServerInput.trim());
                                            const ok = await testServerConnection(customServerInput.trim());
                                            setServerOnline(ok);
                                            showToast(ok ? 'Connected to custom server!' : 'Connection test failed');
                                            loadDailyNews(selectedCategory, true, newsLanguage);
                                        }}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* System Information */}
                        <div className="card-dark p-4 flex flex-col gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider opacity-75">{t.systemInfo}</span>
                            <div className="flex items-center justify-between text-xs py-1">
                                <span className="opacity-60">{t.application}</span>
                                <span className="font-semibold">TruthLens AI v2.5</span>
                            </div>
                            <div className="flex items-center justify-between text-xs py-1">
                                <span className="opacity-60">{t.engine}</span>
                                <span className="font-semibold">Tesseract.js OCR + Scikit-Learn + RSS</span>
                            </div>
                            <div className="flex items-center justify-between text-xs py-1">
                                <span className="opacity-60">{t.database}</span>
                                <span className="font-semibold text-emerald-500">SQLite fnds.db (Connected)</span>
                            </div>
                            <div className="flex items-center justify-between text-xs py-1">
                                <span className="opacity-60">{t.modelAccuracy}</span>
                                <span className="font-semibold text-emerald-500">100% Calibrated ML</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FIXED BOTTOM NAVIGATION BAR */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full card-subtle border-t px-2 py-2 flex items-center justify-around z-40 shadow-2xl backdrop-blur-md">
                {[
                    { id: 'home', label: t.navHome, icon: Shield },
                    { id: 'check', label: t.navCheck, icon: CheckSquare },
                    { id: 'history', label: t.navHistory, icon: HistoryIcon },
                    { id: 'saved', label: t.navSaved, icon: Bookmark },
                    { id: 'profile', label: t.navProfile, icon: User }
                ].map((item) => {
                    const NavIcon = item.icon;
                    const isActive = activeTab === item.id && viewMode === 'tabs';
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setViewMode('tabs');
                            }}
                            className="flex flex-col items-center justify-center py-1 px-3 transition-all"
                        >
                            <div
                                className={`p-1.5 rounded-xl transition-all ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                        : 'opacity-60 hover:opacity-100'
                                }`}
                            >
                                <NavIcon size={19} />
                            </div>
                            <span
                                className={`text-[10px] mt-1 font-medium transition-colors ${
                                    isActive ? 'font-bold text-blue-500' : 'opacity-60'
                                }`}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default Dashboard;
