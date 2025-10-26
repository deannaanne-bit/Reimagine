import React, { createContext, useContext, useState } from 'react'

const TabsCtx = createContext(null)

export function Tabs({ defaultValue, children, className='' }){
  const [value, setValue] = useState(defaultValue)
  return <TabsCtx.Provider value={{ value, setValue }}><div className={className}>{children}</div></TabsCtx.Provider>
}

export function TabsList({ children, className='' }){
  return <div className={className}>{children}</div>
}

export function TabsTrigger({ value, children, className='' }){
  const { value: v, setValue } = useContext(TabsCtx)
  const active = v === value
  return (
    <button onClick={()=>setValue(value)} className={`px-3 py-2 text-sm rounded-md border ${active ? 'bg-white border-slate-300' : 'bg-transparent border-transparent'} ${className}`}>
      {children}
    </button>
  )
}

export function TabsContent({ value, children }){
  const { value: v } = useContext(TabsCtx)
  if (v !== value) return null
  return <div className="mt-3">{children}</div>
}