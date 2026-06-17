// SR-Gacha Web — 抽卡核心引擎 (React 适配版)

import { CHAR_DISP, WEAPON_DISP, DEFAULT_PROBABILITIES, LUCK_THRESHOLDS, LUCK_WORST } from './constants';
import { loadState, saveState, loadHistory, saveHistory, loadSettings, saveSettings } from './storage';

function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function createPoolState() {
  return {
    pity5:0, pity4:0, goldRecords:[], purpleRecords:[],
    failedFeatured5:0, successfulFeatured5:0,
    pullsSinceLast5:0, isGuaranteed:false, totalPulls:0, fourStarGuaranteed:false,
  };
}

export class GachaEngine {
  constructor(bannersData) {
    this.pools = bannersData;
    this.banners = Object.keys(bannersData.banners);
    const saved = loadSettings();
    this.currentProb = saved ? { ...DEFAULT_PROBABILITIES, ...saved } : { ...DEFAULT_PROBABILITIES };
    this._initState();
    this.pullHistory = loadHistory();
  }

  _initState() {
    const saved = loadState();
    if (saved?.currentBanner !== undefined) {
      this.currentBanner = saved.currentBanner;
      this.character = { ...createPoolState(), ...saved.character };
      this.weapon    = { ...createPoolState(), ...saved.weapon };
      this.standard  = { ...createPoolState(), ...saved.standard };
    } else {
      this.currentBanner = null;
      this.character = createPoolState();
      this.weapon    = createPoolState();
      this.standard  = createPoolState();
    }
  }

  // ── 卡池 ──
  categorizeBanners() {
    const charB = [], weapB = [];
    const stdId = this.getStandardBanner();
    for (const [id, info] of Object.entries(this.pools.banners)) {
      if (id !== stdId) {
        if (info.pool_type === 'character') charB.push({ id, name: info.name || id });
        else if (info.pool_type === 'weapon') weapB.push({ id, name: info.name || id });
      }
    }
    return { character: charB, weapon: weapB };
  }
  getStandardBanner() {
    for (const [id, info] of Object.entries(this.pools.banners)) {
      if (info.name === '群星跃迁') return id;
    }
    return null;
  }
  switchBanner(id) {
    if (!this.banners.includes(id)) return false;
    this.currentBanner = id;
    this._persist();
    return true;
  }
  getCurrentBannerInfo() {
    return this.currentBanner ? (this.pools.banners[this.currentBanner] || null) : null;
  }

  // ── 概率 ──
  getProb(k)          { return this.currentProb[k]; }
  getAllProb()        { return { ...this.currentProb }; }
  updateProb(k, v)    { this.currentProb[k] = v; this._persistSettings(); }
  updateProbBatch(up) { Object.assign(this.currentProb, up); this._persistSettings(); }
  resetProb()         { this.currentProb = { ...DEFAULT_PROBABILITIES }; this._persistSettings(); }

  // ── 抽卡 ──
  pull(count) {
    if (!this.currentBanner) return null;
    const banner = this.pools.banners[this.currentBanner];
    const poolType = banner.pool_type || 'standard';
    const prob = this._getProbParams(poolType);
    const pulls = [];
    const fiveStarPops = [];

    for (let i = 0; i < count; i++) {
      const stats = this._getPoolStatsRef(poolType);
      stats.totalPulls++;

      const softPityStart = Math.floor(prob.pity * 74 / 90);
      let result;

      if (stats.pity5 >= prob.pity - 1 ||
          (stats.pity5 < softPityStart && Math.random() < prob.base5) ||
          (stats.pity5 >= softPityStart && Math.random() < prob.base5 + stats.pity5 * prob.base5)) {
        result = this._pull5Star(poolType);
        stats.goldRecords.push(stats.pity5 + 1);
        const pullsForThis = stats.pullsSinceLast5 + 1;
        fiveStarPops.push({ ...result, pullsCount: pullsForThis, poolType, wasGuaranteed: stats.isGuaranteed, bigPityEnabled: prob.bigPity5 });
        if (poolType !== 'standard') {
          if (result.isUp && !stats.isGuaranteed) stats.successfulFeatured5++;
          if (!result.isUp) stats.failedFeatured5++;
        }
        Object.assign(stats, { pity5:0, pity4:0, pullsSinceLast5:0, isGuaranteed: prob.bigPity5 ? !result.isUp : false });
      } else if (stats.pity4 >= prob.pity4 - 1 || Math.random() < prob.base4) {
        result = this._pull4Star(poolType);
        stats.purpleRecords.push(stats.pity4 + 1);
        Object.assign(stats, { pity5: stats.pity5+1, pity4:0, fourStarGuaranteed: prob.bigPity4 ? !result.isUp : false, pullsSinceLast5: stats.pullsSinceLast5+1 });
      } else {
        result = this._pull3Star();
        Object.assign(stats, { pity5: stats.pity5+1, pity4: stats.pity4+1, pullsSinceLast5: stats.pullsSinceLast5+1 });
      }

      pulls.push({ rarity: result.rarity, itemType: result.type, item: result.item, isUp: result.isUp });
      this.pullHistory.push({
        time: new Date().toISOString(),
        rarity: result.rarity, itemType: result.type, item: result.item,
        banner: banner.name || this.currentBanner, isUp: result.isUp, poolType,
      });
    }

    if (this.pullHistory.length > 1000) this.pullHistory = this.pullHistory.slice(-1000);
    this._persist();
    return { pulls, fiveStarPops };
  }

