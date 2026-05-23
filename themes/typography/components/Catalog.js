import { useGlobal } from '@/lib/global'
import throttle from 'lodash.throttle'
import { uuidToId } from 'notion-utils'
import { useEffect, useRef, useState } from 'react'

/**
 * 目录导航组件（极简主义视觉优化版）
 * @param toc
 * @returns {JSX.Element}
 * @constructor
 */
const Catalog = ({ post }) => {
  const { locale } = useGlobal()
  // 目录自动滚动
  const tRef = useRef(null)
  // 同步选中目录事件
  const [activeSection, setActiveSection] = useState(null)

  // 监听滚动事件
  useEffect(() => {
    // 如果没有文章或目录，不执行任何操作
    if (!post || !post?.toc || post?.toc?.length < 1) {
      return
    }
    
    const throttleMs = 100 // 降低节流时间提高响应速度
    
    const actionSectionScrollSpy = throttle(() => {
      const sections = document.getElementsByClassName('notion-h')
      if (!sections || sections.length === 0) return
      
      let prevBBox = null
      let currentSectionId = null
      
      // 先检查当前视口中的所有标题
      for (let i = 0; i < sections.length; ++i) {
        const section = sections[i]
        if (!section || !(section instanceof Element)) continue
        
        const bbox = section.getBoundingClientRect()
        const offset = 100 // 固定偏移量，避免计算不稳定
        
        // 如果标题在视口上方或接近顶部，认为是当前标题
        if (bbox.top - offset < 0) {
          currentSectionId = section.getAttribute('data-id')
          prevBBox = bbox
        } else {
          // 找到第一个在视口下方的标题就停止
          break
        }
      }
      
      // 如果没找到任何标题在视口上方，使用第一个标题
      if (!currentSectionId && sections.length > 0) {
        currentSectionId = sections[0].getAttribute('data-id')
      }
      
      // 只有当 ID 变化时才更新状态，减少不必要的渲染
      if (currentSectionId !== activeSection) {
        setActiveSection(currentSectionId)
        
        // 查找目录中对应的索引并滚动
        const index = post?.toc?.findIndex(
          obj => uuidToId(obj.id) === currentSectionId
        )
        
        if (index !== -1 && tRef?.current) {
          tRef.current.scrollTo({ top: 28 * index, behavior: 'smooth' })
        }
      }
    }, throttleMs)
    
    const content = document.querySelector('#container-inner')
    if (!content) return // 防止 content 不存在
    
    // 添加滚动和内容变化的监听
    content.addEventListener('scroll', actionSectionScrollSpy)
    
    // 初始执行一次
    setTimeout(() => {
      actionSectionScrollSpy()
    }, 300) // 延迟执行确保 DOM 已完全加载
    
    return () => {
      content?.removeEventListener('scroll', actionSectionScrollSpy)
    }
  }, [post])

  // 无目录就直接返回空
  if (!post || !post?.toc || post?.toc?.length < 1) {
    return <></>
  }

  return (
    <div className='px-1 select-none'>
      {/* 顶部标题：降低存在感，与网格背景融合 */}
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
                className={`
                  block pl-3 text-xs tracking-wide transition-all duration-300 ease-in-out
                  border-l-2 py-1 catalog-item
                  ${isActive 
                    ? 'border-slate-800 dark:border-white text-slate-900 dark:text-white font-medium opacity-100' 
                    : 'border-slate-100 dark:border-gray-800 text-slate-400 dark:text-gray-500 opacity-60 group-hover:opacity-80'} 
                  hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-gray-500 hover:opacity-100
                  notion-table-of-contents-item-indent-level-${tocItem.indentLevel}
                `}>
                <span
                  style={{
                    display: 'inline-block',
                    marginLeft: tocItem.indentLevel * 12 // 微调缩进间距，更紧凑
                  }}
                  className='truncate w-full'>
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
