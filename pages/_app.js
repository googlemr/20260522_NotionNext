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
  // 🚀 最稳视频兜底方案（工业简化版）
  // =========================
  useEffect(() => {
    if (typeof window === 'undefined') return

    const processVideos = () => {
      const videos = document.querySelectorAll('video:not([data-fixed="1"])')

      videos.forEach((video) => {
        video.dataset.fixed = '1'

        video.setAttribute('preload', 'metadata')
        video.setAttribute('playsinline', 'true')
        video.setAttribute('webkit-playsinline', 'true')

        video.style.backgroundColor = '#000'
        video.style.borderRadius = '8px'

        // ⭐关键：永远保证有 poster（彻底避免黑屏）
        const fallbackPoster =
          'data:image/svg+xml;base64,' +
          btoa(`
            <svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0%" stop-color="#111"/>
                  <stop offset="100%" stop-color="#222"/>
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#g)"/>
              <circle cx="400" cy="225" r="45" fill="#444"/>
            </svg>
          `)

        if (!video.getAttribute('poster')) {
          video.setAttribute('poster', fallbackPoster)
        }

        // ⭐iOS补丁：避免空白黑块
        video.addEventListener('loadeddata', () => {
          if (!video.getAttribute('poster')) {
            video.setAttribute('poster', fallbackPoster)
          }
        })
      })
    }

    const observer = new MutationObserver(processVideos)

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

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
