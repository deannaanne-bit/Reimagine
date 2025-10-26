import React from 'react'

export function Button({ children, className = '', variant = 'default', size='default', ...props }) {
  const base = 'inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border transition'
  const variants = {
    default: 'bg-slate-900 text-white border-slate-900 hover:opacity-90',
    outline: 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50',
    secondary: 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200',
    ghost: 'bg-transparent text-slate-900 border-transparent hover:bg-slate-100'
  }
  const sizes = { default: '', icon: 'p-2 aspect-square' }
  return <button className={`${base} ${variants[variant]} ${sizes[size] || ''} ${className}`} {...props}>{children}</button>
}