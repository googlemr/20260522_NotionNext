import Collapse from '@/components/Collapse'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import CONFIG from '../config'
import { MenuItemCollapse } from './MenuItemCollapse'
import { MenuItemDrop } from './MenuItemDrop'
// 核心引入：拿取上一层传下来的全局搜索引脚
import { useSimpleGlobal } from '../index'

/**
 * 菜单导航
 * @param {*} props
 * @returns
 */
export const MenuList = ({ customNav, customMenu }) => {
  const { locale } = useGlobal()
  const [isOpen, changeIsOpen] = useState(false)
  const toggleIsOpen = () => {
    changeIsOpen(!isOpen)
  }
  const closeMenu = e => {
    changeIsOpen(false)
  }
  const router = useRouter()
  const collapseRef = useRef(null)
  
  // 核心：调用全局搜索控制弹窗
  const { searchModal } = useSimpleGlobal()

  useEffect(() => {
    router.events.on('routeChangeStart', closeMenu)
    return () => {
      router.events.off('routeChangeStart', closeMenu)
    }
  }, [router.events])

  let links = [
    {
      icon: 'fas fa-archive',
      name: locale.NAV.ARCHIVE,
      href: '/archive',
      show: siteConfig('TYPOGRAPHY_MENU_ARCHIVE', null, CONFIG)
    },
    {
      icon: 'fas fa-folder',
      name: locale.COMMON.CATEGORY,
      href: '/category',
      show: siteConfig('TYPOGRAPHY_MENU_CATEGORY', null, CONFIG)
    },
    {
      icon: 'fas fa-tag',
      name: locale.COMMON.TAGS,
      href: '/tag',
      show: siteConfig('TYPOGRAPHY_MENU_TAG', null, CONFIG)
    }
  ]

  if (customNav) {
    links = links.concat(customNav)
  }

  // 如果 开启自定义菜单，则覆盖 Page 生成的菜单
  if (siteConfig('CUSTOM_MENU')) {
    links = customMenu
  }

  if (!links || links.length === 0) {
    return null
  }

  // 核心逻辑：精准拦截搜索菜单项，将其重构为弹窗触发模式，不改动任何原有排版样式
  const renderMenuItem = (link, index) => {
    const isSearchMenu = link?.name === '搜索' || link?.to === '/search' || link?.href === '/search'

    if (isSearchMenu) {
      return (
        <div 
          key={index} 
          onClick={(e) => {
            e.preventDefault()
            if (searchModal?.current) {
              searchModal.current.openSearch() // 一键弹出带打字光标的窗口
            }
          }}
          className="cursor-pointer"
        >
          {/* 严格复用你主题原本的单项菜单组件，不添加或删除任何文字或图标 */}
          <MenuItemDrop link={{ ...link, to: '#', href: '#' }} />
        </div>
      )
    }

    return <MenuItemDrop key={index} link={link} />
  }

  return (
    <>
      {/* 大屏模式菜单 - 垂直排列 */}
      <div id='nav-menu-pc' className='hidden md:flex md:flex-col md:gap-2'>
        {links?.map((link, index) => renderMenuItem(link, index))}
      </div>
      {/* 移动端小屏菜单 - 水平排列 */}
      <div
        id='nav-menu-mobile'
        className='flex md:hidden my-auto justify-center space-x-4'>
        {links?.map((link, index) => renderMenuItem(link, index))}
      </div>
    </>
  )
}
