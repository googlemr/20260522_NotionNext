// import '@/styles/animate.css' // @see https://animate.style/
import '@/styles/globals.css'
import '@/styles/utility-patterns.css'

// core styles shared by all of react-notion-x (required)
import '@/styles/notion.css' //  重写部分notion样式
import 'react-notion-x/src/styles.css' // 原版的react-notion-x

import useAdjustStyle from '@/hooks/useAdjustStyle'
import { GlobalContextProvider } from '@/lib/global'
import { getBaseLayoutByTheme } from '@/themes/theme'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo } from 'react'
import { getQueryParam } from '../lib/utils'

// 各种扩展插件 这个要阻塞引入
import BLOG from '@/blog.config'
import ExternalPlugins from '@/components/ExternalPlugins'
import SEO from '@/components/SEO'
import { zhCN } from '@clerk/localizations'
import dynamic from 'next/dynamic'
// import { ClerkProvider } from '@clerk/nextjs'
const ClerkProvider = dynamic(() =>
  import('@clerk/nextjs').then(m => m.ClerkProvider)
)

/**
 * App挂载DOM 入口文件
 * @param {*} param0
 * @returns
 */
const MyApp = ({ Component, pageProps }) => {
  // 一些可能出现 bug 的样式，可以统一放入该钩子进行调整
  useAdjustStyle()

  const route = useRouter()
  const queryTheme = getQueryParam(route.asPath, 'theme')
  const notionTheme = pageProps?.NOTION_CONFIG?.THEME
  const configTheme = BLOG.THEME
  const theme = useMemo(() => {
    return queryTheme || notionTheme || configTheme
  }, [queryTheme, notionTheme, configTheme])

  useEffect(() => {
    const source = queryTheme
      ? 'url:theme'
      : notionTheme
        ? 'notion:config'
        : 'blog/env:config'
    console.log(
      '[ThemeResolver][runtime-final]',
      JSON.stringify(
        {
          note: 'This is the final theme used for rendering.',
          configTheme,
          notionTheme: notionTheme || null,
          queryTheme: queryTheme || null,
          finalTheme: theme,
          source
        },
        null,
        2
      )
    )
  }, [configTheme, notionTheme, queryTheme, theme])

  // 🚀 【新增功能】全局视频自动封面补丁：利用 HTML5 Media Fragment 强行提取第一帧
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver(() => {
        // 抓取页面上所有还没被处理过的 video 标签
        const videos = document.querySelectorAll('video:not(.auto-poster-processed)');
        
        videos.forEach(video => {
          // 打上标记，防止 React 重新渲染时陷入死循环
          video.classList.add('auto-poster-processed');

          // 如果视频存在，且链接没有被加上时间戳
          if (video.src && !video.src.includes('#t=')) {
            // 强行在视频链接尾部拼接 0.001 秒的定位符，骗手机浏览器渲染当前帧
            video.src = video.src + '#t=0.001';
            // 强制声明预加载元数据，配合时间戳彻底击穿苹果 iOS 和微信的白屏封锁
            video.setAttribute('preload', 'metadata');
            // 顺手加上内联播放，防止 iOS 微信点击播放时突然强制全屏弹出
            video.setAttribute('playsinline', 'true');
            video.setAttribute('webkit-playsinline', 'true');
          }
        });
      });

      // 让观察者死死盯住整个网页 DOM 树，只要有新节点（视频）加载，立刻拦截修改
      observer.observe(document.documentElement, { childList: true, subtree: true });

      // 组件卸载时清理监听器，防止内存泄漏
      return () => observer.disconnect();
    }
  }, []);

  // 整体布局
  const GLayout = useCallback(
    props => {
      const Layout = getBaseLayoutByTheme(theme)
      return <Layout {...props} />
    },
    [theme]
  )

  const enableClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const content = (
    <GlobalContextProvider {...pageProps}>
      <GLayout {...pageProps}>
        <SEO {...pageProps} />
        <Component {...pageProps} />
      </GLayout>
      <ExternalPlugins {...pageProps} />
    </GlobalContextProvider>
  )
  return (
    <>
      {enableClerk ? (
        <ClerkProvider localization={zhCN}>{content}</ClerkProvider>
      ) : (
        content
      )}
    </>
  )
}

export default MyApp
