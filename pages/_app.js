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

  // =========================
  // 🎯 视频终极优化方案（稳定版）
  // =========================
  useEffect(() => {
    if (typeof window === 'undefined') return

    const processVideos = () => {
      const videos = document.querySelectorAll('video:not(.video-processed)')

      videos.forEach(video => {
        video.classList.add('video-processed')

        // 1️⃣ 强制加载 metadata（解决手机空白核心）
        video.setAttribute('preload', 'metadata')

        // 2️⃣ 移动端兼容
        video.setAttribute('playsinline', 'true')
        video.setAttribute('webkit-playsinline', 'true')

        // 3️⃣ 视觉优化（避免空白块突兀）
        video.style.backgroundColor = '#000'
        video.style.borderRadius = '8px'

        // 4️⃣ ⭐ 核心增强：尝试生成封面（第一帧捕获）
        try {
          if (video.readyState >= 2) {
            // 已有数据 → 截取第一帧
            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            const poster = canvas.toDataURL('image/jpeg', 0.7)
            video.setAttribute('poster', poster)
          } else {
            // 没加载到数据 → 等 loadeddata 再处理
            video.addEventListener('loadeddata', () => {
              const canvas = document.createElement('canvas')
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight

              const ctx = canvas.getContext('2d')
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

              const poster = canvas.toDataURL('image/jpeg', 0.7)
              video.setAttribute('poster', poster)
            })
          }
        } catch (e) {
          // fallback：避免报错影响页面
          console.log('video poster gen failed:', e)
        }
      })
    }

    // MutationObserver：监听 Notion 动态渲染
    const observer = new MutationObserver(() => {
      processVideos()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // 初始执行一次
    processVideos()

    return () => observer.disconnect()
  }, [])

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

  return enableClerk ? (
    <ClerkProvider localization={zhCN}>{content}</ClerkProvider>
  ) : (
    content
  )
}

export default MyApp
