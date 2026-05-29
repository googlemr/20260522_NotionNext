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

  // Video Poster Auto-Generator (Safe Version)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver(() => {
        const videos = document.querySelectorAll('video:not(.auto-poster-processed)');
        
        videos.forEach(video => {
          video.classList.add('auto-poster-processed');

          video.style.backgroundColor = '#1a1a1a';
          video.style.borderRadius = '8px';

          video.muted = true;
          video.setAttribute('muted', 'true');
          video.setAttribute('playsinline', 'true');
          video.setAttribute('webkit-playsinline', 'true');
          video.setAttribute('preload', 'auto');

          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              video.pause(); 
            }).catch(() => {});
          }
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
