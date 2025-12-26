'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BasePanel } from '@/components/panel'
import Button from '@/components/custom-ui/Button'
import Input from '@/components/Input'
import Label from '@/components/custom-ui/Label'
import Link from '@/components/custom-ui/Link'
import { FaGithub, FaLinkedin, FaTelegram } from 'react-icons/fa'
import { useIsCurrentUser } from '@/hooks/useIsCurrentUser'
import { getAccountsByUserId } from '@/client-side/auth-accounts'
import { authClient } from '@/client-side/auth'
import type { Star } from '@/types/star'
import type { AuthUser } from '@/types/auth'

interface UserAccountPanelProps {
    user: Star
    authUser?: AuthUser | null
}

const UserAccountPanel: React.FC<UserAccountPanelProps> = ({ user, authUser }) => {
    const [showForm, setShowForm] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [accounts, setAccounts] = useState<Array<{ providerId: string; providerAccountId: string }>>([])
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)

    // Form state
    const [displayName, setDisplayName] = useState('')
    const [username, setUsername] = useState('')

    const userEmail = authUser?.email
    const { isCurrentUser, isLoading: isLoadingUser } = useIsCurrentUser(userEmail)

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            const session = await authClient.getSession()
            setIsAuthenticated(!!session?.data?.user)
        }
        checkAuth()
    }, [])

    // Initialize form values from authUser
    useEffect(() => {
        if (authUser) {
            setDisplayName(authUser.name || '')
            setUsername(authUser.username || authUser.displayUsername || '')
        }
    }, [authUser])

    // Fetch accounts if viewing own profile
    useEffect(() => {
        const fetchAccounts = async () => {
            if (isCurrentUser && authUser?.id) {
                setIsLoadingAccounts(true)
                try {
                    const fetchedAccounts = await getAccountsByUserId(authUser.id)
                    setAccounts(fetchedAccounts.map(acc => ({
                        providerId: acc.providerId,
                        providerAccountId: acc.providerAccountId,
                    })))
                } catch (error) {
                    console.error('Error fetching accounts:', error)
                } finally {
                    setIsLoadingAccounts(false)
                }
            }
        }
        fetchAccounts()
    }, [isCurrentUser, authUser?.id])

    // Build social links from accounts
    const socialLinks: Array<{ type: 'github' | 'linkedin' | 'telegram'; url: string }> = []
    const githubAccount = accounts.find(acc => acc.providerId === 'github')
    if (githubAccount) {
        socialLinks.push({
            type: 'github',
            url: `https://github.com/${githubAccount.providerAccountId}`,
        })
    }

    const getSocialIcon = (type: 'github' | 'linkedin' | 'telegram') => {
        switch (type) {
            case 'github':
                return <FaGithub className="w-5 h-5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
            case 'linkedin':
                return <FaLinkedin className="w-5 h-5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
            case 'telegram':
                return <FaTelegram className="w-5 h-5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
        }
    }

    const handleSave = async () => {
        if (!isAuthenticated || !isCurrentUser) return

        setIsSaving(true)
        try {
            // TODO: Implement actual save API call
            // For now, just simulate a save
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log('Saving account:', { displayName, username })
            // Show success message or handle error
            alert('Account settings saved successfully!')
        } catch (error) {
            console.error('Error saving account:', error)
            alert('Failed to save account settings. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    // Don't show panel if not authenticated or not current user
    if (isLoadingUser || !isAuthenticated || !isCurrentUser) {
        return null
    }

    return (
        <div className="w-full mt-4">
            {/* Toggle Button */}
            <div className="mb-4">
                <Button
                    onClick={() => setShowForm(!showForm)}
                    variant="secondary"
                    outline={true}
                >
                    {showForm ? 'Hide Form' : 'User Account'}
                </Button>
            </div>

            {/* Animated Form */}
            <AnimatePresence mode="wait">
                {showForm && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        <BasePanel className="w-full">
                            <div className="space-y-6 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        Profile Information
                                    </h2>
                                    {isAuthenticated && isCurrentUser && (
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            variant="success"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Account'}
                                        </Button>
                                    )}
                                </div>

                                {/* Connected Social Links */}
                                {socialLinks.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Connected Social Links</Label>
                                        <div className="flex items-center gap-4">
                                            {socialLinks.map((social) => (
                                                <Link
                                                    key={social.type}
                                                    uri={social.url}
                                                    asNewTab={true}
                                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                                                >
                                                    {getSocialIcon(social.type)}
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                                        {social.type === 'github' && githubAccount && (
                                                            <>GitHub ({githubAccount.providerAccountId})</>
                                                        )}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Email (read-only) */}
                                {userEmail && (
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            {userEmail}
                                        </div>
                                    </div>
                                )}

                                {/* Display Name (editable) */}
                                <div className="space-y-2">
                                    <Label>Display Name</Label>
                                    <Input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full"
                                        placeholder="Enter display name"
                                    />
                                </div>

                                {/* Username (editable) */}
                                <div className="space-y-2">
                                    <Label>Username</Label>
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full"
                                        placeholder="Enter username"
                                    />
                                </div>

                                {/* Password (disabled) */}
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        value="••••••••"
                                        disabled={true}
                                        className="w-full"
                                        onChange={() => { }}
                                        placeholder="Enter password"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                                        Password change is not available yet.
                                    </p>
                                </div>
                            </div>
                        </BasePanel>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default UserAccountPanel

