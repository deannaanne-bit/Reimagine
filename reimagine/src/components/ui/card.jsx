import React from 'react'

export function Card({ children, className='' }) {
  return <div className={`bg-white border border-slate-200 rounded-2xl ${className}`}>{children}</div>
}

export function CardHeader({ children, className='' }) {
  return <div className={`px-4 pt-4 ${className}`}>{children}</div>
}

export function CardTitle({ children, className='' }) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
}

export function CardContent({ children, className='' }) {
  return <div className={`px-4 pb-4 ${className}`}>{children}</div>
}