import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Check, 
  Pill, 
  Thermometer, 
  Calendar, 
  Activity, 
  Send, 
  ShieldAlert, 
  Stethoscope,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Bandage,
  Camera,
  X,
  MessageCircle,
  Plus,
  Trash2,
  AlertTriangle,
  Eye,
  Maximize2,
  Search,
  WifiOff,
  Share2
} from 'lucide-react';

// --- Default Mock Data (Fallback) ---
const MOCK_RECOVERY_PLAN = [
  { 
    day: 1, 
    date: "Day 1", 
    status: "Acute Phase",
    tasks: [
      { 
        id: 't1', 
        type: "med", 
        title: "Amoxicillin", 
        desc: "500mg - Take with food", 
        time: "8:00 AM", // Explicitly AM for overdue test
        source_ref: "Page 1, Paragraph 2",
        warnings: ["Finish full course"] 
      },
      {
        id: 'w1',
        type: "warning",
        title: "Check Temperature",
        desc: "Call doctor if > 101°F",
        time: "Daily",
        source_ref: "Page 1, Footer",
        warnings: []
      }
    ] 
  }
];

// --- Helper Functions ---
const getTimeValue = (timeStr) => {
  if (!timeStr) return 9999;
  const t = timeStr.toLowerCase();
  if (t.includes('morn')) return 800;
  if (t.includes('noon')) return 1200;
  if (t.includes('after')) return 1400;
  if (t.includes('even')) return 1800;
  if (t.includes('night') || t.includes('bed')) return 2100;
  try {
    const dateStr = `01/01/2000 ${timeStr}`;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date.getHours() * 100 + date.getMinutes();
  } catch (e) {}
  return 9999; 
};

// Helper to read file as base64
const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve({
         mimeType: file.type,
         data: base64
      });
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// --- Confetti Component (Dependency-Free) ---
const SimpleConfetti = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#0284C7', '#E11D48', '#0D9488', '#f59e0b', '#8b5cf6'];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        speed: Math.random() * 5 + 2,
        angle: Math.random() * 6.28
      });
    }

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, index) => {
        p.y += p.speed;
        p.angle += 0.05;
        p.x += Math.sin(p.angle) * 2;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        if (p.y > canvas.height) {
          particles.splice(index, 1);
        }
      });

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[100]"
    />
  );
};

