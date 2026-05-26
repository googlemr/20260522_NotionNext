import { cleanPages, cleanIds, shortenIds } from '@/lib/utils/clean.util'
import { applySchedulePublish } from '@/lib/site/processors/schedule.processor'
import type { SiteData } from '@/lib/site/site.types'

export function handleDataBeforeReturn(db: SiteData): SiteData {
  applySchedulePublish(db)

  db.categoryOptions = cleanIds(db.categoryOptions)
  db.customMenu = cleanIds(db.customMenu)

  db.allNavPages = cleanPages(db.allNavPages, db.tagOptions)
  db.allPages = cleanPages(db.allPages, db.tagOptions)
  db.latestPosts = cleanPages(db.latestPosts, db.tagOptions)

  // 🚀 【强行截胡排序】不管原本怎么排，最终输出前一刻，一律按你的 3 位数字 slug（如 007, 006）降序排列
  const sortImagesBySlug = (pagesArray: any[]) => {
    if (pagesArray && pagesArray.length > 0) {
      pagesArray.sort((a, b) => {
        const slugA = a?.slug || '';
        const slugB = b?.slug || '';
        // numeric: true 让计算机把 "007" 认作大于 "006" 的数字进行降序排列
        return slugB.localeCompare(slugA, undefined, { numeric: true });
      });
    }
  };

  // 分别对全站文章列表、最新推荐、以及导航页列表【全部】进行强制重排
  sortImagesBySlug(db.allPages)
  sortImagesBySlug(db.latestPosts)
  sortImagesBySlug(db.allNavPages) // 🌟 加上这行，彻底封死首页漏网之鱼的可能

  delete db.block
  delete db.schema
  delete db.rawMetadata
  delete db.pageIds

  return db
}
