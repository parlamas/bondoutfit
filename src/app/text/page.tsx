//src/app/text/page.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function SwellTextPage() {
  const [activeLine, setActiveLine] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lineWordCounts, setLineWordCounts] = useState<number[]>([]);
  const [navigationMode, setNavigationMode] = useState<'auto' | 'manual'>('auto');
  const [showEnglish, setShowEnglish] = useState(true);
  const [showGreek, setShowGreek] = useState(true);
  const [showDanish, setShowDanish] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const englishLines = [
    "Subtract theater, drama, comedy, satire, the Olympic Games, painting, sculpture, architecture,",
    "mathematics and physics, philosophy, politics, democracy, music, the Greek language and its vocabulary;",
    "subtract Socrates, Plato, Aristotle, Alexander the Great,",
    "Thales of Miletus, Solon, Archimedes, Pythagoras,",
    "Aeschylus, Euripides, Leonidas, Pericles;",
    "subtract the beautiful, insightful, and meaningful corpus of Greek mythology;",
    "subtract Homer, Eratosthenes, Anaximander, Heraclitus,",
    "Parmenides, Empedocles, Anaxagoras, Leucippus, Democritus—",
    "and thousands of others, not hundreds, thousands of others of equal stature."
  ];

  const greekLines = [
    "Αφαιρέστε το θέατρο, το δράμα, την κωμωδία, τη σάτιρα, τους Ολυμπιακούς Αγώνες, τη ζωγραφική, τη γλυπτική, την αρχιτεκτονική,",
    "μαθηματικά και φυσική, φιλοσοφία, πολιτική, δημοκρατία, μουσική, την ελληνική γλώσσα και το λεξιλόγιό της·",
    "αφαιρέστε τον Σωκράτη, τον Πλάτωνα, τον Αριστοτέλη, τον Μέγα Αλέξανδρο,",
    "Θαλή τον Μιλήσιο, Σόλωνα, Αρχιμήδη, Πυθαγόρα,",
    "Αισχύλο, Ευριπίδη, Λεωνίδα, Περικλή·",
    "αφαιρέστε το όμορφο, διορατικό και ουσιαστικό σώμα της ελληνικής μυθολογίας·",
    "αφαιρέστε τον Όμηρο, τον Ερατοσθένη, τον Αναξίμανδρο, τον Ηράκλειτο,",
    "Παρμενίδη, Εμπεδοκλή, Αναξαγόρα, Λεύκιππο, Δημοκρίτο—",
    "και χιλιάδες άλλους, όχι εκατοντάδες, χιλιάδες άλλους ίσης σταθερότητας."
  ];

  const danishLines = [
    "Fratræk teater, drama, komedie, satire, de Olympiske Lege, maleri, skulptur, arkitektur,",
    "matematik og fysik, filosofi, politik, demokrati, musik, det græske sprog og dets ordforråd;",
    "fratræk Sokrates, Platon, Aristoteles, Alexander den Store,",
    "Thales fra Milet, Solon, Archimedes, Pythagoras,",
    "Æskylos, Euripides, Leonidas, Perikles;",
    "fratræk det smukke, indsigtsfulde og meningsfulde korpus af græsk mytologi;",
    "fratræk Homer, Eratosthenes, Anaximander, Heraklit,",
    "Parmenides, Empedokles, Anaxagoras, Leukippos, Demokrit—",
    "og tusinder af andre, ikke hundreder, tusinder af andre af lige høj rang."
  ];

  // Calculate word counts for each line on mount
  useEffect(() => {
    const counts = englishLines.map(line => {
      return line.trim().split(/\s+/).length;
    });
    setLineWordCounts(counts);
  }, []);

  const getLineDuration = (lineIndex: number) => {
    if (lineIndex < 0 || lineIndex >= lineWordCounts.length) return 1200;
    const wordCount = lineWordCounts[lineIndex];
    return Math.max(wordCount * 500, 1000);
  };

  const formatLineNumber = (index: number) => {
    return (index + 1).toString().padStart(4, '0');
  };

  const handleManualLineSelect = (index: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    setIsPlaying(false);
    setIsPaused(false);
    setNavigationMode('manual');
    setActiveLine(index);
  };

  const startAnimation = () => {
    if (isPlaying && !isPaused) {
      resetAnimation();
      setTimeout(() => {
        setIsPlaying(true);
        setNavigationMode('auto');
        animateLine(0);
      }, 100);
      return;
    }
    
    if (isPaused) {
      setIsPaused(false);
      setNavigationMode('auto');
      animateLine(activeLine);
      return;
    }
    
    setIsPlaying(true);
    setIsPaused(false);
    setNavigationMode('auto');
    setActiveLine(-1);
    
    setTimeout(() => {
      animateLine(0);
    }, 100);
  };

  const animateLine = (index: number) => {
    if (index >= englishLines.length) {
      setIsPlaying(false);
      return;
    }

    setActiveLine(index);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const duration = getLineDuration(index);
    
    timerRef.current = setTimeout(() => {
      if (!isPaused) {
        animateLine(index + 1);
      }
    }, duration);
  };

  const pauseResume = () => {
    if (!isPlaying) return;
    
    setIsPaused(!isPaused);
    
    if (isPaused) {
      animateLine(activeLine);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  };

  const resetAnimation = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActiveLine(-1);
    setNavigationMode('auto');
  };

  const switchToManualMode = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setNavigationMode('manual');
    setActiveLine(-1);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black pt-24 pb-8 px-4 md:px-8">
      {/* Fixed Top Control Bar */}
      <div className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: Title and Mode */}
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-white whitespace-nowrap">
                Text Swell Reader
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setNavigationMode('auto')}
                  className={`px-3 py-1.5 text-sm rounded transition whitespace-nowrap ${
                    navigationMode === 'auto' 
                      ? 'bg-yellow-900/50 border border-yellow-600 text-yellow-300' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Auto
                </button>
                <button
                  onClick={switchToManualMode}
                  className={`px-3 py-1.5 text-sm rounded transition whitespace-nowrap ${
                    navigationMode === 'manual' 
                      ? 'bg-blue-900/50 border border-blue-600 text-blue-300' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {/* Center: Language Toggles */}
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm whitespace-nowrap">Languages:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEnglish(!showEnglish)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-sm transition ${showEnglish ? 'bg-gray-800 border border-yellow-600' : 'bg-gray-900/50 border border-gray-700'}`}
                >
                  <div className="relative w-4 h-3">
                    {/* UK flag */}
                    <div className="absolute inset-0 bg-blue-600"></div>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 0%, transparent 40%, white 40%, white 60%, transparent 60%, transparent 100%)' }}></div>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, transparent 0%, transparent 40%, white 40%, white 60%, transparent 60%, transparent 100%)' }}></div>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 0%, transparent 38%, red 38%, red 42%, transparent 42%, transparent 58%, red 58%, red 62%, transparent 62%, transparent 100%)' }}></div>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, transparent 0%, transparent 38%, red 38%, red 42%, transparent 42%, transparent 58%, red 58%, red 62%, transparent 62%, transparent 100%)' }}></div>
                  </div>
                  <span className={`${showEnglish ? 'text-yellow-400' : 'text-gray-500'}`}>
                    EN
                  </span>
                </button>

                <button
                  onClick={() => setShowGreek(!showGreek)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-sm transition ${showGreek ? 'bg-gray-800 border border-orange-600' : 'bg-gray-900/50 border border-gray-700'}`}
                >
                  <div className="relative w-4 h-3">
                    {/* Greek flag */}
                    <div className="absolute inset-0 bg-white"></div>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 0%, transparent 44%, blue 44%, blue 56%, transparent 56%, transparent 100%)' }}></div>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, transparent 0%, transparent 40%, blue 40%, blue 60%, transparent 60%, transparent 100%)' }}></div>
                    <div className="absolute inset-0 w-1 h-full bg-blue-600 left-2"></div>
                    <div className="absolute inset-0 h-1 w-full bg-blue-600 top-1"></div>
                  </div>
                  <span className={`${showGreek ? 'text-orange-400' : 'text-gray-500'}`}>
                    GR
                  </span>
                </button>

                <button
                  onClick={() => setShowDanish(!showDanish)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-sm transition ${showDanish ? 'bg-gray-800 border border-lime-600' : 'bg-gray-900/50 border border-gray-700'}`}
                >
                  <div className="relative w-4 h-3">
                    {/* Danish flag */}
                    <div className="absolute inset-0 bg-red-600"></div>
                    <div className="absolute inset-0 w-1 h-full bg-white left-2"></div>
                    <div className="absolute inset-0 h-1 w-full bg-white top-1"></div>
                  </div>
                  <span className={`${showDanish ? 'text-lime-400' : 'text-gray-500'}`}>
                    DA
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
              {navigationMode === 'auto' ? (
                <>
                  <button
                    onClick={startAnimation}
                    className="bg-yellow-900/80 text-yellow-200 px-3 py-1.5 rounded text-sm hover:bg-yellow-800 transition whitespace-nowrap"
                  >
                    {isPlaying && !isPaused ? '🔄 Restart' : '▶ Start Auto'}
                  </button>
                  
                  {isPlaying && (
                    <button
                      onClick={pauseResume}
                      className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 transition whitespace-nowrap"
                    >
                      {isPaused ? '▶ Resume' : '⏸ Pause'}
                    </button>
                  )}
                  
                  <button
                    onClick={resetAnimation}
                    className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 transition whitespace-nowrap"
                  >
                    ↺ Reset
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={startAnimation}
                    className="bg-yellow-900/80 text-yellow-200 px-3 py-1.5 rounded text-sm hover:bg-yellow-800 transition whitespace-nowrap"
                  >
                    ▶ Switch to Auto
                  </button>
                  
                  <button
                    onClick={resetAnimation}
                    className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 transition whitespace-nowrap"
                  >
                    ↺ Reset
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar (only in auto mode) */}
          {navigationMode === 'auto' && isPlaying && (
            <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400 transition-all duration-300 rounded-full"
                style={{ 
                  width: activeLine >= 0 
                    ? `${((activeLine + 1) / englishLines.length) * 100}%` 
                    : '0%' 
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        {/* Text Display */}
        <div className="space-y-8 text-white">
          {englishLines.map((_, index) => (
            <div key={index} className="space-y-3">
              {/* Line Number */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleManualLineSelect(index)}
                  className={`flex-shrink-0 font-mono text-lg transition-all duration-300 ${
                    activeLine === index 
                      ? 'text-yellow-300 font-bold scale-110' 
                      : 'text-white hover:text-yellow-200 hover:scale-105'
                  }`}
                  style={{
                    minWidth: '60px',
                    textAlign: 'right'
                  }}
                >
                  {formatLineNumber(index)}
                </button>
                
                {/* Word count indicator (only in auto mode when active) */}
                {navigationMode === 'auto' && lineWordCounts[index] > 0 && isPlaying && activeLine === index && (
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                    {lineWordCounts[index]} words · {getLineDuration(index)}ms
                  </span>
                )}
              </div>

              {/* English Line */}
              {showEnglish && (
                <div className={`ml-16 transition-all duration-500 ease-in-out ${
                  activeLine === index 
                    ? 'text-yellow-400 text-2xl md:text-3xl font-bold transform scale-105' 
                    : 'text-gray-300 text-lg md:text-xl'
                }`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-1">
                      <Image 
                        src="/ukk.png" 
                        alt="UK flag" 
                        width={20} 
                        height={12}
                        className="object-contain"
                      />
                    </div>
                    <span className="flex-grow" style={{
                      lineHeight: '1.6',
                      fontFamily: 'Georgia, serif',
                    }}>
                      {englishLines[index]}
                    </span>
                  </div>
                </div>
              )}

              {/* Greek Line */}
              {showGreek && (
                <div className={`ml-16 transition-all duration-500 ease-in-out ${
                  activeLine === index 
                    ? 'text-orange-400 text-xl md:text-2xl transform scale-105' 
                    : 'text-gray-400 text-md md:text-lg'
                }`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-1">
                      <Image 
                        src="/hlt.png" 
                        alt="Greek flag" 
                        width={20} 
                        height={12}
                        className="object-contain"
                      />
                    </div>
                    <span className="flex-grow" style={{
                      lineHeight: '1.6',
                      fontFamily: 'Georgia, serif',
                    }}>
                      {greekLines[index]}
                    </span>
                  </div>
                </div>
              )}

              {/* Danish Line */}
              {showDanish && (
                <div className={`ml-16 transition-all duration-500 ease-in-out ${
                  activeLine === index 
                    ? 'text-lime-400 text-xl md:text-2xl transform scale-105' 
                    : 'text-gray-400 text-md md:text-lg'
                }`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-1">
                      <Image 
                        src="/dk.svg" 
                        alt="Danish flag" 
                        width={20} 
                        height={12}
                        className="object-contain"
                      />
                    </div>
                    <span className="flex-grow" style={{
                      lineHeight: '1.6',
                      fontFamily: 'Georgia, serif',
                    }}>
                      {danishLines[index]}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mode Instructions */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Auto Mode Instructions */}
            <div className={`p-4 rounded-lg ${navigationMode === 'auto' ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-gray-900/30'}`}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${navigationMode === 'auto' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-600'}`}></span>
                Automatic Mode
              </h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Lines swell sequentially with word-based timing</li>
                <li>• Each line: 500ms × word count (min. 1000ms)</li>
                <li>• You can still click numbers to jump to specific lines</li>
              </ul>
            </div>

            {/* Manual Mode Instructions */}
            <div className={`p-4 rounded-lg ${navigationMode === 'manual' ? 'bg-blue-900/20 border border-blue-700' : 'bg-gray-900/30'}`}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${navigationMode === 'manual' ? 'bg-blue-500' : 'bg-gray-600'}`}></span>
                Manual Navigation
              </h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Click any line number (0001, 0002, etc.) to select it</li>
                <li>• Selected line swells immediately</li>
                <li>• Click another number to jump to that line</li>
                <li>• Line stays swollen until you click another</li>
              </ul>
            </div>
          </div>

          {/* Language Key */}
          <div className="mt-8 p-4 bg-gray-900/30 rounded-lg">
            <h4 className="text-white font-medium mb-3">Language Key</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-2">
                {/* UK Flag */}
<Image 
  src="/ukk.png" 
  alt="UK flag" 
  width={46}
  height={46}
  className="object-contain"
/>
                <div>
                  <div className="text-yellow-400 font-medium">English</div>
                  <div className="text-gray-400 text-sm">Primary text, yellow when active</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2">
                {/* Greek Flag */}
<Image 
  src="/hlt.png" 
  alt="Greek flag" 
  width={46}
  height={46}
  className="object-contain"
/>
                <div>
                  <div className="text-orange-400 font-medium">Greek</div>
                  <div className="text-gray-400 text-sm">Translation, orange when active</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2">
                {/* Danish Flag */}
<Image 
  src="/dk.svg" 
  alt="Danish flag" 
  width={46}
  height={46}
  className="object-contain"
/>
                
                <div>
                  <div className="text-lime-400 font-medium">Danish</div>
                  <div className="text-gray-400 text-sm">Translation, lime when active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}