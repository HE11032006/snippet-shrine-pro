import { useCallback } from 'react';

export function useSynestheticFeedback() {
  const triggerFeedback = useCallback((code: string) => {
    if (!code) return;

    try {
      const saved = localStorage.getItem('shrine-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.soundEnabled === false) return;
      }
    } catch(e) {}

    // Calcul de la "lourdeur" du code (analyse simplifiée)
    const loops = (code.match(/for |while |\.map\(|\.reduce\(|\.filter\(/g) || []).length;
    const branches = (code.match(/if |else|switch|case|\?\?|\|\|/g) || []).length;
    const lines = code.split('\n').length;
    
    // Complexité arbitraire calculée
    const complexityScore = (loops * 3) + (branches * 1.5) + (lines * 0.1);
    
    const isHeavy = complexityScore > 15;
    const isVeryHeavy = complexityScore > 30;

    // --- SOUND FEEDBACK ---
    try {
      // AudioContext requires user interaction first, but usually copying or editing is an interaction
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (isHeavy) {
        // Son lourd et grave (type O(N^2) ou lourd)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(isVeryHeavy ? 80 : 150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else {
        // Son léger et cristallin (type pure function, O(1))
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800 + (Math.random() * 400), ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      console.warn("AudioContext non initialisé (interaction requise)");
    }

    // --- HAPTIC / VISUAL SHAKE FEEDBACK ---
    if (isHeavy) {
      // On secoue l'interface (très court pour ne pas gener la lecture prolongée)
      document.body.classList.add('synesthetic-shake');
      
      // Si c'est très lourd, on ajoute un flou rougeoyant
      if (isVeryHeavy) {
         document.body.style.filter = "saturate(1.2) sepia(0.2) hue-rotate(-10deg)";
      }
      
      setTimeout(() => {
        document.body.classList.remove('synesthetic-shake');
        document.body.style.filter = "none";
      }, isVeryHeavy ? 400 : 200);
      
      // Essayer Haptic API si sur mobile/compatible
      if (navigator.vibrate) {
        navigator.vibrate(isVeryHeavy ? [50, 50, 50] : 50);
      }
    }

  }, []);

  return { triggerFeedback };
}
