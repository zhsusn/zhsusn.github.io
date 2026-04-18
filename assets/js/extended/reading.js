/* ============================================
   Phase 2: 阅读交互系统
   ============================================ */

(function() {
  'use strict';

  // 阅读进度条
  function updateReadingProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    const progressBar = document.getElementById('reading-progress');
    if (progressBar) {
      progressBar.style.width = scrolled + '%';
    }
    
    // 保存阅读位置（用于下次访问恢复）
    const articlePath = location.pathname;
    if (articlePath.includes('/posts/') || articlePath.includes('/series/') || articlePath.includes('/standalone/')) {
      localStorage.setItem(`reading-position-${articlePath}`, winScroll);
    }
  }

  // 恢复阅读位置
  function restoreReadingPosition() {
    const articlePath = location.pathname;
    const savedPosition = localStorage.getItem(`reading-position-${articlePath}`);
    if (savedPosition && savedPosition !== '0') {
      // 延迟恢复，确保页面渲染完成
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedPosition),
          behavior: 'smooth'
        });
        
        // 显示恢复提示
        showToast('已恢复到上次阅读位置');
      }, 500);
    }
  }

  // 专注模式切换
  window.toggleFocusMode = function() {
    const body = document.body;
    const isFocus = body.classList.toggle('focus-mode');
    const overlay = document.getElementById('focus-overlay');
    const button = document.getElementById('focus-mode-btn');
    
    if (isFocus) {
      // 开启专注模式
      overlay.classList.remove('hidden');
      setTimeout(() => overlay.classList.add('bg-black/80'), 10);
      
      // 隐藏干扰元素
      const toHide = [
        'nav', 'aside', '.post-footer', '.comments', 
        '.related-posts', '.pagination', '#reading-progress'
      ];
      
      toHide.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.style.transition = 'opacity 0.3s ease';
        });
      });
      
      // 居中放大内容
      const main = document.querySelector('main');
      if (main) {
        main.style.maxWidth = '70ch';
        main.style.margin = '0 auto';
        main.style.paddingTop = '4rem';
        main.style.transition = 'all 0.3s ease';
      }
      
      // 隐藏滚动条但保持滚动功能
      body.style.overflow = 'auto';
      
      if (button) {
        button.innerHTML = '🔴 退出专注';
        button.classList.add('bg-red-500', 'text-white');
      }
      
      // ESC 退出
      document.addEventListener('keydown', exitOnEsc);
      
    } else {
      // 退出专注模式
      overlay.classList.remove('bg-black/80');
      setTimeout(() => overlay.classList.add('hidden'), 300);
      
      // 恢复所有元素
      const allElements = document.querySelectorAll('nav, aside, .post-footer, .comments, .related-posts, .pagination, #reading-progress, main');
      allElements.forEach(el => {
        el.style.opacity = '';
        el.style.pointerEvents = '';
        el.style.maxWidth = '';
        el.style.margin = '';
        el.style.paddingTop = '';
      });
      
      if (button) {
        button.innerHTML = '📖 专注模式';
        button.classList.remove('bg-red-500', 'text-white');
      }
      
      document.removeEventListener('keydown', exitOnEsc);
    }
    
    // 保存状态
    localStorage.setItem('focus-mode', isFocus);
  };

  function exitOnEsc(e) {
    if (e.key === 'Escape') {
      toggleFocusMode();
    }
  }

  // 打字机效果（标题）
  function typewriterEffect(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    element.classList.add('typewriter');
    
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        setTimeout(() => element.classList.remove('typewriter'), 1000);
      }
    }
    
    type();
  }

  // Toast 提示
  function showToast(message) {
    const existing = document.querySelector('.reading-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'reading-toast fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full text-sm shadow-lg z-50 transition-opacity duration-500';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.style.opacity = '0', 2000);
    setTimeout(() => toast.remove(), 2500);
  }

  // 平滑滚动到锚点
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // 初始化
  document.addEventListener('DOMContentLoaded', function() {
    // 进度监听
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    
    // 恢复位置（仅文章页）
    if (document.querySelector('.post-content')) {
      restoreReadingPosition();
    }
    
    // 自动保存阅读进度（每 5 秒）
    setInterval(() => {
      const pos = document.documentElement.scrollTop;
      if (pos > 100) { // 至少滚动 100px 才保存
        localStorage.setItem(`reading-position-${location.pathname}`, pos);
      }
    }, 5000);
    
    // 检查是否恢复专注模式（刷新后）
    if (localStorage.getItem('focus-mode') === 'true') {
      setTimeout(toggleFocusMode, 500);
    }
    
    // 打字机效果（可选：给首页标题添加）
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && heroTitle.textContent) {
      typewriterEffect(heroTitle, heroTitle.textContent, 80);
    }
  });

  // 阅读时间统计（更精确的算法）
  window.calculateReadingTime = function(text) {
    // 中文阅读速度：约 400 字/分钟
    // 英文阅读速度：约 200 词/分钟
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    
    const minutes = Math.ceil((chineseChars / 400) + (englishWords / 200));
    return minutes < 1 ? 1 : minutes;
  };

})();