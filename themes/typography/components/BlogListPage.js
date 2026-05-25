import { AdSlot } from '@/components/GoogleAdsense'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import CONFIG from '../config'
import { BlogItem } from './BlogItem'

/**
 * 博客列表（融合莫兰迪灰 Hover 下划线动效版）
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
      
      {/* 核心视觉注入：用最干净的内联 CSS 强行注入莫兰迪灰 Hover 下划线动效 */}
      <style jsx global>{`
        /* 1. 平时状态：彻底扒干净原厂所有生硬的下划线和下边框 */
        #posts-wrapper a, 
        #posts-wrapper h2, 
        #posts-wrapper span {
          text-decoration: none !important;
          border-bottom: none !important;
        }

        /* 2. 在文章标题的 H2 标签上，利用伪元素生成优雅的莫兰迪灰底座丝线 */
        #posts-wrapper h2 {
          position: relative;
          display: inline-block; /* 确保丝线宽度只覆盖文字 */
          margin-bottom: 0.5rem; /* 增加一点下边距供丝线放置 */
        }

        /* 3. 丝线的平时状态：高度 1.5px，颜色莫兰迪灰，全透明隐形，带有 0.3s 动效 */
        #posts-wrapper h2::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -5px; /* 向下平移 5px，远离汉字底部笔画 */
          width: 100%;
          height: 1.5px; /* 低调低矮的高度 */
          background-color: #A3AAB2; /* 淡雅的莫兰迪灰色（灰色偏蓝） */
          opacity: 0; /* 平时全透明隐形 */
          transition: opacity 0.3s ease-in-out; /* 0.3s 淡入淡出 */
        }

        /* 4. 鼠标悬浮在链接或 H2 上时，丝线优雅淡入 */
        #posts-wrapper a:hover h2::after,
        #posts-wrapper h2:hover::after {
          opacity: 1; /* 悬浮时淡入 */
        }
      `}</style>

      <div id='posts-wrapper'>
        {posts?.map((p, index) => (
          <div className='mb-4' key={p.id}> {/* 优化：增加间距，让呼吸感更足 */}
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
