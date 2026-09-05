/**
 * Web Audio API Notification Synthesizer
 * Plays an elegant, modern two-tone chime without external audio files.
 */
export function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // First tone (E5: ~659 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);

    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Second tone (A5: 880 Hz - brighter, resolving)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);

    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
    gain2.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (err) {
    // Audio might fail if user hasn't interacted with document yet
    console.debug('[Audio] Notification chime skipped:', err.message);
  }
}

/**
 * Request HTML5 Desktop Notification permission
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

/**
 * Trigger HTML5 Desktop Notification
 */
export function showDesktopNotification(title, body, onClick) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon: '/emblem.svg',
        badge: '/emblem.svg',
        silent: true // Audio is handled by playNotificationChime
      });
      if (onClick) {
        n.onclick = () => {
          window.focus();
          onClick();
          n.close();
        };
      }
    } catch (e) {
      console.debug('[Notification] Desktop notification error:', e.message);
    }
  }
}
