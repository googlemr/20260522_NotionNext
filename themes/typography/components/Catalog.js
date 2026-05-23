import { useGlobal } from '@/lib/global'
import throttle from 'lodash.throttle'
import { uuidToId } from 'notion-utils'
import { useEffect, useRef, useState } from 'react'

/**
 * 目录导航组件（高稳定性极简版）
 * 修复了点击跳转时多目录同时高亮、内层样式残留的 Bug
 */
const Catalog = ({ post }) => {
  const { locale } = useGlobal()
  const tRef = useRef(null)
  const [activeSection, setActiveSection] = useState(null)
  
  // 核心修复：引入点击滚动锁，防止点击跳转时页面快速跳跃触发滚动的误判
  const isClickScrolling = useRef(false)

  // 监听滚动事件
  useEffect(() => {
    if (!post || !post?.toc || post?.toc?.length < 1) {
      return
    }
    
    const throttleMs = 80 // 优化节流时间
    
    const actionSectionScrollSpy = throttle(() => {
      // 如果是点击触发的强制跳转，直接拦截滚动监听，避免计算冲突
      if (isClickScrolling.current) return

      const sections = document.getElementsByClassName('notion-h')
      if (!sections || sections.length === 0) return
      
      let currentSectionId = null
      
      // 精确判定：寻找当前最接近视口顶部的标题
      for (let i = 0; i < sections.length; ++i) {
        const section = sections[i]
        if (!section || !(section instanceof Element)) continue
        
        const bbox = section.getBoundingClientRect()
        // 判定线：当标题滚动到距离视口顶部 120px 以内时激活
        if (bbox.top <= 120) {
          currentSectionId = section.getAttribute('data-id')
        } else {
          break
        }
      }
      
      if (!currentSectionId && sections.length > 0) {
        currentSectionId = sections[0].getAttribute('data-id')
      }
      
      if (currentSectionId && currentSectionId !== activeSection) {
        setActiveSection(currentSectionId)
        
        const index = post?.toc?.findIndex(
          obj => uuidToId(obj.id) === currentSectionId
        )
        
        if (index !== -1 && tRef?.current) {
          tRef.current.scrollTo({ top: 28 * index, behavior: 'smooth' })
        }
      }
    }, throttleMs)
    
    const content = document.querySelector('#container-inner')
    if (!content) return 
    
    content.addEventListener('scroll', actionSectionScrollSpy)
    
    setTimeout(() => {
      actionSectionScrollSpy()
    }, 300) 
    
    return () => {
      content?.removeEventListener('scroll', actionSectionScrollSpy)
    }
  }, [post, activeSection])

  if (!post || !post?.toc || post?.toc?.length < 1) {
    return <></>
  }

  return (
    <div className='px-1 select-none'>
      {/* 侧边栏小标题 */}
      <div className='text-xs font-semibold tracking-wider text-slate-400 dark:text-gray-500 mb-4 uppercase'>
        <i className='mr-1.5 fas fa-stream opacity-70' />
        {locale.COMMON.TABLE_OF_CONTENTS}
      </div>

      <div
        className='overflow-y-auto overscroll-none max-h-36 lg:max-h-[75vh] scroll-hidden'
        ref={tRef}>
        <nav className='h-full text-slate-800 dark:text-gray-300 group'>
          {post?.toc?.map(tocItem => {
            const id = uuidToId(tocItem.id)
            const isActive = activeSection === id
            
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => {
                  // 点击时立即锁定滚动监听，并强制单点高亮
                  isClickScrolling.current = true
                  setActiveSection(id)
                  // 待动画彻底结束后释放锁（500ms 足够完成 smooth 跳转）
                  setTimeout(() => {
                    isClickScrolling.current = false
                  }, 500)
                }}
                className={`
                  block pl-3 text-xs tracking-wide transition-all duration-300 ease-in-out
                  border-l-2 py-1 catalog-item
                  ${isActive 
                    ? 'border-slate-800 dark:border-white text-slate-900 dark:text-white font-semibold opacity-100' 
                    : 'border-slate-100 dark:border-gray-800 text-slate-400 dark:text-gray-500 opacity-60 group-hover:opacity-80'} 
                  hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-gray-500 hover:opacity-100
                  notion-table-of-contents-item-indent-level-${tocItem.indentLevel}
                `}>
                {/* 彻底移除了 span 内部多余的条件判断，样式由外层 a 标签严格统一控制 */}
                <span
                  style={{
                    display: 'inline-block',
                    marginLeft: tocItem.indentLevel * 12
                  }}
                  className='truncate w-full block'>
                  {tocItem.text}
                </span>
              </a>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default Catalog
