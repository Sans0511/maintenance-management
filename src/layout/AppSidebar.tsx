'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '../context/SidebarContext'
import {
  GridIcon,
  ListIcon,
  ChevronDownIcon,
  HorizontaLDots,
  DocsIcon,
  GroupIcon,
} from '../icons/index'

type NavItem = {
  name: string
  icon: React.ReactNode
  path?: string
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[]
}

type AppSidebarProps = {
  role: 'ADMIN' | 'USER'
}

// Admin menu
const navItemsAdmin: NavItem[] = [
  {
    icon: <GridIcon />,
    name: 'Dashboard',
    path: '',
  },
  {
    icon: <ListIcon />,
    name: 'Asset Management',
    subItems: [
      { name: 'Add Asset Category', path: '/asset-categoty', pro: false },
      { name: 'Add Asset', path: '/assets', pro: false },
      { name: 'Spares', path: '/spares', pro: false },
      { name: 'Asset Assign', path: '/asset-assignment', pro: false },
    ],
  },
  {
    icon: <ListIcon />,
    name: 'Admin Management',
    subItems: [
      { name: 'Designations', path: '/designations', pro: false },
      { name: 'Employee Types', path: '/employee-types', pro: false },
      { name: 'Departments', path: '/departments', pro: false },
      { name: 'Employees', path: '/employees', pro: false },
      { name: 'Locations', path: '/locations', pro: false },
      { name: 'Contracts', path: '/contracts', pro: false },
    ],
  },
  {
    icon: <GroupIcon />,
    name: 'Users',
    path: '/users',
  },
  
]

const navItemsUser: NavItem[] = [
  {
    icon: <GridIcon />,
    name: 'Dashboard',
    path: '/user',
  },
]

const AppSidebar: React.FC<AppSidebarProps> = ({ role }) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const pathname = usePathname()

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'main'
    index: number
  } | null>(null)
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({})
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const navItems = role === 'ADMIN' ? navItemsAdmin : navItemsUser

  const isActive = useCallback((path: string) => path === pathname, [pathname])

  useEffect(() => {
    let submenuMatched = false
    navItems.forEach((nav, index) => {
      nav.subItems?.forEach((subItem) => {
        if (isActive(subItem.path)) {
          setOpenSubmenu({ type: 'main', index })
          submenuMatched = true
        }
      })
    })

    if (!submenuMatched) {
      setOpenSubmenu(null)
    }
  }, [pathname, isActive, navItems])

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu.index}`
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }))
      }
    }
  }, [openSubmenu])

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) =>
      prev && prev.index === index ? null : { type: 'main', index }
    )
  }

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${
                openSubmenu?.index === index
                  ? 'menu-item-active'
                  : 'menu-item-inactive'
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'lg:justify-start'
              }`}
            >
              <span
                className={`${
                  openSubmenu?.index === index
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive'
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                    openSubmenu?.index === index
                      ? 'text-brand-500 rotate-180'
                      : ''
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? 'menu-item-icon-active'
                      : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`main-${index}`] = el
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.index === index
                    ? `${subMenuHeight[`main-${index}`]}px`
                    : '0px',
              }}
            >
              <ul className="mt-2 ml-9 space-y-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? 'menu-dropdown-item-active'
                          : 'menu-dropdown-item-inactive'
                      }`}
                    >
                      {subItem.name}
                      <span className="ml-auto flex items-center gap-1">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  )

  return (
    <aside
      className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen
          ? 'w-[290px]'
          : isHovered
            ? 'w-[290px]'
            : 'w-[90px]'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex py-8 ${
          !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
              Maintenance Management System
            </h1>
          ) : (
            <span className="text-center text-lg font-semibold text-gray-900 dark:text-white">
              AM
            </span>
          )}
        </Link>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs leading-[20px] text-gray-400 uppercase ${
                  !isExpanded && !isHovered
                    ? 'lg:justify-center'
                    : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  'Menu'
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default AppSidebar
