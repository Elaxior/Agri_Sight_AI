import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Sprout, 
  AlertTriangle, 
  Download, 
  Upload, 
  Wind, 
  Droplets, 
  Cpu, 
  Layers, 
  Map as MapIcon, 
  Maximize2,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility for Tailwind ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Mock Data Generators ---
const generateInitialTrend = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    ndvi: 0.65 + Math.random() * 0.1,
    yield: 7.2 + Math.random() * 0.5,
    stress: 20 + Math.random() * 10
  }));
};

const INSIGHTS_DB = [
  "Detected minor nitrogen deficiency in Zone B-4.",
  "Irrigation schedule optimization: +12% efficiency predicted.",
  "Pest hotspot identified: Aphid cluster in Sector 7.",
  "NDVI trending positive following recent rainfall.",
  "Drone telemetry signal strength: 98% (Stable).",
  "Soil moisture levels dropping in North Quadrant.",
  "Weed density increasing in buffer zones.",
  "Yield forecast updated based on latest spectral data."
];

// --- Components ---

const Card = ({ children, className, title, icon: Icon, action }) => (
  <div className={cn("bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden flex flex-col shadow-lg transition-all hover:border-emerald-500/30 break-inside-avoid", className)}>
    {(title || Icon) && (
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/20">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide text-sm uppercase">
          {Icon && <Icon size={16} />}
          {title}
        </div>
        {action}
      </div>
    )}
    <div className="p-4 flex-1 relative">
      {children}
    </div>
  </div>
);

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-600",
    success: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
    warning: "bg-amber-900/30 text-amber-400 border-amber-700/50",
    danger: "bg-rose-900/30 text-rose-400 border-rose-700/50",
    info: "bg-blue-900/30 text-blue-400 border-blue-700/50",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-mono border", variants[variant])}>
      {children}
    </span>
  );
};

