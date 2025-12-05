import React from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  icon?: React.ReactNode
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
        {icon && <span className="transition-colors duration-300">{icon}</span>}
        <svg
          className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors duration-300"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  )
}

export default SearchBar
