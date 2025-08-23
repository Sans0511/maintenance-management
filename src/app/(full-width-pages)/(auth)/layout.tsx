import GridShape from '@/components/common/GridShape'
import ThemeTogglerTwo from '@/components/common/ThemeTogglerTwo'

import { ThemeProvider } from '@/context/ThemeContext'
import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900">
      <ThemeProvider>
        <div className="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900">
          {children}
          <div className="bg-brand-950 hidden h-full w-full lg:grid place-items-center lg:w-1/2 dark:bg-white/5">
            <div className="relative z-1 flex h-full w-full items-center justify-center">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex  flex-col items-center">
                <h1 className="text-5xl text-white items-center">Maintenance Management</h1>
                <h1 className="text-5xl text-white items-center"> System</h1>
              </div>
            </div>
          </div>
          <div className="fixed right-6 bottom-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  )
}
