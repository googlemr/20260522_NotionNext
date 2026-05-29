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
  // 🎯 视频封面终极稳定方案（已封装进 _app）
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

        let done = false

        const capture = () => {
          if (done) return
          if (!video.videoWidth || !video.videoHeight) return

          try {
            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const ctx = canvas.getContext('2d')
            if (!ctx) return

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            const poster = canvas.toDataURL('image/jpeg', 0.8)

            if (poster && poster.length > 10000) {
              video.setAttribute('poster', poster)
              done = true
            }
          } catch (e) {}
        }

        const forceSeek = () => {
          try {
            video.currentTime = 0
          } catch {}
        }

        video.addEventListener('loadedmetadata', forceSeek)
        video.addEventListener('loadedmetadata', capture)
        video.addEventListener('loadeddata', capture)
        video.addEventListener('canplay', capture)

        setTimeout(capture, 100)
        setTimeout(capture, 800)
      })
    }

    const observer = new MutationObserver(() => {
      processVideos()
    })

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
