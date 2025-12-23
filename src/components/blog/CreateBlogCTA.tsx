'use client'
import React, { useState } from 'react'
import CreateBlogForm from './CreateBlogForm'
import Button from '../custom-ui/Button'
import DemoAuthPanel from '../demo/DemoAuthPanel'
import { cn } from '@/lib/utils'

interface CreateBlogCTAProps {
    authorId: string
    onBlogCreated?: () => void
}

const CreateBlogCTA: React.FC<CreateBlogCTAProps> = ({ authorId, onBlogCreated }) => {
    const [showForm, setShowForm] = useState(false)

    const handleSuccess = () => {
        setShowForm(false)
        setTimeout(() => {
            onBlogCreated?.()
            window.dispatchEvent(new CustomEvent('blog-created'))
        }, 500)
    }

    return (
        <>
            <DemoAuthPanel>
                <div className={cn(
                    "fixed bottom-4 left-1/2 -translate-x-1/2 z-40",
                    "backdrop-blur-md bg-white/90 dark:bg-slate-900/90",
                    "border border-slate-200/50 dark:border-slate-700/50",
                    "rounded-lg shadow-lg",
                    "transition-all duration-300",
                    "hover:shadow-xl hover:scale-105"
                )}>
                    <Button
                        variant="primary"
                        outline={true}
                        size="lg"
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Blog Post</span>
                    </Button>
                </div>
            </DemoAuthPanel>

            {showForm && (
                <CreateBlogForm
                    authorId={authorId}
                    onSuccess={handleSuccess}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </>
    )
}

export default CreateBlogCTA
