import { AdSlot } from '@/components/GoogleAdsense'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import CONFIG from '../config'
import { BlogItem } from './BlogItem'

/**
 * 博客列表（电脑端丝滑 Hover / 手机端低调常驻完美适配版）
 */
export default function BlogListPage(props) {
  const { page = 1, posts, postCount } = props
  const router = useRouter()
  const { NOTION_CONFIG } = useGlobal()
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', null, NOTION_CONFIG)
  const totalPage = Math.ceil(postCount / POSTS_PER_PAGE)
  const currentPage = +page

  // 博客列表嵌入广告
  const TYPOGRAPHY_POST_AD_ENABLE = siteConfig(
    'TYPOGRAPHY_POST_AD_ENABLE',
    false,
    CONFIG
  )

  const showPrev = currentPage > 1
  const showNext = page < totalPage
  const pagePrefix = router.asPath
    .split('?')[0]
    .replace(/\/page\/[1-9]\d*/, '')
    .replace(/\/$/, '')
    .replace('.html', '')

  return (
    <div className='w-full md:pr-8 mb-12 px-5'>
      
      {/* 核心智能布局注入：根据屏幕尺寸动态改变下划线行为 */}
      <style jsx global>{`
        /* 全局清理生硬线条 */
        #posts-wrapper a, 
        #posts-wrapper h2, 
        #posts-wrapper span {
          text-decoration: none !important;
          border-bottom: none !important;
        }

        /* 标题统一相对定位 */
        #posts-wrapper h2 {
          position: relative;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        /* 统一的底座丝线基础样式 */
        #posts-wrapper h2::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -5px; /* 远离汉字底部，保留活字呼吸感 */
          width: 100%;
          height: 1.5px;
          background-color: #A3AAB2; /* 莫兰迪灰蓝 */
        }

        /* ================= 💻 电脑端大屏逻辑 (屏幕宽度 >= 768px) ================= */
        @media (min-width: 768px) {
          #posts-wrapper h2::after {
            opacity: 0; /* 平时完全隐形 */
            transition: opacity 0.3s ease-in-out; /* 0.3秒丝滑淡入 */
          }
          /* 鼠标悬浮时完美亮起 */
          #posts-wrapper a:hover h2::after,
          #posts-wrapper h2:hover::after {
            opacity: 1;
          }
        }

        /* ================= 📱 手机端小屏逻辑 (屏幕宽度 < 768px) ================= */
        @media (max-width: 767px) {
          #posts-wrapper h2::after {
            opacity: 0.4; /* 不再隐藏，而是以 40% 的微弱透明度半隐半现，精致且不抢眼 */
          }
        }
      `}</style>

      <div id='posts-wrapper'>
        {posts?.map((p, index) => (
          <div className='mb-4' key={p.id}>
            {TYPOGRAPHY_POST_AD_ENABLE && (index + 1) % 3 === 0 && (
              <AdSlot type='in-article' />
            )}
            {TYPOGRAPHY_POST_AD_ENABLE && index + 1 === 4 && <AdSlot type='flow' />}
            <BlogItem post={p} />
          </div>
        ))}
      </div>

      <div className='flex justify-between text-xs mt-1'>
        <SmartLink
          href={{
            pathname:
              currentPage - 1 === 1
                ? `${pagePrefix}/`
                : `${pagePrefix}/page/${currentPage - 1}`,
            query: router.query.s ? { s: router.query.s } : {}
          }}
          className={`${showPrev ? 'text-blue-600 border-b border-blue-400 visible ' : ' invisible bg-gray pointer-events-none '} no-underline pb-1 px-3`}>
          NEWER POSTS <i className='fa-solid fa-arrow-left'></i>
        </SmartLink>
        <SmartLink
          href={{
            pathname: `${pagePrefix}/page/${currentPage + 1}`,
            query: router.query.s ? { s: router.query.s } : {}
          }}
          className={`${showNext ? 'text-blue-600 border-b border-blue-400 visible' : ' invisible bg-gray pointer-events-none '} no-underline pb-1 px-3`}>
          OLDER POSTS <i className='fa-solid fa-arrow-right'></i>
        </SmartLink>
      </div>
    </div>
  )
}
