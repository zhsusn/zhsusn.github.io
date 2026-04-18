/* ============================================
   Phase 4: 本地阅读统计仪表盘
   不依赖第三方服务，纯本地存储
   ============================================ */

(function() {
  'use strict';

  const STORAGE_KEY = 'reading-analytics';

  // 初始化数据结构
  function getAnalytics() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {
      firstVisit: new Date().toISOString(),
      totalArticles: 0,
      totalReadingTime: 0,  // 分钟
      seriesProgress: {},   // 各系列阅读进度
      lastRead: null,
      dailyStats: {},       // 按天统计
      bookmarks: [],        // 书签列表
      liked: []             // 收藏列表
    };
  }

  function saveAnalytics(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // 记录文章阅读
  window.trackReading = function(articleId, title, series, chapter, readingTime) {
    const data = getAnalytics();
    const today = new Date().toISOString().split('T')[0];
    
    // 总统计
    data.totalArticles += 1;
    data.totalReadingTime += readingTime || 0;
    data.lastRead = {
      id: articleId,
      title: title,
      time: new Date().toISOString()
    };
    
    // 日统计
    if (!data.dailyStats[today]) {
      data.dailyStats[today] = { count: 0, minutes: 0 };
    }
    data.dailyStats[today].count += 1;
    data.dailyStats[today].minutes += readingTime || 0;
    
    // 系列进度
    if (series) {
      if (!data.seriesProgress[series]) {
        data.seriesProgress[series] = {
          readChapters: [],
          totalTime: 0,
          lastRead: null
        };
      }
      if (!data.seriesProgress[series].readChapters.includes(chapter)) {
        data.seriesProgress[series].readChapters.push(chapter);
      }
      data.seriesProgress[series].totalTime += readingTime || 0;
      data.seriesProgress[series].lastRead = new Date().toISOString();
    }
    
    saveAnalytics(data);
    window.dispatchEvent(new CustomEvent('analytics-update', { detail: data }));
  };

  // 获取阅读报告
  window.getReadingReport = function() {
    const data = getAnalytics();
    const series = Object.keys(data.seriesProgress).map(key => {
      const s = data.seriesProgress[key];
      // 获取系列总章节数（从 DOM 或配置）
      const totalEl = document.querySelector(`[data-series="${key}"]`);
      const total = totalEl ? parseInt(totalEl.dataset.total) : 12;
      
      return {
        name: key,
        completed: s.readChapters.length,
        total: total,
        percent: Math.round((s.readChapters.length / total) * 100),
        lastRead: s.lastRead
      };
    });
    
    // 计算连续阅读天数
    const dates = Object.keys(data.dailyStats).sort();
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = dates.length - 1; i >= 0; i--) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (dates[i] === dateStr) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return {
      ...data,
      series,
      streak,
      readingLevel: data.totalReadingTime > 1000 ? '资深读者' : 
                    data.totalReadingTime > 500 ? '进阶读者' : 
                    data.totalReadingTime > 100 ? '活跃读者' : '新手读者'
    };
  };

  // 自动追踪当前页面
  document.addEventListener('DOMContentLoaded', () => {
    const article = document.querySelector('article');
    if (!article) return;
    
    const series = document.body.dataset.series || '';
    const chapter = parseInt(document.body.dataset.chapter) || 0;
    const title = document.querySelector('h1')?.textContent || '';
    const id = location.pathname;
    
    let startTime = Date.now();
    let tracked = false;
    
    // 页面可见性变化时计算阅读时间
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !tracked) {
        const minutes = Math.round((Date.now() - startTime) / 60000);
        if (minutes >= 1) {  // 至少阅读1分钟才记录
          trackReading(id, title, series, chapter, minutes);
          tracked = true;
        }
      }
    });
    
    // 页面卸载时记录
    window.addEventListener('beforeunload', () => {
      if (!tracked) {
        const minutes = Math.round((Date.now() - startTime) / 60000);
        if (minutes >= 1) {
          trackReading(id, title, series, chapter, minutes);
        }
      }
    });
  });

})();