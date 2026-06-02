/* eslint-disable react/no-unknown-property */
/**
 * 此处样式只对当前主题生效
 * 此处不支持 tailwindCSS 的 @apply 语法
 * @returns
 */
const Style = () => {
  return (
    <style jsx global>{`
      html {
        -webkit-font-smoothing: antialiased;
      }
      .font-typography {
        font-weight: 400;
        font-family:
          Source Sans Pro,
          Roboto,
          Helvetica,
          Helvetica Neue,
          Source Han Sans SC,
          Source Han Sans TC,
          PingFang SC,
          PingFang HK,
          PingFang TC,
          sans-serif !important;
      }
      
      // ==========================================
      // 【全局底色与网格清理控制】
      // ==========================================

      // 1. 夜间（暗黑）模式底色与标签文字控制
      .dark body, 
      .dark #theme-typography {
        background-color: rgb(35, 34, 34) !important; /* 强制锁定原本的暗灰色，消灭惨白 */
        background-image: none !important;            /* 彻底拔掉夜间模式的小方块网格线 */
      }
      
      /* 修复夜间模式下标签文字模糊不清的问题 */
      .dark #theme-typography {
        color: #d1d5db !important;                    /* 强行把全站基础文字（包括标签页顶部的文字）在夜间恢复成清晰的浅灰色 */
      }

      // 2. 日间模式底色重置
      #theme-typography {
        --primary-color: #2e405b;
        background-color: #F1F1EF !important;          /* 强制锁定 Notion 官方淡灰色，拒绝刺眼纯白 */
        color: #2e405b;
        text-shadow: 1px 1px 1px rgb(0 0 0 / 0.04);
        background-image: none !important;            /* 彻底拔掉日间模式的小方块网格线 */
      }

      // ==========================================
      // 【被保护的历史网格线代码（已注释隐藏）】
      // ==========================================
      /* 
      .dark #theme-typography {
        background-image: linear-gradient(
              to right,
              rgb(255 255 255 / 0.04) 1px,
              transparent 1px
            ),
            linear-gradient(to bottom, rgb(255 255 255 / 0.04) 1px, transparent 1px);
      }

      #theme-typography {
        background-size: 7px 7px;
        background-image: linear-gradient(
            to right,
            rgb(0 0 0 / 0.04) 1px,
            transparent 1px
          ),
          linear-gradient(to bottom, rgb(0 0 0 / 0.04) 1px, transparent 1px);
      }
      */

      // ==========================================
      // 【后续原厂基础样式（保持不动）】
      // ==========================================
      // 文本不可选取
      .forbid-copy {
        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
      }

      #theme-typography #blog-name {
        font-family: HiraMinProN-W6, 'Source Han Serif CN',
          'Source Han Serif SC', 'Source Han Serif TC', serif;
      }

      #theme-typography #blog-name-en {
        font-family: HiraMinProN-W6, 'Source Han Serif CN',
          'Source Han Serif SC', 'Source Han Serif TC', serif;
      }

      #theme-typography .blog-item-title {
        color: #276077;
      }

      .dark #theme-typography .blog-item-title {
        color: #d1d5db;
      }

      .notion {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }

      #container-wrapper .scroll-hidden {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }
    `}</style>
  )
}

export { Style }
