import '@/styles/globals.css'
import '@/styles/utility-patterns.css'

import '@/styles/notion.css' 
import 'react-notion-x/src/styles.css' 

import useAdjustStyle from '@/hooks/useAdjustStyle'
import { GlobalContextProvider } from '@/lib/global'
import { getBaseLayoutByTheme } from '@/themes/theme'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo } from 'react'
import { getQueryParam } from '../lib/utils'

import BLOG from '@/blog.config'
import ExternalPlugins from '@/components/ExternalPlugins'
import SEO from '@/components/SEO'
import { zhCN } from '@clerk/localizations'
import dynamic from 'next/dynamic'

const ClerkProvider = dynamic(() =>
  import('@clerk/nextjs').then(m => m.ClerkProvider)
)

const MyApp = ({ Component, pageProps }) => {
  useAdjustStyle()

  const route = useRouter()
  const queryTheme = getQueryParam(route.asPath, 'theme')
  const notionTheme = pageProps?.NOTION_CONFIG?.THEME
  const configTheme = BLOG.THEME
  const theme = useMemo(() => {
    return queryTheme || notionTheme || configTheme
  }, [queryTheme, notionTheme, configTheme])

  // 🚀 终极图床闭环：强行用 R2 服务器截帧作为 Poster 封面
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver(() => {
        const videos = document.querySelectorAll('video:not(.auto-poster-processed)');
        
        videos.forEach(video => {
          video.classList.add('auto-poster-processed');

          // 1. 获取视频源地址
          let videoSrc = video.src || video.querySelector('source')?.src;

          if (videoSrc) {
            // 2. 核心黑客手段：直接把视频的第一帧链接强行赋给 poster 属性
            // 配合 Cloudflare R2 的服务器特性，自动生成绝对秒开的静态封面
            if (!videoSrc.includes('#t=')) {
              video.setAttribute('poster', videoSrc + '#t=0.001');
            }
          }

          // 3. 移动端兼容性硬核补丁
          video.style.backgroundColor = '#1a1a1a';
          video.style.borderRadius = '8px';
          video.setAttribute('preload', 'metadata');
          video.setAttribute('playsinline', 'true');
          video.setAttribute('webkit-playsinline', 'true');
        });
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, []);

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
