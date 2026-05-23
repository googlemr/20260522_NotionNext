import { useGlobal } from '@/lib/global'
import CONFIG from '../config'
import SmartLink from '@/components/SmartLink'
import { useSimpleGlobal } from '../index'

/**
 * 导航栏组件（利用现有 Notion 菜单一键唤醒搜索弹窗版）
 */
const NavBar = props => {
  const { customNav, customMenu } = props
  const { locale } = useGlobal()
  
  // 核心：引入全局搜索组件的控制引脚
  const { searchModal } = useSimpleGlobal()

  // 核心：一键唤醒全局搜索弹窗
  const handleSearchClick = (e) => {
    e.preventDefault() // 阻止它跳转到空白的 /search 页面
    if (searchModal?.current) {
      searchModal.current.openSearch() // 直接弹出带光标的搜索框
    }
  }

  // 优先使用自定义菜单，没有则使用系统菜单
  const links = customNav || customMenu || []

  return (
    <div className='w-full select-none text-center md:text-left mt-4 md:mt-8'>
      
      {/* 动态渲染来自 Notion 数据库的菜单栏 */}
      <div className='flex flex-col gap-y-2 text-xs font-semibold tracking-wide text-slate-700 dark:text-gray-300 mb-4'>
        {links?.map((link, index) => {
          if (!link || link.status !== 'Published') return null

          // 特殊处理：如果是 Notion 里配置的“搜索”菜单，直接绑定弹窗事件
          const isSearchMenu = link.name === '搜索' || link.to === '/search'

          if (isSearchMenu) {
            return (
              <button
                key={index}
                onClick={handleSearchClick}
                className='text-left block hover:underline text-xs font-semibold text-slate-700 dark:text-gray-300 focus:outline-none py-0.5'
              >
                {link.icon && <i className={`${link.icon} mr-1.5 opacity-70`} />}
                {link.name}
              </button>
            )
          }

          // 普通菜单保持原样跳转
          return (
            <SmartLink key={index} href={link.to} className='block hover:underline py-0.5'>
              {link.icon && <i className={`${link.icon} mr-1.5 opacity-70`} />}
              {link.name}
            </SmartLink>
          )
        })}
      </div>
    </div>
  )
}

export default NavBar
