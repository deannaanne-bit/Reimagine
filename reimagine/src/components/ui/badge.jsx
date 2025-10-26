import React from 'react'

export function Badge({ children, variant='default' }){
  const styles = variant === 'secondary'
    ? 'bg-slate-100 text-slate-800'
    : 'bg-slate-900 text-white'
  return <span className={`inline-block text-xs px-2 py-1 rounded-full ${styles}`}>{children}</span>
}