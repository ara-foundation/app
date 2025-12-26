import React from 'react'
import { getIcon, IconType } from './icon'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  icon?: IconType
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder, className = '', icon }) => {
  return (
    <div className={`relative transition-all duration-300 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2.5 pr-12
          bg-white dark:bg-slate-800
          border border-gray-300 dark:border-gray-700
          rounded-lg
          text-slate-700 dark:text-slate-200
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none
          focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
          focus:border-blue-500 dark:focus:border-blue-400
          hover:border-gray-400 dark:hover:border-gray-600
          transition-all duration-300 ease-in-out
          shadow-sm hover:shadow-md focus:shadow-lg
        `}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2 pointer-events-none">
        {icon && <span className="transition-colors duration-300">{getIcon({ iconType: icon })}</span>}
        <span className="text-gray-400 dark:text-gray-500 transition-colors duration-300">{getIcon({ iconType: 'search' })}</span>
      </div>
    </div>
  )
}

export default SearchBar
