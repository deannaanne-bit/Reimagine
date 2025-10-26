import React, { createContext, useContext, useId, useMemo } from 'react'
const SelectCtx = createContext(null)

export function Select({ value, onValueChange, children }){
  const id = useId()
  return <SelectCtx.Provider value={{ value, onValueChange, id }}>{children}</SelectCtx.Provider>
}
export function SelectTrigger({ children, className='' }){
  return <div className={`relative ${className}`}>{children}</div>
}
export function SelectValue({ placeholder }){
  const { value } = useContext(SelectCtx)
  return <span className="inline-block px-3 py-2 border border-slate-300 rounded-md w-full text-sm bg-white">{value || placeholder}</span>
}
export function SelectContent({ children }){
  return <div className="hidden">{children}</div>
}
export function SelectItem({ value, children }){
  // This is only used for listing options; actual control is a native select rendered by SelectNative
  return null
}

// Helper native select to actually handle interactions
export function SelectNative({ options }){
  const { value, onValueChange } = useContext(SelectCtx)
  return (
    <select
      className="absolute inset-0 opacity-0 cursor-pointer"
      value={value}
      onChange={e=>onValueChange(e.target.value)}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}