  _getProbParams(pt) {
    const p = this.currentProb;
    if (pt === 'weapon') return { pity: p.weapon_five_star_pity, base5: p.weapon_five_star_base, base4: p.weapon_four_star_base, pity4: p.weapon_four_star_pity, bigPity5: p.weapon_five_star_big_pity_enabled, bigPity4: p.weapon_four_star_big_pity_enabled };
    if (pt === 'character') return { pity: p.character_five_star_pity, base5: p.character_five_star_base, base4: p.character_four_star_base, pity4: p.character_four_star_pity, bigPity5: p.character_five_star_big_pity_enabled, bigPity4: p.character_four_star_big_pity_enabled };
    return { pity: p.standard_five_star_pity, base5: p.standard_five_star_base, base4: p.standard_four_star_base, pity4: p.standard_four_star_pity, bigPity5: false, bigPity4: false };
  }

  _getPoolStatsRef(pt) { return pt === 'character' ? this.character : pt === 'weapon' ? this.weapon : this.standard; }

  _pull5Star(pt) {
    const p = this.currentProb;
    let sp, sm, bp;
    if (pt === 'weapon')    { sp = p.weapon_five_star_success_prob; sm = p.weapon_five_star_small_pity_mechanism; bp = p.weapon_five_star_big_pity_enabled; }
    else if (pt === 'character') { sp = p.character_five_star_success_prob; sm = p.character_five_star_small_pity_mechanism; bp = p.character_five_star_big_pity_enabled; }
    else                    { sp = 0; sm = 'random'; bp = false; }

    const stats = this._getPoolStatsRef(pt);
    const isUp = stats.isGuaranteed || (sm === 'random' && Math.random() < sp) || sm === 'must_not_waste';

    if (pt === 'character') {
      return isUp
        ? { rarity:'5_star', type:CHAR_DISP, item:randChoice(this.pools.banners[this.currentBanner].character_up_5_star), isUp:true }
        : { rarity:'5_star', type:CHAR_DISP, item:randChoice(this.pools.common_pools.character_5_star), isUp:false };
    } else if (pt === 'weapon') {
      return isUp
        ? { rarity:'5_star', type:WEAPON_DISP, item:randChoice(this.pools.banners[this.currentBanner].weapon_up_5_star), isUp:true }
        : { rarity:'5_star', type:WEAPON_DISP, item:randChoice(this.pools.common_pools.weapon_5_star), isUp:false };
    } else {
      if (Math.random() < 0.5) return { rarity:'5_star', type:CHAR_DISP, item:randChoice(this.pools.common_pools.character_5_star), isUp:false };
      return { rarity:'5_star', type:WEAPON_DISP, item:randChoice(this.pools.common_pools.weapon_5_star), isUp:false };
    }
  }

  _pull4Star(pt) {
    const p = this.currentProb;
    let sp, sm, bp;
    if (pt === 'weapon')    { sp = p.weapon_four_star_success_prob; sm = p.weapon_four_star_small_pity_mechanism; bp = p.weapon_four_star_big_pity_enabled; }
    else if (pt === 'character') { sp = p.character_four_star_success_prob; sm = p.character_four_star_small_pity_mechanism; bp = p.character_four_star_big_pity_enabled; }
    else                    { sp = 0; sm = 'random'; bp = true; }

    const stats = this._getPoolStatsRef(pt);
    const isUp = stats.fourStarGuaranteed || (sm === 'random' && Math.random() < sp) || sm === 'must_not_waste';

    if (isUp && pt !== 'standard') {
      const upKey = pt === 'character' ? 'character_up_4_star' : 'weapon_up_4_star';
      const items = this.pools.banners[this.currentBanner][upKey] || [];
      return pt === 'character'
        ? { rarity:'4_star', type:CHAR_DISP, item:randChoice(items), isUp:true }
        : { rarity:'4_star', type:WEAPON_DISP, item:randChoice(items), isUp:true };
    } else {
      const charPool = this.pools.common_pools.character_4_star;
      const weapPool = this.pools.common_pools.weapon_4_star;
      const pool = Math.random() < 0.5 ? charPool : weapPool;
      const upKey = pt === 'character' ? 'character_up_4_star' : 'weapon_up_4_star';
      const upItems = this.pools.banners[this.currentBanner][upKey] || [];
      const nonUp = pool.filter(item => !upItems.includes(item));
      const item = randChoice(nonUp.length > 0 ? nonUp : pool);
      return { rarity:'4_star', type: charPool.includes(item) ? CHAR_DISP : WEAPON_DISP, item, isUp:false };
    }
  }

