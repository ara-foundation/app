import React, { useState, useMemo, useEffect } from 'react'
import { FilterOption } from './FilterToggle'
import FilterToggle from './FilterToggle'
import SearchBar from '@/components/SearchBar'
import List from './List'
import Badge from '@/components/badge/Badge'
import NumberFlow from '@number-flow/react'

export interface FilterableListProps<T> {
    items: T[]
    itemComponent: React.ComponentType<T>
    filters?: FilterOption[]
    onFilterChange?: (filterId: string, sortId: string) => void
    title?: React.ReactNode
    titleCenter?: boolean
    searchPlaceholder?: string
    hideSearchbar?: boolean
    searchableFields?: (keyof T)[]
    className?: string
    children?: React.ReactNode
    showNumber?: boolean
    contentHeight?: string
}

/**
 * FilterableList Component
 *
 * Purpose:
 * A universal list component that combines filtering, sorting, search, and list rendering
 * with support for generic item types. Provides a consistent interface for displaying
 * filterable and searchable lists across the application.
 *
 * Use Case:
 * - Use when you need to display a list of items with filtering and search capabilities
 * - When you want to replace custom filter implementations with a standardized solution
 * - For creating consistent list interfaces across different parts of the application
 *
 * When To Use:
 * - When you need a list with optional filtering, sorting, and search functionality
 * - When you want to standardize list implementations across the application
 * - When you need a flexible component that can handle different item types
 *
 * When Not To Use:
 * - For simple lists without filtering or search requirements
 * - When you need highly customized list layouts that don't fit the standard pattern
 * - For lists that require complex state management beyond basic filtering
 */
const FilterableList = <T,>({
    items,
    itemComponent: ItemComponent,
    filters,
    onFilterChange,
    title,
    titleCenter = false,
    searchPlaceholder = "Search...",
    hideSearchbar = false,
    searchableFields,
    className,
    children,
    showNumber = true,
    contentHeight,
}: FilterableListProps<T>) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [, setCurrentFilter] = useState<string | undefined>()
    const [, setCurrentSort] = useState<string | undefined>()

    // Get searchable fields - either provided or auto-detect string fields
    const getSearchableFields = (): (keyof T)[] => {
        if (searchableFields) {
            return searchableFields
        }

        // Auto-detect string fields if no searchableFields provided
        if (items.length > 0) {
            const firstItem = items[0] as any
            return Object.keys(firstItem).filter(key =>
                typeof firstItem[key] === 'string'
            ) as (keyof T)[]
        }

        return []
    }

    // Filter items based on search query
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) {
            return items
        }

        const fields = getSearchableFields()
        const query = searchQuery.toLowerCase()

        return items.filter(item => {
            return fields.some(field => {
                const value = (item as any)[field]
                return typeof value === 'string' && value.toLowerCase().includes(query)
            })
        })
    }, [items, searchQuery, searchableFields])

    // Handle filter changes
    const handleFilterChange = (filterId: string, sortId: string) => {
        setCurrentFilter(filterId)
        setCurrentSort(sortId)
        onFilterChange?.(filterId, sortId)
    }

    return (
        <div className={`text-slate-600 dark:text-slate-400 ${className}`}>
            {/* Title */}
            {title ? (
                <div className={`flex items-center gap-1 mb-2 ${titleCenter ? 'justify-center' : ''}`}>
                    {title}
                    {showNumber && (
                        <Badge variant="info">
                            <NumberFlow
                                value={filteredItems.length}
                                locales="en-US"
                                format={{ useGrouping: false }}
                            />
                        </Badge>
                    )}
                </div>
            ) : showNumber ? (
                <h3 className='text-md font-medium mb-2'>
                    <div className='inline-flex items-center gap-1'>
                        Items <Badge variant="info">
                            <NumberFlow
                                value={filteredItems.length}
                                locales="en-US"
                                format={{ useGrouping: false }}
                            />
                        </Badge>
                    </div>
                </h3>
            ) : null}

            {/* Filters */}
            {filters && filters.length > 0 && (
                <FilterToggle
                    filters={filters}
                    className='mb-6 text-sm'
                    onValueChange={handleFilterChange}
                />
            )}

            {/* Search Bar */}
            {!hideSearchbar && (
                <SearchBar
                    className='mb-4'
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={searchPlaceholder}
                />
            )}

            {/* List Content */}
            <List className={'space-y-4'} contentHeight={contentHeight}>
                {filteredItems.map((item, index) => {
                    return <ItemComponent key={index} {...(item as any)} />
                })}
            </List>

            {/* Additional children */}
            {children}
        </div>
    )
}

export default FilterableList
