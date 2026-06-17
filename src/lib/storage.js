// localStorage 持久化封装

const MAX_HISTORY = 1000;

function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    if (e.name === 'QuotaExceededError' && key === 'gacha_history') {
      const trimmed = value.slice(-500);
      localStorage.setItem(key, JSON.stringify(trimmed));
    }
  }
}

export function loadState()     { return load('gacha_state', createDefaultState()); }
export function saveState(s)    { save('gacha_state', s); }
export function loadHistory()   { return load('gacha_history', []); }
export function saveHistory(h)  { save('gacha_history', h.length > MAX_HISTORY ? h.slice(-MAX_HISTORY) : h); }
export function loadSettings()  { return load('gacha_settings', null); }
export function saveSettings(s) { save('gacha_settings', s); }
export function loadCachedBanners() { return load('gacha_banners', null); }
export function saveCachedBanners(d) { save('gacha_banners', d); }

export function resetAll() {
  ['gacha_state','gacha_history','gacha_settings','gacha_banners'].forEach(k => localStorage.removeItem(k));
}

function createDefaultState() {
  const pool = () => ({
    pity5:0, pity4:0, goldRecords:[], purpleRecords:[],
    failedFeatured5:0, successfulFeatured5:0,
    pullsSinceLast5:0, isGuaranteed:false, totalPulls:0, fourStarGuaranteed:false,
  });
  return { currentBanner:null, character:pool(), weapon:pool(), standard:pool() };
}
