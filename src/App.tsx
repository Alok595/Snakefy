import React, { useState, useEffect } from "react";
import {
  Camera,
  Upload,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Loader2,
  Languages,
  ChevronRight,
  Activity,
  Crosshair,
  Zap,
  Skull,
  Droplets,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { detectSnake, SnakeDetectionResult } from "./services/geminiService";
import { CameraCapture } from "./components/CameraCapture";
import { LANGUAGES, TRANSLATIONS } from "./constants/translations";

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SnakeDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [language, setLanguage] = useState("English");

  const t = TRANSLATIONS[language] || TRANSLATIONS.English;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const detectionResult = await detectSnake(base64, language);
      setResult(detectionResult);
    } catch (err) {
      console.error(err);
      setError(t.error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setShowCamera(false);
  };

  const dangerColor = (level: string) => {
    if (level === "Critical")
      return "text-red-500 border-red-500/30 bg-red-500/10";
    if (level === "High")
      return "text-orange-400 border-orange-400/30 bg-orange-400/10";
    if (level === "Medium")
      return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
    return "text-green-400 border-green-400/30 bg-green-400/10";
  };

  return (
    <div className="min-h-screen bg-[#080809] text-[#D4D4D8] font-sans">
      {/* ── Header ── */}
      <header className="border-b border-white/5 bg-[#0C0C0E]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 bg-[#F27D26] rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-black fill-current" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-tighter text-white leading-none">
                {t.title}
              </h1>
              <p className="text-[9px] font-mono text-[#555] tracking-[0.18em] uppercase mt-0.5">
                {t.subtitle}
              </p>
            </div>
            <h1 className="sm:hidden text-sm font-bold text-white">
              {t.title}
            </h1>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141416] border border-white/8 rounded">
              <Languages className="w-3.5 h-3.5 text-[#F27D26] shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-[11px] font-mono focus:outline-none cursor-pointer max-w-[80px] sm:max-w-none"
              >
                {LANGUAGES.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className="bg-[#141416]"
                  >
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            {image && (
              <button
                onClick={reset}
                className="text-[10px] font-mono font-bold tracking-widest px-3 py-1.5 bg-[#F27D26] text-black rounded hover:bg-[#FF8C38] transition-colors uppercase whitespace-nowrap"
              >
                {t.newScan}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <AnimatePresence mode="wait">
          {/* ── Landing ── */}
          {!image && !showCamera && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="max-w-xl mx-auto mt-8 sm:mt-16"
            >
              <div className="text-center mb-10 sm:mb-14">
                {/* Decorative ring */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                  <div
                    className="absolute inset-0 rounded-full border border-[#F27D26]/20 animate-ping"
                    style={{ animationDuration: "3s" }}
                  />
                  <div className="absolute inset-2 rounded-full border border-[#F27D26]/30" />
                  <Crosshair className="w-8 h-8 text-[#F27D26]" />
                </div>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tighter text-white mb-3 leading-tight">
                  {t.heroTitle}
                </h2>
                <p className="text-[#666] text-sm sm:text-base leading-relaxed px-4">
                  {t.heroSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => setShowCamera(true)}
                  className="group relative overflow-hidden bg-[#111113] border border-white/8 p-6 sm:p-8 rounded-2xl hover:border-[#F27D26]/40 transition-all text-left active:scale-[0.98]"
                >
                  <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Camera className="w-28 h-28" />
                  </div>
                  <div className="w-10 h-10 bg-[#F27D26]/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#F27D26]/20 transition-colors">
                    <Camera className="w-5 h-5 text-[#F27D26]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {t.openCamera}
                  </h3>
                  <p className="text-xs text-[#555]">{t.directCapture}</p>
                </button>

                <label className="group relative overflow-hidden bg-[#111113] border border-white/8 p-6 sm:p-8 rounded-2xl hover:border-[#F27D26]/40 transition-all text-left cursor-pointer active:scale-[0.98] block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Upload className="w-28 h-28" />
                  </div>
                  <div className="w-10 h-10 bg-[#F27D26]/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#F27D26]/20 transition-colors">
                    <Upload className="w-5 h-5 text-[#F27D26]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {t.uploadImage}
                  </h3>
                  <p className="text-xs text-[#555]">{t.fromGallery}</p>
                </label>
              </div>

              {/* Disclaimer */}
              <p className="text-center text-[10px] font-mono text-[#333] mt-8 leading-relaxed px-4">
                FOR EDUCATIONAL USE ONLY · NOT A SUBSTITUTE FOR EMERGENCY
                MEDICAL ADVICE
              </p>
            </motion.div>
          )}

          {/* ── Camera ── */}
          {showCamera && (
            <div className="fixed inset-0 z-[100] bg-black">
              <CameraCapture
                onCapture={(base64) => {
                  setImage(base64);
                  setShowCamera(false);
                  analyzeImage(base64);
                }}
                onClose={() => setShowCamera(false)}
              />
            </div>
          )}

          {/* ── Results ── */}
          {image && !showCamera && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Top: image + quick stats */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Image */}
                <div className="lg:col-span-4 xl:col-span-3">
                  <div className="relative w-full aspect-square max-w-xs mx-auto lg:max-w-none bg-[#111113] rounded-2xl overflow-hidden border border-white/8">
                    <img
                      src={image}
                      alt="Specimen"
                      className="w-full h-full object-cover"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-10 h-10 text-[#F27D26] animate-spin" />
                        <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#F27D26] animate-pulse">
                          {t.analyzing}
                        </p>
                      </div>
                    )}
                    {result && (
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-white">
                            {t.aiVerified}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick stat cards — horizontal scroll on mobile */}
                {result && (
                  <div className="lg:col-span-8 xl:col-span-9 flex flex-col justify-center gap-3">
                    {/* Species name */}
                    <div className="bg-[#111113] border border-white/8 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 text-[#F27D26] mb-1.5">
                        <Crosshair className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase">
                          {t.identified}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                        {result.speciesName}
                      </h2>
                      <p className="text-sm font-mono italic text-[#555] mt-0.5">
                        {result.scientificName}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {result.commonNames.slice(0, 4).map((name, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white/5 border border-white/8 text-[9px] font-mono text-[#666] rounded uppercase"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stat row */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* Venom status */}
                      <div className="bg-[#111113] border border-white/8 rounded-xl p-3 sm:p-4">
                        <p className="text-[9px] font-mono text-[#444] uppercase tracking-wider mb-2">
                          {t.status}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {result.isVenomous ? (
                            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                          )}
                          <span
                            className={`text-xs font-bold leading-tight ${result.isVenomous ? "text-red-500" : "text-green-400"}`}
                          >
                            {result.isVenomous ? t.venomous : t.nonVenomous}
                          </span>
                        </div>
                      </div>

                      {/* Danger level */}
                      <div className="bg-[#111113] border border-white/8 rounded-xl p-3 sm:p-4">
                        <p className="text-[9px] font-mono text-[#444] uppercase tracking-wider mb-2">
                          {t.dangerLevel}
                        </p>
                        <span
                          className={`inline-block text-xs font-bold px-2 py-0.5 rounded border ${dangerColor(result.dangerLevel)}`}
                        >
                          {result.dangerLevel}
                        </span>
                      </div>

                      {/* Confidence */}
                      <div className="bg-[#111113] border border-white/8 rounded-xl p-3 sm:p-4">
                        <p className="text-[9px] font-mono text-[#444] uppercase tracking-wider mb-2">
                          {t.confidence}
                        </p>
                        <p className="text-lg font-bold text-white font-mono">
                          {(result.confidenceScore * 100).toFixed(0)}
                          <span className="text-xs text-[#555]">%</span>
                        </p>
                        <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${result.confidenceScore * 100}%`,
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-[#F27D26] rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/8 border border-red-500/20 p-5 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-bold text-sm mb-1">
                      {t.error}
                    </p>
                    <button
                      onClick={reset}
                      className="text-xs font-mono text-[#666] underline hover:text-white transition-colors"
                    >
                      {t.tryAgain}
                    </button>
                  </div>
                </div>
              )}

              {/* Detail sections */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-4"
                >
                  {/* Habitat & Behaviour */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#111113] border border-white/8 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-3.5 h-3.5 text-[#F27D26]" />
                        <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#888]">
                          {t.habitat}
                        </h3>
                      </div>
                      <p className="text-sm text-[#777] leading-relaxed">
                        {result.habitat}
                      </p>
                    </div>
                    <div className="bg-[#111113] border border-white/8 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-3.5 h-3.5 text-[#F27D26]" />
                        <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#888]">
                          {t.behavior}
                        </h3>
                      </div>
                      <p className="text-sm text-[#777] leading-relaxed">
                        {result.behavior}
                      </p>
                    </div>
                  </div>

                  {/* Venom Profile — replaces hospital section */}
                  {result.isVenomous && (
                    <div className="bg-[#111113] border border-red-500/15 rounded-2xl overflow-hidden">
                      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-red-500/8 border-b border-red-500/10">
                        <Skull className="w-4 h-4 text-red-400" />
                        <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400">
                          Venom Profile
                        </h3>
                      </div>
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Droplets className="w-4 h-4 text-red-400" />
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-[#444] uppercase tracking-wider mb-1">
                              Venom Type
                            </p>
                            <p className="text-sm text-[#CCC] font-medium">
                              {result.dangerLevel === "Critical"
                                ? "Highly Toxic"
                                : result.dangerLevel === "High"
                                  ? "Potent Toxin"
                                  : "Mild Toxin"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-[#444] uppercase tracking-wider mb-1">
                              Threat Level
                            </p>
                            <p
                              className={`text-sm font-bold ${dangerColor(result.dangerLevel).split(" ")[0]}`}
                            >
                              {result.dangerLevel}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Eye className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-[#444] uppercase tracking-wider mb-1">
                              Action Required
                            </p>
                            <p className="text-sm text-[#CCC] font-medium">
                              {result.dangerLevel === "Critical" ||
                              result.dangerLevel === "High"
                                ? "Seek ER Immediately"
                                : "Monitor & Consult"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* First Aid */}
                  <div className="bg-[#111113] border border-white/8 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 bg-[#F27D26]/10 border-b border-[#F27D26]/15">
                      <ShieldAlert className="w-4 h-4 text-[#F27D26]" />
                      <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F27D26]">
                        {t.firstAid}
                      </h3>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-[9px] font-mono font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          {t.whatToDo}
                        </h4>
                        <ul className="space-y-2.5">
                          {result.firstAid.do.map((item, i) => (
                            <li
                              key={i}
                              className="text-sm text-[#888] flex items-start gap-2.5"
                            >
                              <ChevronRight className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          {t.whatNotToDo}
                        </h4>
                        <ul className="space-y-2.5">
                          {result.firstAid.dont.map((item, i) => (
                            <li
                              key={i}
                              className="text-sm text-[#888] flex items-start gap-2.5"
                            >
                              <ChevronRight className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Emergency reminder banner */}
                  {result.isVenomous && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-3 p-4 bg-red-500/8 border border-red-500/20 rounded-2xl"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      </div>
                      <p className="text-xs text-red-300/80 leading-relaxed">
                        <span className="font-bold text-red-400">
                          EMERGENCY:{" "}
                        </span>
                        If bitten by this snake, call emergency services
                        immediately. Keep the affected limb still and below
                        heart level. Do not attempt self-treatment.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 border-t border-white/5 mt-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-30">
            <Zap className="w-4 h-4 text-[#F27D26]" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
              Ophidia Intelligence v2.0
            </span>
          </div>
          <div className="flex gap-6 sm:gap-8">
            {[
              { label: "Status", value: "Online", color: "text-green-500" },
              {
                label: "Database",
                value: "Global Herpetology",
                color: "text-white",
              },
              { label: "Engine", value: "Gemini Flash", color: "text-white" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="text-[9px] font-mono text-[#333] uppercase tracking-widest mb-0.5">
                  {label}
                </p>
                <p className={`text-[11px] font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