// --- Emergency Passport Component ---
const EmergencyPassport = ({ plan, onClose }) => {
  // Extract all active meds from the plan
  const allMeds = plan.flatMap(day => 
    day.tasks.filter(t => t.type === 'med').map(t => {
      // Normalize name to deduplicate "Aspirin" vs "Aspirin (Daily)"
      let normalizedName = t.title.replace(/\s*\(Daily\)\s*/i, '').trim();
      // Remove dose from title if present (e.g. "Amlodipine 5mg" -> "Amlodipine") for cleaner grouping
      // normalizedName = normalizedName.replace(/\d+\s?mg/i, '').trim(); 
      
      return {
        name: normalizedName,
        originalTitle: t.title, // Keep original for display if needed
        dose: t.desc ? t.desc.split('.')[0] : "As directed", // Take first sentence/part as dose
        time: t.time
      };
    })
  );

  // Remove duplicates based on NORMALIZED name
  const uniqueMeds = [...new Map(allMeds.map(item => [item.name, item])).values()];

  // Extract Red Flags (Warnings) from the plan
  const warningTasks = plan.flatMap(day => 
    day.tasks.filter(t => t.type === 'warning').map(t => ({ text: t.title + ": " + t.desc }))
  );
  
  const embeddedWarnings = plan.flatMap(day => 
    day.tasks.flatMap(t => t.warnings || [])
  );

  const allRedFlags = [...new Set([...warningTasks.map(w => w.text), ...embeddedWarnings])];

  return (
    <div className="fixed inset-0 bg-[#E11D48] z-50 flex flex-col p-6 animate-in slide-in-from-bottom duration-300 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center text-white mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
             <h1 className="text-3xl font-black uppercase tracking-wider">Medical ID</h1>
             <p className="text-red-100 text-sm font-semibold opacity-90">Show to Emergency Responder</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
        >
          <X className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* CARD BODY */}
      <div className="bg-white rounded-[2rem] flex-grow shadow-2xl overflow-hidden flex flex-col">
         {/* Patient Info */}
         <div className="bg-[#0F172A] p-8 text-white border-b border-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Patient</h2>
            <p className="text-3xl font-bold">Grandma Doe</p>
            <p className="text-slate-400 text-sm mt-1 font-mono">DOB: 01/01/1955</p>
         </div>

         {/* Critical Info Scroll */}
         <div className="p-8 overflow-y-auto space-y-8">
            
            {/* Procedure */}
            <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Recent Procedure</h3>
               <div className="bg-[#0284C7]/10 border-l-4 border-[#0284C7] p-5 rounded-r-xl">
                  <p className="font-bold text-[#0F172A] text-xl">Hospital Discharge</p>
                  <p className="text-slate-600 text-sm mt-1">See attached timeline for recovery plan.</p>
               </div>
            </div>

            {/* Active Medications (The "Killer" Feature) */}
            <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Active Medications</h3>
               <div className="space-y-3">
                  {uniqueMeds.length > 0 ? uniqueMeds.map((med, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-slate-100 pb-3 last:border-0">
                       <span className="font-bold text-[#0F172A] text-lg">{med.name}</span>
                       <span className="text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded text-xs mt-1 sm:mt-0 inline-block">{med.dose}</span>
                    </div>
                  )) : (
                    <p className="text-slate-400 italic">No medications found in plan.</p>
                  )}
               </div>
            </div>

            {/* Warnings (Real Data from Document) */}
            <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Red Flags</h3>
               <div className="bg-[#E11D48]/10 p-5 rounded-xl border border-[#E11D48]/20">
                  {allRedFlags.length > 0 ? (
                    allRedFlags.map((flag, i) => (
                      <p key={i} className="font-bold text-[#E11D48] flex items-start mb-3 last:mb-0 text-base">
                        <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" /> 
                        {flag}
                      </p>
                    ))
                  ) : (
                    <p className="text-rose-400 italic text-sm">No specific red flags detected. Call 911 for emergencies.</p>
                  )}
               </div>
            </div>
         </div>
      </div>
      
      <div className="text-center mt-6">
         <p className="text-white/80 text-sm font-medium">Powered by MyRecovery</p>
      </div>
    </div>
  );
};

// --- Sub-Components ---
const TaskIcon = ({ type }) => {
  switch (type) {
    case 'med': return <Pill className="w-6 h-6 text-[#0284C7]" />;
    case 'wound': return <Activity className="w-6 h-6 text-orange-600" />;
    case 'warning': return <ShieldAlert className="w-6 h-6 text-[#E11D48]" />;
    case 'appt': return <Calendar className="w-6 h-6 text-[#0D9488]" />;
    case 'movement': return <Stethoscope className="w-6 h-6 text-purple-600" />;
    default: return <Activity className="w-6 h-6 text-slate-600" />;
  }
};