// --- 3D Map Visualization ---
const DigitalTwinMap = ({ isScanning, overlayType }) => {
  const [rotation, setRotation] = useState(0);

  // Auto-rotate effect: ONLY when scanning
  useEffect(() => {
    let interval;
    if (isScanning) {
        interval = setInterval(() => {
            setRotation(r => r + 0.5); // Smoother rotation
        }, 50);
    } else {
        // Optional: Reset rotation when done or keep it? Keeping it looks more natural, 
        // but let's snap it to a nice angle if we want to "park" the drone.
        // For now, we just stop rotating.
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 rounded-lg group perspective-1000 print:perspective-none">
      {/* 3D Transform Container */}
      <div 
        className="absolute inset-[-50%] w-[200%] h-[200%] transition-transform duration-700 ease-out print:transform-none print:inset-0 print:w-full print:h-full"
        style={{ 
          transform: `rotateX(60deg) rotateZ(${rotation}deg) scale(1.5)`,
          backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:100px_100px] opacity-30" />
        
        {/* Heatmap Layers */}
        {overlayType === 'ndvi' && (
          <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-emerald-500/20 via-transparent to-yellow-500/20 mix-blend-overlay animate-pulse print:animate-none" />
        )}
        {overlayType === 'pest' && (
           <div className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 bg-red-500/30 blur-[60px] rounded-full animate-pulse print:animate-none" />
        )}

        {/* Parcel Polygons (SVG Overlay) */}
        <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
           <path d="M 800 600 L 1200 650 L 1150 900 L 750 850 Z" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="2" />
           <path d="M 1250 650 L 1600 700 L 1550 950 L 1200 900 Z" fill="rgba(245, 158, 11, 0.1)" stroke="#f59e0b" strokeWidth="2" />
        </svg>
      </div>

      {/* Scanning Laser Effect */}
      {isScanning && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent h-[10%] w-full animate-scan pointer-events-none border-b border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.5)] print:hidden" />
      )}

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 no-print">
        <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-slate-800 text-slate-300">
            <Layers size={18} />
        </button>
        <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-slate-800 text-slate-300">
            <Maximize2 size={18} />
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700 p-3 rounded-lg backdrop-blur-sm">
        <h4 className="text-xs text-slate-400 uppercase font-semibold mb-2">Spectral Index</h4>
        <div className="flex items-center gap-2">
            <div className="h-3 w-32 rounded bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500" />
            <span className="text-xs font-mono text-emerald-400">0.92</span>
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---
const App = () => {
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [overlay, setOverlay] = useState('ndvi');
  const [data, setData] = useState(generateInitialTrend());
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    ndvi: 0.72,
    yield: 8.4,
    pestRisk: 'Low',
    pestConf: 12,
    moisture: 64
  });

  const dashboardRef = useRef(null);
  const logsEndRef = useRef(null);

  // --- Logic: Handle Process Completion ---
  useEffect(() => {
    if (progress >= 100 && isProcessing) {
        setIsProcessing(false);
        setLogs(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString(), text: "Pipeline Analysis Complete. Report Ready.", type: "success" }]);
    }
  }, [progress, isProcessing]);

  // --- Logic: Simulation Loop ---
  useEffect(() => {
    let interval;
    if (isProcessing) {
      interval = setInterval(() => {
        // 1. Advance Progress (Fast enough to complete in ~10 seconds)
        setProgress(prev => {
            if (prev >= 100) return 100;
            return prev + 1; 
        });

        // 2. Jitter Metrics (Real-time feel)
        setMetrics(prev => ({
            ndvi: Math.max(0.4, Math.min(0.95, prev.ndvi + (Math.random() * 0.04 - 0.02))),
            yield: Math.max(5, Math.min(12, prev.yield + (Math.random() * 0.2 - 0.1))),
            pestRisk: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'Med' : 'High') : 'Low',
            pestConf: Math.max(0, Math.min(100, prev.pestConf + (Math.random() * 5 - 2.5))),
            moisture: Math.max(30, Math.min(90, prev.moisture + (Math.random() * 2 - 1)))
        }));

        // 3. Update Chart Data
        setData(prevData => {
            const newPoint = {
                time: prevData[prevData.length - 1].time + 1,
                ndvi: metrics.ndvi,
                yield: metrics.yield,
                stress: metrics.pestConf
            };
            return [...prevData.slice(1), newPoint];
        });

        // 4. Add Logs occasionally
        if (Math.random() > 0.8) {
            const newLog = {
                id: Date.now(),
                time: new Date().toLocaleTimeString(),
                text: INSIGHTS_DB[Math.floor(Math.random() * INSIGHTS_DB.length)],
                type: Math.random() > 0.8 ? 'alert' : 'info'
            };
            setLogs(prev => [...prev.slice(-15), newLog]);
        }

      }, 200); // 200ms tick
    }
    return () => clearInterval(interval);
  }, [isProcessing, metrics]);

  // Scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Handlers
  const handleUpload = () => {
    setProgress(0); // Reset progress
    setIsProcessing(true);
    setLogs([{ id: Date.now(), time: new Date().toLocaleTimeString(), text: "Drone imagery upload complete. Initializing pipeline...", type: "info" }]);
  };

  const handleDownloadReport = () => {
    alert("Preparing Report for Print/PDF Export...");
    setTimeout(() => {
        window.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden" ref={dashboardRef}>
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
                <Sprout className="text-emerald-400" size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-white">AgriVision <span className="text-emerald-400">Pro</span></h1>
                <p className="text-xs text-slate-400 font-mono tracking-wider">AI PRECISION ANALYTICS SYSTEM</p>
            </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
            {['Dashboard', 'Spectral', 'Soil', 'Settings'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", 
                        activeTab === tab.toLowerCase() ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    )}
                >
                    {tab}
                </button>
            ))}
        </nav>

        <div className="flex items-center gap-3">
            <button 
                onClick={handleUpload}
                disabled={isProcessing}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border",
                    isProcessing ? "bg-emerald-900/20 border-emerald-800 text-emerald-600" : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                )}
            >
                {isProcessing ? <Activity className="animate-spin" size={16} /> : <Upload size={16} />}
                {isProcessing ? "Processing Stream..." : "Upload Drone Data"}
            </button>
            <button 
                onClick={handleDownloadReport}
                className="p-2 text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                title="Download Report"
            >
                <Download size={20} />
            </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="p-6 grid grid-cols-12 gap-6 max-w-[1920px] mx-auto">
        
        {/* TOP METRICS ROW */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-xs font-mono uppercase">Avg NDVI Score</span>
                    <Activity size={16} className="text-emerald-500" />
                </div>
                <div className="text-3xl font-bold text-white font-mono">{metrics.ndvi.toFixed(3)}</div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Optimal Growth Range
                </div>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-xs font-mono uppercase">Yield Forecast</span>
                    <Sprout size={16} className="text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-white font-mono">{metrics.yield.toFixed(1)} <span className="text-base text-slate-500">t/ha</span></div>
                <div className="text-xs text-blue-400 mt-1">+12% vs Baseline</div>
            </Card>

            <Card className={cn("border-l-4 transition-colors duration-500", metrics.pestRisk === 'High' ? 'border-l-rose-500' : 'border-l-amber-500')}>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-xs font-mono uppercase">Pest Risk Index</span>
                    <AlertTriangle size={16} className={metrics.pestRisk === 'High' ? 'text-rose-500' : 'text-amber-500'} />
                </div>
                <div className="flex items-baseline gap-3">
                    <div className="text-3xl font-bold text-white font-mono">{metrics.pestRisk}</div>
                    <div className="text-sm font-mono text-slate-400">Conf: {metrics.pestConf.toFixed(0)}%</div>
                </div>
                <div className={cn("text-xs mt-1", metrics.pestRisk === 'High' ? 'text-rose-400' : 'text-amber-400')}>
                    {metrics.pestRisk === 'High' ? 'Immediate Action Required' : 'Monitoring Active'}
                </div>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-400 text-xs font-mono uppercase">System Latency</span>
                    <Cpu size={16} className="text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-white font-mono">38<span className="text-base text-slate-500">ms</span></div>
                <div className="text-xs text-purple-400 mt-1">Real-time Inference</div>
            </Card>
        </div>

        {/* LEFT COLUMN: VISUAL TWIN & CONTROLS */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            {/* 3D MAP CONTAINER */}
            <Card title="3D Digital Farm Twin" icon={MapIcon} className="h-[500px] p-0 overflow-hidden relative"
                action={
                    <div className="flex gap-2 no-print">
                        <button onClick={() => setOverlay('ndvi')} className={cn("px-2 py-1 text-xs rounded border transition-colors", overlay === 'ndvi' ? "bg-emerald-900/50 border-emerald-500 text-emerald-400" : "border-slate-700 text-slate-400")}>NDVI</button>
                        <button onClick={() => setOverlay('pest')} className={cn("px-2 py-1 text-xs rounded border transition-colors", overlay === 'pest' ? "bg-rose-900/50 border-rose-500 text-rose-400" : "border-slate-700 text-slate-400")}>PEST</button>
                    </div>
                }
            >
                <div className="absolute inset-0 bg-slate-950">
                   <DigitalTwinMap isScanning={isProcessing} overlayType={overlay} />
                </div>

                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="absolute top-4 right-4 bg-slate-900/90 border border-emerald-500/50 p-3 rounded-lg backdrop-blur-md shadow-lg flex flex-col gap-2 w-48 z-10 no-print">
                        <div className="flex justify-between items-center text-xs text-emerald-400 font-mono">
                            <span>PROCESSING</span>
                            <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-300" 
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                            Model: YOLOv8-Ag + ResNet50
                        </div>
                    </div>
                )}
            </Card>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Crop Health Trend (NDVI)" icon={Activity} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={[0.4, 1]} stroke="#64748b" tick={{fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Area type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNdvi)" isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Nutrient Composition" icon={Droplets} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { name: 'N', val: 85, max: 100 },
                            { name: 'P', val: 62, max: 100 },
                            { name: 'K', val: 74, max: 100 },
                            { name: 'Mg', val: 45, max: 100 },
                            { name: 'Ca', val: 90, max: 100 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                            <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                            <Tooltip 
                                cursor={{fill: '#1e293b'}}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                            />
                            <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>

        {/* RIGHT COLUMN: INSIGHTS & LOGS */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* AI MODELS STATUS */}
            <Card title="Model Ensemble Status" icon={Layers}>
                <div className="space-y-4">
                    {[
                        { name: 'Segmentation', type: 'U-Net', status: isProcessing ? 'Active' : 'Idle', latency: isProcessing ? '42ms' : '--', conf: isProcessing ? 98 : 0 },
                        { name: 'Disease Detection', type: 'ResNet50', status: isProcessing ? 'Active' : 'Idle', latency: isProcessing ? '112ms' : '--', conf: isProcessing ? 85 : 0 },
                        { name: 'Yield Prediction', type: 'XGBoost', status: 'Idle', latency: '--', conf: 0 },
                    ].map((model, i) => (
                        <div key={i} className="bg-slate-800/50 p-3 rounded border border-slate-700/50">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-slate-200">{model.name}</span>
                                <Badge variant={model.status === 'Active' ? 'success' : 'default'}>{model.status}</Badge>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 font-mono mb-2">
                                <span>{model.type}</span>
                                <span>Lat: {model.latency}</span>
                            </div>
                            {model.status === 'Active' && (
                                <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 animate-pulse" style={{width: `${model.conf}%`}} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* LIVE INSIGHTS FEED */}
            <Card title="Live Insights Feed" icon={FileText} className="flex-1 min-h-[300px]">
                <div className="absolute inset-0 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {logs.length === 0 && (
                        <div className="text-center text-slate-500 text-sm mt-10 italic">
                            Waiting for telemetry stream...
                        </div>
                    )}
                    {logs.map((log) => (
                        <div key={log.id} className="flex gap-3 items-start animate-fade-in">
                            <div className={cn("mt-1", log.type === 'alert' ? "text-amber-500" : "text-emerald-500")}>
                                {log.type === 'alert' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-mono mb-0.5">{log.time}</p>
                                <p className="text-sm text-slate-300 leading-snug">{log.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </Card>

            {/* ACTION CARD */}
            <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900 border border-emerald-800/50 rounded-xl p-5 shadow-lg no-print">
                <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                    <Wind size={18} /> Intervention Recommended
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                    Based on current spectral analysis, variable rate nitrogen application is recommended for Zone B.
                </p>
                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg transition-colors text-sm shadow-lg shadow-emerald-900/20">
                    Generate Prescription Map
                </button>
            </div>

        </div>
      </main>

      <style jsx global>{`
        @media print {
            .no-print { display: none !important; }
            body { 
                background-color: #0f172a !important; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
                color: #e2e8f0 !important;
            }
            /* Force background colors */
            * {
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
            }
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
      `}</style>
    </div>
  );
};

export default App;