import React, { useState, useEffect } from "react";
import {
  Camera,
  Upload,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Info,
  Hospital,
  ArrowLeft,
  Loader2,
  Languages,
  ChevronRight,
  Activity,
  Crosshair,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import {
  detectSnake,
  findNearbyHospitals,
  SnakeDetectionResult,
} from "./services/geminiService";
import { CameraCapture } from "./components/CameraCapture";
import { LANGUAGES, TRANSLATIONS } from "./constants/translations";

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SnakeDetectionResult | null>(null);
  const [hospitals, setHospitals] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [language, setLanguage] = useState("English");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const t = TRANSLATIONS[language] || TRANSLATIONS.English;

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => console.warn("Geolocation error:", err),
      );
    }
  }, []);

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
    if (isAnalyzing) return; // 🚫 prevent spam

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setHospitals(null);

    try {
      const detectionResult = await detectSnake(base64, language);
      setResult(detectionResult);

      // ⏳ ADD DELAY (IMPORTANT)
      await new Promise((res) => setTimeout(res, 3000));

      if (location) {
        const hospitalData = await findNearbyHospitals(
          location.lat,
          location.lng,
          language,
        );
        setHospitals(hospitalData);
      }
    } catch (err: any) {
      console.error(err);

      if (err?.status === 429) {
        setError("⚠️ Too many requests. Please wait 10–20 seconds.");
      } else {
        setError(t.error);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setHospitals(null);
    setError(null);
    setShowCamera(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E0E0E0] font-sans selection:bg-[#F27D26] selection:text-white">
      {/* Technical Header */}
      <header className="border-b border-[#1A1A1C] bg-[#0F0F11]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F27D26] rounded-sm flex items-center justify-center">
              <Zap className="w-5 h-5 text-black fill-current" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tighter text-white leading-none">
                {t.title}
              </h1>
              <p className="text-[10px] font-mono text-[#666] tracking-[0.2em] uppercase mt-1">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#151518] border border-[#222] rounded-md">
              <Languages className="w-4 h-4 text-[#F27D26]" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-mono focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className="bg-[#151518]"
                  >
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            {image && (
              <button
                onClick={reset}
                className="text-[10px] font-mono font-bold tracking-widest px-4 py-2 bg-[#F27D26] text-black rounded-sm hover:bg-[#FF8C38] transition-colors uppercase"
              >
                {t.newScan}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!image && !showCamera ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto mt-12"
            >
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold tracking-tighter text-white mb-4 leading-tight">
                  {t.heroTitle}
                </h2>
                <p className="text-[#888] text-lg leading-relaxed">
                  {t.heroSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowCamera(true)}
                  className="group relative overflow-hidden bg-[#151518] border border-[#222] p-8 rounded-xl hover:border-[#F27D26]/50 transition-all text-left"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Camera className="w-24 h-24" />
                  </div>
                  <div className="w-12 h-12 bg-[#F27D26]/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#F27D26]/20 transition-colors">
                    <Camera className="w-6 h-6 text-[#F27D26]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t.openCamera}
                  </h3>
                  <p className="text-sm text-[#666]">{t.directCapture}</p>
                </button>

                <label className="group relative overflow-hidden bg-[#151518] border border-[#222] p-8 rounded-xl hover:border-[#F27D26]/50 transition-all text-left cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Upload className="w-24 h-24" />
                  </div>
                  <div className="w-12 h-12 bg-[#F27D26]/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#F27D26]/20 transition-colors">
                    <Upload className="w-6 h-6 text-[#F27D26]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t.uploadImage}
                  </h3>
                  <p className="text-sm text-[#666]">{t.fromGallery}</p>
                </label>
              </div>
            </motion.div>
          ) : showCamera ? (
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Image & Status */}
              <div className="lg:col-span-5 space-y-6">
                <div className="relative aspect-square bg-[#151518] rounded-2xl overflow-hidden border border-[#222] shadow-2xl">
                  <img
                    src={image!}
                    alt="Specimen"
                    className="w-full h-full object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                      <Loader2 className="w-12 h-12 text-[#F27D26] animate-spin mb-4" />
                      <p className="text-xs font-mono tracking-[0.3em] uppercase text-[#F27D26] animate-pulse">
                        {t.analyzing}
                      </p>
                    </div>
                  )}
                  {result && (
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-white">
                          {t.aiVerified}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {result && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#151518] border border-[#222] p-4 rounded-xl">
                      <p className="text-[10px] font-mono text-[#666] uppercase tracking-wider mb-1">
                        {t.status}
                      </p>
                      <div className="flex items-center gap-2">
                        {result.isVenomous ? (
                          <ShieldAlert className="w-5 h-5 text-red-500" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-green-500" />
                        )}
                        <span
                          className={`font-bold ${result.isVenomous ? "text-red-500" : "text-green-500"}`}
                        >
                          {result.isVenomous ? t.venomous : t.nonVenomous}
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#151518] border border-[#222] p-4 rounded-xl">
                      <p className="text-[10px] font-mono text-[#666] uppercase tracking-wider mb-1">
                        {t.dangerLevel}
                      </p>
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`w-5 h-5 ${
                            result.dangerLevel === "Critical"
                              ? "text-red-600"
                              : result.dangerLevel === "High"
                                ? "text-red-500"
                                : result.dangerLevel === "Medium"
                                  ? "text-orange-500"
                                  : "text-green-500"
                          }`}
                        />
                        <span
                          className={`font-bold ${
                            result.dangerLevel === "Critical"
                              ? "text-red-600"
                              : result.dangerLevel === "High"
                                ? "text-red-500"
                                : result.dangerLevel === "Medium"
                                  ? "text-orange-500"
                                  : "text-green-500"
                          }`}
                        >
                          {result.dangerLevel}
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#151518] border border-[#222] p-4 rounded-xl col-span-2">
                      <p className="text-[10px] font-mono text-[#666] uppercase tracking-wider mb-1">
                        {t.confidence}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${result.confidenceScore * 100}%`,
                            }}
                            className="h-full bg-[#F27D26]"
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-white">
                          {(result.confidenceScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Details & Medical */}
              <div className="lg:col-span-7 space-y-8">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                      <p className="text-red-500 font-bold mb-2">{t.error}</p>
                      <button
                        onClick={reset}
                        className="text-xs font-mono underline hover:text-white transition-colors"
                      >
                        {t.tryAgain}
                      </button>
                    </div>
                  </div>
                )}

                {result && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    {/* Identification Header */}
                    <section>
                      <div className="flex items-center gap-2 text-[#F27D26] mb-2">
                        <Crosshair className="w-4 h-4" />
                        <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
                          {t.identified}
                        </span>
                      </div>
                      <h2 className="text-4xl font-bold text-white tracking-tight mb-1">
                        {result.speciesName}
                      </h2>
                      <p className="text-lg font-mono italic text-[#666]">
                        {result.scientificName}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.commonNames.map((name, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-[#1A1A1C] border border-[#222] text-[10px] font-mono text-[#888] rounded uppercase"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* Description & Habitat */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section className="bg-[#151518] border border-[#222] p-6 rounded-xl">
                        <div className="flex items-center gap-2 text-white mb-4">
                          <Info className="w-4 h-4 text-[#F27D26]" />
                          <h3 className="text-xs font-mono font-bold uppercase tracking-widest">
                            {t.habitat}
                          </h3>
                        </div>
                        <p className="text-sm text-[#888] leading-relaxed">
                          {result.habitat}
                        </p>
                      </section>
                      <section className="bg-[#151518] border border-[#222] p-6 rounded-xl">
                        <div className="flex items-center gap-2 text-white mb-4">
                          <Activity className="w-4 h-4 text-[#F27D26]" />
                          <h3 className="text-xs font-mono font-bold uppercase tracking-widest">
                            {t.behavior}
                          </h3>
                        </div>
                        <p className="text-sm text-[#888] leading-relaxed">
                          {result.behavior}
                        </p>
                      </section>
                    </div>

                    {/* First Aid Protocol */}
                    <section className="bg-[#151518] border border-[#222] overflow-hidden rounded-xl">
                      <div className="bg-[#F27D26] p-4 flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-black" />
                        <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                          {t.firstAid}
                        </h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-xs font-mono font-bold text-green-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full" />
                            {t.whatToDo}
                          </h4>
                          <ul className="space-y-3">
                            {result.firstAid.do.map((item, i) => (
                              <li
                                key={i}
                                className="text-sm text-[#AAA] flex items-start gap-3"
                              >
                                <ChevronRight className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <div className="w-1 h-1 bg-red-500 rounded-full" />
                            {t.whatNotToDo}
                          </h4>
                          <ul className="space-y-3">
                            {result.firstAid.dont.map((item, i) => (
                              <li
                                key={i}
                                className="text-sm text-[#AAA] flex items-start gap-3"
                              >
                                <ChevronRight className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </section>

                    {/* Hospital Locator */}
                    <section className="bg-[#151518] border border-[#222] p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#F27D26]/10 rounded-lg flex items-center justify-center">
                            <Hospital className="w-5 h-5 text-[#F27D26]" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                              {t.nearestCare}
                            </h3>
                            <p className="text-[10px] font-mono text-[#666]">
                              {location
                                ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                                : t.enableLocation}
                            </p>
                          </div>
                        </div>
                      </div>

                      {hospitals ? (
                        <div className="space-y-4">
                          <div className="prose prose-invert prose-sm max-w-none text-[#888]">
                            <Markdown>{hospitals.text}</Markdown>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {hospitals.groundingChunks.map(
                              (chunk: any, i: number) =>
                                chunk.maps && (
                                  <a
                                    key={i}
                                    href={chunk.maps.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-[#1A1A1C] border border-[#222] rounded-lg hover:border-[#F27D26]/50 transition-all group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <MapPin className="w-4 h-4 text-[#F27D26]" />
                                      <span className="text-xs font-bold text-white group-hover:text-[#F27D26] transition-colors line-clamp-1">
                                        {chunk.maps.title}
                                      </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-[#444] group-hover:text-[#F27D26]" />
                                  </a>
                                ),
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-[#444] py-4">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs font-mono uppercase tracking-widest">
                            Locating Medical Centers...
                          </span>
                        </div>
                      )}
                    </section>
                  </motion.div>
                )}

                {!result && !isAnalyzing && !error && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#151518] border border-dashed border-[#222] rounded-2xl">
                    <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mb-6">
                      <Crosshair className="w-8 h-8 text-[#444]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {t.awaiting}
                    </h3>
                    <p className="text-sm text-[#666] max-w-xs mx-auto">
                      {t.heroSubtitle}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-[#1A1A1C] mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-50">
            <Zap className="w-5 h-5 text-[#F27D26]" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase">
              Ophidia Intelligence v2.0
            </span>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest mb-1">
                Status
              </p>
              <p className="text-xs font-bold text-green-500">System Online</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest mb-1">
                Database
              </p>
              <p className="text-xs font-bold text-white">Global Herpetology</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest mb-1">
                Engine
              </p>
              <p className="text-xs font-bold text-white">Gemini 3.0 Flash</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
