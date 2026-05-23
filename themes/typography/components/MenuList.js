import Collapse from '@/components/Collapse'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import CONFIG from '../config'
import { MenuItemCollapse } from './MenuItemCollapse'
import { MenuItemDrop } from './MenuItemDrop'
// 核心引入：拿取上面 LayoutBase 的控制引脚
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
  
  // 安全地获取顶层传下来的控制开关
  const globalState = useSimpleGlobal()
  const setShowInput = globalState?.setShowInput

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

  return (
    <>
      {/* 大屏模式菜单 - 垂直排列 */}
      <div id='nav-menu-pc' className='hidden md:flex md:flex-col md:gap-2'>
        {links?.map((link, index) => {
          const isSearchMenu = link?.name === '搜索' || link?.to === '/search' || link?.href === '/search'
          
          if (isSearchMenu && setShowInput) {
            // 精准重写点击逻辑，不改动任何原厂样式与图标
            return (
              <div 
                key={index} 
                onClick={(e) => {
                  e.preventDefault()
                  setShowInput(true)
                }}
                className="cursor-pointer"
              >
                <MenuItemDrop link={{ ...link, to: 'javascript:void(0);', href: 'javascript:void(0);' }} />
              </div>
            )
          }
          return <MenuItemDrop key={index} link={link} />
        })}
      </div>
      
      {/* 移动端小屏菜单 - 水平排列 */}
      <div
        id='nav-menu-mobile'
        className='flex md:hidden my-auto justify-center space-x-4'>
        {links?.map((link, index) => {
          const isSearchMenu = link?.name === '搜索' || link?.to === '/search' || link?.href === '/search'
          
          if (isSearchMenu && setShowInput) {
            return (
              <div 
                key={index} 
                onClick={(e) => {
                  e.preventDefault()
                  setShowInput(true)
                }}
                className="cursor-pointer"
              >
                <MenuItemDrop link={{ ...link, to: 'javascript:void(0);', href: 'javascript:void(0);' }} />
              </div>
            )
          }
          return <MenuItemDrop key={index} link={link} />
        })}
      </div>
    </>
  )
}