  _pull3Star() {
    return { rarity:'3_star', type:WEAPON_DISP, item:randChoice(this.pools.common_pools.weapon_3_star), isUp:false };
  }

  // ── 统计 ──
  getPoolStats(pt) {
    const s = this._getPoolStatsRef(pt);
    const prob = this._getProbParams(pt);
    const gr = [...s.goldRecords];
    const tf = s.successfulFeatured5 + s.failedFeatured5;
    const p = this.currentProb;
    return {
      poolType: pt,
      statsType: pt==='character'?`${CHAR_DISP}池`:pt==='weapon'?`${WEAPON_DISP}池`:'常驻池',
      totalPulls: s.totalPulls,
      pity5: s.pity5, pity4: s.pity4,
      pity5Remaining: prob.pity - s.pity5, pity4Remaining: prob.pity4 - s.pity4,
      goldCount: gr.length, purpleCount: s.purpleRecords.length,
      goldRecords: gr,
      minGold: gr.length ? Math.min(...gr) : null,
      maxGold: gr.length ? Math.max(...gr) : null,
      avgGold: gr.length ? gr.reduce((a,b)=>a+b)/gr.length : null,
      failedFeatured5: s.failedFeatured5, successfulFeatured5: s.successfulFeatured5,
      winRate: tf? s.successfulFeatured5/tf*100 : null,
      pullsSinceLast5: s.pullsSinceLast5,
      isGuaranteed: s.isGuaranteed, fourStarGuaranteed: s.fourStarGuaranteed,
      bigPity5: prob.bigPity5, bigPity4: prob.bigPity4,
      smallPity5: pt==='character'?p.character_five_star_small_pity_mechanism:pt==='weapon'?p.weapon_five_star_small_pity_mechanism:'random',
      smallPity4: pt==='character'?p.character_four_star_small_pity_mechanism:pt==='weapon'?p.weapon_four_star_small_pity_mechanism:'random',
      luck: this.calculateLuck(pt),
    };
  }

  calculateLuck(pt) {
    const s = this._getPoolStatsRef(pt);
    const prob = this._getProbParams(pt);
    if (!s.goldRecords.length) return '暂无数据';
    const minP = Math.min(...s.goldRecords), maxP = Math.max(...s.goldRecords);
    const avgP = s.goldRecords.reduce((a,b)=>a+b)/s.goldRecords.length;
    let score = 0;

    const minT = [[Math.floor(prob.pity*15/90),5],[Math.floor(prob.pity*25/90),4],[Math.floor(prob.pity*35/90),3],[Math.floor(prob.pity*45/90),2]];
    let ms=false; for(const [t,s] of minT){if(minP<=t){score+=s;ms=true;break;}} if(!ms)score+=1;

    const maxT = [[Math.floor(prob.pity*55/90),3],[Math.floor(prob.pity*65/90),2],[Math.floor(prob.pity*80/90),1]];
    for(const [t,s] of maxT){if(maxP<=t){score+=s;break;}}

    const avgT = [[Math.floor(prob.pity*30/90),5],[Math.floor(prob.pity*40/90),4],[Math.floor(prob.pity*50/90),3],[Math.floor(prob.pity*60/90),2],[Math.floor(prob.pity*70/90),1]];
    for(const [t,s] of avgT){if(avgP<=t){score+=s;break;}}

    if(pt!=='standard'){const tf=s.successfulFeatured5+s.failedFeatured5; if(tf>0){const fr=s.failedFeatured5/tf;const ft=[[0,5],[.1,4],[.25,3],[.4,2],[.75,1]]; for(const [t,s] of ft){if(fr<=t){score+=s;break;}}}}

    for(const [t,l] of LUCK_THRESHOLDS){if(score>=t)return l;}
    return LUCK_WORST;
  }

  getHistory(limit=100,offset=0) {
    const total = this.pullHistory.length;
    const items = this.pullHistory.slice(Math.max(0,total-offset-limit), total-offset).reverse();
    return { items, total };
  }

  clearHistory() { this.pullHistory=[]; this._persist(); }

  resetAll() {
    this.character=createPoolState(); this.weapon=createPoolState(); this.standard=createPoolState();
    this.pullHistory=[]; this.currentBanner=null; this.currentProb={...DEFAULT_PROBABILITIES};
    this._persist(); this._persistSettings();
  }

  _persist() {
    saveState({ currentBanner:this.currentBanner, character:this.character, weapon:this.weapon, standard:this.standard });
    saveHistory(this.pullHistory);
  }

  _persistSettings() { saveSettings(this.currentProb); }
}
