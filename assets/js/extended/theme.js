/* ============================================
   Phase 2: 主题切换增强（支持跟随系统）
   ============================================ */

(function() {
  // 主题管理
  const themeManager = {
    // 获取当前主题
    get: function() {
      return localStorage.getItem('theme') || 'auto';
    },
    
    // 设置主题
    set: function(theme) {
      localStorage.setItem('theme', theme);
      this.apply(theme);
    },
    
    // 应用主题
    apply: function(theme) {
      const html = document.documentElement;
      
      if (theme === 'dark') {
        html.classList.add('dark');
        html.classList.remove('light');
      } else if (theme === 'light') {
        html.classList.remove('dark');
        html.classList.add('light');
      } else {
        // auto: 跟随系统
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          html.classList.add('dark');
          html.classList.remove('light');
        } else {
          html.classList.remove('dark');
          html.classList.add('light');
        }
      }
      
      // 触发事件
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    },
    
    // 切换主题
    toggle: function() {
      const current = this.get();
      const themes = ['light', 'dark', 'auto'];
      const currentIndex = themes.indexOf(current);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      this.set(nextTheme);
      return nextTheme;
    }
  };

  // 暴露全局
  window.themeManager = themeManager;
  window.toggleTheme = () => themeManager.toggle();

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (themeManager.get() === 'auto') {
      themeManager.apply('auto');
    }
  });

  // 初始化
  document.addEventListener('DOMContentLoaded', () => {
    themeManager.apply(themeManager.get());
  });
})();