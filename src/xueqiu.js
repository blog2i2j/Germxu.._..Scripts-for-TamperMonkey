// ==UserScript==
// @name         雪球详情页
// @author       Finn
// @namespace    https://github.com/Germxu
// @homepage     https://github.com/Germxu/Scripts-for-TamperMonkey
// @supportURL   https://github.com/Germxu/Scripts-for-TamperMonkey/issues/new
// @version      0.7
// @description  站内链接当前页打开 + 当前项高亮 + 外链显示
// @match        https://xueqiu.com/S/*/detail*
// @match        https://xueqiu.com/snowman/S/*/detail*
// @match        https://www.xueqiu.com/S/*/detail*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // 只取最后一个 / 后的标识（如 ZYCWZB、SDGD 等）
  function getLastSegment(url) {
    const parts = url.split('/');
    let last = parts[ parts.length - 1 ] || '';
    last = last.split('#')[ 0 ].split('?')[ 0 ];
    return last.toUpperCase().trim();
  }

  // 添加外链角标样式
  function addExternalBadgeStyle() {
    if (document.getElementById('external-badge-style')) return;

    const style = document.createElement('style');
    style.id = 'external-badge-style';
    style.textContent = `
            .stock-links a.external-link {
                position: relative;
                padding-right: 24px !important;
            }
            .stock-links a.external-link::after {
                content: "[外]";
                font-size: 10px;
                color: #888;
                vertical-align: super;
                position: absolute;
                right: 6px;
                top: 45%;
                transform: translateY(-50%);
                opacity: 0.7;
                pointer-events: none;
            }
            .stock-links a.external-link:hover::after {
                color: #0066cc;
                opacity: 1;
            }
        `;
    document.head.appendChild(style);
  }

  function init() {
    const sidebar = document.querySelector('.stock-links');
    if (!sidebar) return;

    addExternalBadgeStyle();

    const links = sidebar.querySelectorAll('a[href]');
    const currentSegment = getLastSegment(window.location.href);

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      // 判断是否站内链接
      const isInternal =
        href.includes('xueqiu.com') ||
        href.startsWith('/') ||
        href.startsWith('#') ||
        href.startsWith('javascript:');

      if (isInternal) {
        // 站内：移除 target，处理当前页逻辑
        link.removeAttribute('target');
        link.removeAttribute('rel');

        const linkSegment = getLastSegment(href);
        const isCurrent = (linkSegment === currentSegment) && linkSegment.length >= 4;

        if (isCurrent) {
          link.classList.add('active', 'current');
          link.style.fontWeight = 'bold';
          link.style.color = '#0066cc';
          link.style.backgroundColor = 'rgba(0, 102, 204, 0.08)';
          link.style.borderLeft = '4px solid #0066cc';
          link.style.paddingLeft = '8px';

          // 阻止当前页跳转
          link.addEventListener('click', (e) => {
            e.preventDefault();
            link.style.opacity = '0.6';
            setTimeout(() => link.style.opacity = '1', 180);
          });
        }
      } else {
        // 站外链接：添加角标 + 确保新标签页
        link.classList.add('external-link');
        console.log(111, link)
        if (!link.hasAttribute('target')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      }
    });
  }

  // 执行与监听
  function tryInit() {
    init();
    if (!document.querySelector('.stock-links a[href]')) {
      setTimeout(tryInit, 600);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }

  setTimeout(tryInit, 1000);
  setTimeout(tryInit, 2500);
  setTimeout(tryInit, 4500);

  window.addEventListener('hashchange', init);
  window.addEventListener('popstate', init);

  new MutationObserver(() => {
    if (document.querySelector('.stock-links')) init();
  }).observe(document.body, { childList: true, subtree: true });

})();
