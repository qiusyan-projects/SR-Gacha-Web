import { useState, useRef, useCallback } from 'react';
import { GachaEngine } from '@/lib/gacha-engine';
import bannersData from '@/data/banners.json';

let engineInstance = null;
function getEngine() {
  if (!engineInstance) engineInstance = new GachaEngine(bannersData);
  return engineInstance;
}

export function useGacha() {
  const [, forceUpdate] = useState(0);
  const engine = useRef(getEngine()).current;

  const [currentTab, setCurrentTab] = useState(() => {
    const info = engine.getCurrentBannerInfo();
    return info ? (info.pool_type === 'weapon' ? 'weapon' : 'character') : 'character';
  });

  const [poolType, setPoolType] = useState(() => {
    const info = engine.getCurrentBannerInfo();
    return info ? info.pool_type || 'standard' : 'standard';
  });

  const [pulling, setPulling] = useState(false);
  const [fiveStarQueue, setFiveStarQueue] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [customPoolOpen, setCustomPoolOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const selectBanner = useCallback((id) => {
    if (engine.switchBanner(id)) {
      const info = engine.pools.banners[id];
      setPoolType(info ? info.pool_type || 'standard' : 'standard');
      refresh();
    }
  }, [engine, refresh]);

  const selectStandard = useCallback(() => {
    const stdId = engine.getStandardBanner();
    if (stdId) selectBanner(stdId);
  }, [engine, selectBanner]);

  const doPull = useCallback((count) => {
    if (pulling) return;
    if (!engine.currentBanner) {
      showToast('请先选择一个卡池');
      return;
    }
    setPulling(true);
    setTimeout(() => {
      const result = engine.pull(count);
      if (result && result.fiveStarPops.length > 0) {
        setFiveStarQueue(result.fiveStarPops);
      }
      refresh();
      setPulling(false);
    }, 50);
  }, [engine, pulling, refresh, showToast]);

  const currentFiveStar = fiveStarQueue.length > 0 ? fiveStarQueue[0] : null;

  const dismissFiveStar = useCallback(() => {
    setFiveStarQueue(prev => prev.slice(1));
  }, []);

  const currentPity = (() => {
    const info = engine.getCurrentBannerInfo();
    if (!info) return 90;
    const pt = info.pool_type || 'standard';
    if (pt === 'character') return engine.getProb('character_five_star_pity');
    if (pt === 'weapon') return engine.getProb('weapon_five_star_pity');
    return engine.getProb('standard_five_star_pity');
  })();

  return {
    engine, currentTab, setCurrentTab, poolType,
    pulling, currentFiveStar, fiveStarRemaining: fiveStarQueue.length - 1, dismissFiveStar, toast, showToast,
    selectBanner, selectStandard, doPull, currentPity,
    settingsOpen, setSettingsOpen, versionOpen, setVersionOpen,
    customPoolOpen, setCustomPoolOpen,
    confirmAction, setConfirmAction, refresh,
    mobileMenuOpen, setMobileMenuOpen,
  };
}