const TaskCard = ({ task, onToggle }) => {
  const isCompleted = task.completed;
  
  // "Overdue" logic: If it's AM and not done (Simulated logic)
  const isOverdue = !isCompleted && task.time && (task.time.includes("AM") || task.time.includes("Morning"));

  return (
    <div 
      className={`
        mb-3 rounded-2xl border transition-all duration-300 overflow-hidden relative group
        ${isCompleted 
          ? 'bg-slate-50 border-slate-100 opacity-60' 
          : isOverdue 
            ? 'bg-white border-[#E11D48]/30 shadow-sm' 
            : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-[#0284C7]/30'}
      `}
    >
      {/* Overdue Badge */}
      {isOverdue && (
         <span className="absolute top-0 right-0 bg-[#E11D48] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-xl z-10 shadow-sm">
            MISSED
         </span>
      )}

      {/* Main Content (No longer clickable header vs body, all visible) */}
      <div className="p-4 flex flex-col gap-3">
        
        {/* Top Row: Checkbox + Title + Time */}
        <div className="flex items-start gap-4">
           {/* Checkbox */}
           <div 
             onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
             className={`
               w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer
               ${isCompleted ? 'bg-[#0D9488]/10 text-[#0D9488]' : isOverdue ? 'bg-[#E11D48]/10 text-[#E11D48]' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}
             `}
           >
             {isCompleted ? <Check size={24} strokeWidth={3} /> : <TaskIcon type={task.type} />}
           </div>
           
           {/* Text Info */}
           <div className="flex-grow min-w-0 pt-1">
             <div className="flex justify-between items-start">
                <h4 className={`font-bold text-[#0F172A] text-lg leading-tight truncate pr-2 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                  {task.title}
                </h4>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ml-2 whitespace-nowrap flex-shrink-0 ${isOverdue ? 'bg-[#E11D48]/10 text-[#E11D48]' : 'bg-slate-100 text-slate-500'}`}>
                  {task.time}
                </span>
             </div>
             
             {/* Description (Always Visible Now) */}
             <p className={`text-slate-600 leading-relaxed mt-2 text-sm ${isCompleted ? 'text-slate-400' : ''}`}>
                {task.desc}
             </p>

             {/* Source Ref */}
             {task.source_ref && !isCompleted && (
                <div className="mt-2 flex items-center text-[10px] text-[#0284C7] font-medium opacity-80">
                  <Search className="w-3 h-3 mr-1" />
                  Source: {task.source_ref}
                </div>
             )}
           </div>
        </div>

        {/* Warnings Badge (Always visible if present and not completed) */}
        {task.warnings?.length > 0 && !isCompleted && (
          <div className="flex flex-wrap gap-2 ml-16">
            {task.warnings.map((w, i) => (
               <span key={i} className="bg-[#E11D48]/10 text-[#E11D48] text-xs font-bold px-2 py-1 rounded-lg border border-[#E11D48]/20 flex items-center gap-1">
                 <AlertTriangle size={12} /> {w}
               </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

// --- Day Accordion ---
const DayAccordion = ({ day, isFuture, isCompleted, isActive, onToggleTask }) => {
  const [isExpanded, setIsExpanded] = useState(isActive);

  useEffect(() => {
    if (isActive) setIsExpanded(true);
  }, [isActive]);

  useEffect(() => {
    if (isCompleted && !isActive) setIsExpanded(false);
  }, [isCompleted, isActive]);

  return (
    <div className={`
      border rounded-2xl mb-6 overflow-hidden transition-all duration-500 ease-in-out
      ${isActive ? 'ring-2 ring-[#0284C7] ring-offset-2 border-[#0284C7]/30 bg-white shadow-lg' : ''}
      ${isCompleted ? 'border-slate-200 bg-[#F8FAFC] opacity-90' : ''}
      ${isFuture ? 'border-slate-200 bg-[#F8FAFC]/50 opacity-75' : ''} 
    `}>
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center font-bold text-base mr-5 border transition-colors shadow-sm
            ${isCompleted ? 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20' : 'bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/20'}
            ${isFuture ? 'bg-gray-100 text-gray-400 border-gray-200' : ''}
          `}>
            {isCompleted ? <Check className="w-6 h-6" /> : day.day}
          </div>
          <div>
            <h3 className={`font-bold text-xl ${isCompleted ? 'text-slate-600 line-through decoration-slate-400' : 'text-[#0F172A]'}`}>
              {day.date}
            </h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-0.5">
              {isCompleted ? "Completed" : day.status}
            </p>
          </div>
        </div>
        
        <div className="p-2.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Content (Tasks) */}
      {isExpanded && (
        <div className="px-5 pb-5 pl-20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          {day.tasks.map(task => (
            <TaskCard key={task.id} task={task} onToggle={onToggleTask} />
          ))}
          {day.tasks.length === 0 && (
             <p className="text-sm text-slate-400 italic py-2">No scheduled tasks for this day.</p>
          )}
        </div>
      )}
    </div>
  );
};

// --- Secure API Logic ---

const callBackendAnalysis = async (files) => {
  try {
    const images = await Promise.all(files.map(file => readFileAsBase64(file)));
    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images }) 
    });

    if (!response.ok) {
       throw new Error(`Server API Request Failed: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.warn("Backend Error (Switching to Demo Mode):", error);
    return { success: false, data: MOCK_RECOVERY_PLAN };
  }
};

// --- Main App ---

export default function DischargeDecoderApp() {
  const [appState, setAppState] = useState('upload'); 
  const [recoveryPlan, setRecoveryPlan] = useState([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false); 
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false); // State for Passport
  const [showConfetti, setShowConfetti] = useState(false); // State for Confetti
  const fileInputRef = useRef(null);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: 'Hi! I\'ve read your documents. Ask me anything about your recovery.' }
  ]);
  const messagesEndRef = useRef(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const totalTasks = recoveryPlan.reduce((acc, day) => acc + day.tasks.length, 0);
  const completedTasks = recoveryPlan.reduce((acc, day) => acc + day.tasks.filter(t => t.completed).length, 0);
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const activeDayIndex = recoveryPlan.findIndex(day => !day.tasks.every(t => t.completed));
  const currentActiveIndex = activeDayIndex === -1 ? recoveryPlan.length : activeDayIndex;

  // --- Actions ---

  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
    event.target.value = null;
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- Share Functionality ---
  const handleShare = () => {
    const textPlan = recoveryPlan
      .filter(day => day.tasks.length > 0)
      .map(day => 
        `📅 ${day.date} (${day.status}):\n` + 
        day.tasks.map(t => `  [${t.completed ? 'x' : ' '}] ${t.title} (${t.time})`).join('\n')
      ).join('\n\n');

    const shareData = {
      title: 'My Recovery Plan',
      text: `Here is my recovery schedule:\n\n${textPlan}`,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareData.text);
      alert("Plan copied to clipboard! You can paste it to WhatsApp.");
    }
  };

  const startAnalysis = async () => {
    if (uploadedFiles.length === 0) return;
    setAppState('analyzing');
    setAnalysisProgress(10);

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 5, 90));
    }, 500);

    const { success, data: rawPlan } = await callBackendAnalysis(uploadedFiles);
    
    if (!success) {
        setIsDemoMode(true);
    } else {
        setIsDemoMode(false);
    }
    
    // --- FRONTEND EXPANSION LOGIC ---
    let expandedPlan = [];
    const maxIndividualDays = 14; 
    const maxTotalDays = 30; // UPDATED to 30 days as requested

    // 1. Create standard individual days 1-14
    for (let i = 1; i <= maxIndividualDays; i++) {
        expandedPlan.push({
            day: i,
            date: `Day ${i}`,
            status: i < 4 ? "Acute Phase" : "Recovery Phase",
            tasks: []
        });
    }

    // 2. Create the "Maintenance" bucket (Days 15-30)
    // We use index 14 for this (0-13 are days 1-14)
    expandedPlan.push({
        day: "15-30",
        date: "Days 15-30",
        status: "Maintenance Phase",
        tasks: []
    });

    if (rawPlan && Array.isArray(rawPlan)) {
      rawPlan.forEach(dayGroup => {
          if (!dayGroup.tasks) return;
          dayGroup.tasks.forEach(task => {
              const startDay = dayGroup.day || 1; 
              
              // Smart Duration Parsing: Try to find "X days" in text if API missed it
              let duration = task.duration_days;
              if (!duration && task.desc) {
                 const match = task.desc.match(/for (\d+) days/i);
                 if (match) duration = parseInt(match[1]);
                 else duration = 1; // Default
              } else if (!duration) {
                 duration = 1;
              }
              
              // Track if we've added this specific task to the "Maintenance" bucket already
              // to prevent showing "Amoxicillin" 16 times in the single grouped card.
              let addedToMaintenance = false; 

              for (let d = 0; d < duration; d++) {
                  const currentDay = startDay + d;
                  
                  if (currentDay <= maxTotalDays) {
                      if (currentDay <= maxIndividualDays) {
                          // Individual Days (1-14)
                          const targetDayIndex = currentDay - 1;
                          expandedPlan[targetDayIndex].tasks.push({
                              ...task,
                              id: `${task.id}_d${currentDay}`,
                              completed: false
                          });
                      } else {
                          // Maintenance Phase (15-30)
                          // Only add once per task for this block
                          if (!addedToMaintenance) {
                              const maintenanceIndex = maxIndividualDays; // Index 14
                              expandedPlan[maintenanceIndex].tasks.push({
                                  ...task,
                                  id: `${task.id}_maintenance`,
                                  completed: false,
                                  // Optionally modify title to indicate recurrence
                                  title: `${task.title} (Daily)` 
                              });
                              addedToMaintenance = true;
                          }
                      }
                  }
              }
          });
      });
    }

    expandedPlan = expandedPlan.filter(d => d.tasks.length > 0);

    const sortedPlan = expandedPlan.map(day => ({
      ...day,
      tasks: day.tasks.sort((a, b) => getTimeValue(a.time) - getTimeValue(b.time))
    }));
    
    clearInterval(progressInterval);
    setAnalysisProgress(100);
    setRecoveryPlan(sortedPlan);
    setTimeout(() => setAppState('dashboard'), 800);
  };

  const toggleTask = (taskId) => {
    // 1. Update State
    const updatedPlan = recoveryPlan.map(day => ({
      ...day,
      tasks: day.tasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    }));
    
    setRecoveryPlan(updatedPlan);

    // 2. Check for Day Completion (Confetti Trigger)
    const dayWithTask = updatedPlan.find(day => day.tasks.some(t => t.id === taskId));
    if (dayWithTask) {
        const allCompleted = dayWithTask.tasks.every(t => t.completed);
        if (allCompleted) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000); // Stop confetti after 4s
        }
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    if (isDemoMode) {
        setTimeout(() => {
            setChatMessages(prev => [...prev, { 
                role: 'bot', 
                text: "⚠️ [DEMO MODE] I cannot reach the live server." 
            }]);
            setIsChatLoading(false);
        }, 1500);
        return;
    }

    try {
        const images = await Promise.all(uploadedFiles.map(file => readFileAsBase64(file)));
        
        const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: userMsg.text,
                images: images 
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server Status: ${response.status}`);
        }
        
        const data = await response.json();
        const botMsg = { role: 'bot', text: data.answer };
        setChatMessages(prev => [...prev, botMsg]);

    } catch (error) {
        console.error("Chat Error:", error);
        setChatMessages(prev => [...prev, { 
            role: 'bot', 
            text: `Connection Error: ${error.message}. Please ensure 'node server.js' is running.` 
        }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (isChatOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  // --- Views ---

  if (appState === 'upload') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans w-full">
         <style>{`
           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
           body, #root { font-family: 'Inter', sans-serif; width: 100%; max-width: none !important; margin: 0 !important; padding: 0 !important; background-color: #F8FAFC; }
         `}</style>
        <div className="max-w-md md:max-w-xl w-full bg-white rounded-[2rem] shadow-xl p-8 md:p-12 text-center relative border border-slate-100">
          <div className="w-20 h-20 bg-[#0284C7]/10 text-[#0284C7] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Camera className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-4 tracking-tight">Discharge Decoder</h1>
          <p className="text-[#64748B] mb-8 text-lg font-medium leading-relaxed">
            Upload your hospital papers to generate a clear, day-by-day recovery plan.
          </p>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" multiple className="hidden" />
          
          {uploadedFiles.length > 0 && (
            <div className="mb-8 grid grid-cols-3 gap-4">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="relative aspect-[3/4] bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden group hover:border-[#0284C7] transition-colors">
                  <FileText className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-[10px] text-slate-500 px-2 truncate w-full text-center font-medium">{file.name}</span>
                  <button onClick={() => removeFile(idx)} className="absolute top-1 right-1 bg-[#E11D48] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div onClick={handleUploadClick} className="aspect-[3/4] bg-[#0284C7]/5 rounded-xl border-2 border-dashed border-[#0284C7]/30 flex flex-col items-center justify-center cursor-pointer hover:bg-[#0284C7]/10 transition-colors">
                <Plus className="w-8 h-8 text-[#0284C7]" />
                <span className="text-[10px] text-[#0284C7] font-bold mt-1">Add Page</span>
              </div>
            </div>
          )}

          {uploadedFiles.length === 0 ? (
            <div onClick={handleUploadClick} className="border-3 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-12 cursor-pointer hover:bg-slate-100 hover:border-[#0284C7]/50 transition-all group">
              <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4 group-hover:text-[#0284C7] group-hover:scale-110 transition-all" />
              <span className="font-bold text-[#0284C7] text-xl block">Tap to Scan Papers</span>
              <span className="text-slate-400 text-sm mt-2 block">Supports Images & PDF</span>
            </div>
          ) : (
            <button onClick={startAnalysis} className="w-full bg-[#0284C7] text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-sky-700 transition-all flex items-center justify-center space-x-3 transform active:scale-95">
              <Activity className="w-6 h-6" />
              <span>Generate Recovery Plan</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (appState === 'analyzing') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 w-full">
         <style>{`body, #root { width: 100%; max-width: none !important; margin: 0 !important; padding: 0 !important; background-color: #F8FAFC; }`}</style>
        <div className="max-w-md w-full text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#0284C7] rounded-full border-t-transparent animate-spin"></div>
            <Loader2 className="absolute inset-0 m-auto text-[#0284C7] w-12 h-12 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] animate-pulse">Analyzing Documents...</h2>
          <p className="text-[#64748B] mt-3 text-base font-medium">Extracting medications, warnings, and schedules.</p>
          <div className="w-full bg-slate-200 rounded-full h-3 mt-10 overflow-hidden">
            <div className="bg-[#0284C7] h-3 rounded-full transition-all duration-300 ease-out" style={{ width: `${analysisProgress}%` }}></div>
          </div>
        </div>
      </div>
    );
  }

  // --- Dashboard ---

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans w-full flex flex-col h-screen overflow-hidden">
       <style>{`
         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
         body, #root { font-family: 'Inter', sans-serif; width: 100%; max-width: none !important; margin: 0 !important; padding: 0 !important; background-color: #F8FAFC; height: 100vh; overflow: hidden; }
       `}</style>

      {/* Confetti Overlay */}
      {showConfetti && <SimpleConfetti />}

      {/* Emergency Passport Overlay */}
      {isEmergencyOpen && (
        <EmergencyPassport 
          plan={recoveryPlan} 
          onClose={() => setIsEmergencyOpen(false)} 
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm z-20 flex-shrink-0 border-b border-slate-200 sticky top-0">
        <div className="w-full max-w-5xl mx-auto px-6 py-6 md:py-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl ${isDemoMode ? 'bg-[#f59e0b]' : 'bg-[#0284C7]'} text-white shadow-lg`}>
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-black text-2xl md:text-3xl text-[#0F172A] tracking-tight leading-none">MyRecovery</h1>
              <div className="flex items-center mt-1">
                <span className="text-xs font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">RAG Enabled</span>
                {isDemoMode && (
                  <span className="ml-2 text-xs font-bold text-[#f59e0b] bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center">
                      <WifiOff className="w-3 h-3 mr-1" /> Offline
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Share Button */}
            {appState === 'dashboard' && (
              <button 
                onClick={handleShare}
                className="bg-slate-100 text-[#64748B] p-3 rounded-xl hover:bg-slate-200 transition-colors"
                title="Share Plan"
              >
                <Share2 className="w-6 h-6" />
              </button>
            )}

            {/* Emergency Button */}
            {appState === 'dashboard' && (
              <button 
                onClick={() => setIsEmergencyOpen(true)}
                className="bg-[#E11D48]/10 text-[#E11D48] p-3 rounded-xl hover:bg-[#E11D48]/20 transition-colors border border-[#E11D48]/20"
                title="Emergency Medical ID"
              >
                <ShieldAlert className="w-6 h-6" />
              </button>
            )}

            <button 
              onClick={() => { setUploadedFiles([]); setAppState('upload'); }} 
              className="text-sm font-bold text-[#0284C7] bg-[#0284C7]/10 hover:bg-[#0284C7]/20 px-5 py-3 rounded-xl transition-colors"
            >
                New Scan
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Full Width */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] w-full">
        <div className="max-w-3xl mx-auto p-4 lg:p-8 pb-40">
            {/* Status Card */}
            <div className="bg-gradient-to-r from-[#0284C7] to-indigo-600 rounded-[2rem] p-6 text-white shadow-xl mb-10 sticky top-0 z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sky-100 text-sm font-bold uppercase tracking-wider mb-1">Recovery Status</p>
                  <h2 className="text-2xl font-black">{progressPercentage}% Complete</h2>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl">
                  <Thermometer className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <p className="text-sky-100 text-xs mt-3 font-medium text-right">{completedTasks} of {totalTasks} tasks done</p>
            </div>

            {/* Timeline with Progressive Disclosure */}
            <div className="space-y-4">
              {recoveryPlan.map((day, index) => (
                <DayAccordion 
                  key={day.day}
                  day={day}
                  isCompleted={index < currentActiveIndex}
                  isActive={index === currentActiveIndex}
                  isFuture={index > currentActiveIndex}
                  onToggleTask={toggleTask}
                />
              ))}
              
              {recoveryPlan.length === 0 && (
                <div className="text-center text-[#64748B] py-24">
                  <FileText className="w-20 h-20 mx-auto mb-4 opacity-20" />
                  <p className="text-xl font-bold opacity-50">No plan generated yet.</p>
                </div>
              )}
            </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-30">
        {isChatOpen && (
          <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col mb-4 origin-bottom-right animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0F172A] text-white p-5 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-xl">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-base block">Recovery Assistant</span>
                  <span className="text-xs text-slate-400 font-medium">Context Aware AI</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-slate-800 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-80 overflow-y-auto p-5 space-y-4 bg-slate-50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-[#0284C7] text-white rounded-br-none' : 'bg-white text-[#0F172A] border border-slate-100 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {isChatLoading && <div className="p-2 text-xs text-slate-400 italic">Thinking...</div>}
            </div>

            <form onSubmit={handleChatSubmit} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about medications..." className="flex-grow bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0284C7] outline-none text-[#0F172A]" />
              <button type="submit" className="bg-[#0284C7] text-white p-3 rounded-xl hover:bg-sky-700 transition-colors shadow-lg shadow-sky-200" disabled={!chatInput.trim() || isChatLoading}>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        <button onClick={() => setIsChatOpen(!isChatOpen)} className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${isChatOpen ? 'bg-[#0F172A] rotate-90' : 'bg-[#0284C7] text-white hover:rotate-12'}`}>
          {isChatOpen ? <X className="w-8 h-8 text-white" /> : <MessageCircle className="w-8 h-8" />}
        </button>
      </div>
    </div>
  );
}