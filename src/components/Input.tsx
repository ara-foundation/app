import React from 'react'

interface InputProps {
  id?: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  ref?: React.RefObject<HTMLInputElement | null>
}

const Input: React.FC<InputProps> = ({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  ref
}) => {
  return (
    <input
      ref={ref}
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-purple-50 dark:bg-purple-800/10 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
    />
  )
}

export default Input
