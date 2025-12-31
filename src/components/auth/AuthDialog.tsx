'use client'
import React, { useState, useEffect, useRef } from 'react'
import Button from '@/components/custom-ui/Button'
import { authClient } from '@/client-side/auth'
import { FaGithub } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import Input from '@/components/Input'
import Label from '@/components/custom-ui/Label'
import PageLikePanel from '@/components/panel/PageLikePanel'

interface AuthDialogProps {
  isOpen: boolean
  onClose?: () => void
  className?: string
}

const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose, className }) => {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isEmailSigningIn, setIsEmailSigningIn] = useState(false)
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [displayName, setDisplayName] = useState('')

  // Scroll dialog into view when it opens
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden'
      // Scroll dialog into view
      dialogRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      // Restore body scroll when dialog closes
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true)
      const result = await authClient.signIn.social({
        provider: 'github',
        callbackURL: window.location.href, // Use current page as callback
      })

      // Log the result for debugging
      console.log('GitHub sign-in result:', result)

      if (result.error) {
        console.error('Sign-in error:', result.error)
        alert(`Failed to sign in: ${result.error.message || 'Please try again.'}`)
        setIsSigningIn(false)
        return
      }

      // Check if result.data has a url property (OAuth redirect)
      if (result.data && 'url' in result.data && result.data.url) {
        // If there's a redirect URL, navigate to it (OAuth flow)
        // This is the normal flow for OAuth - redirect to GitHub
        // Close dialog before redirecting
        onClose?.()
        window.location.href = result.data.url
        return
      }

      // Check if result.data indicates success (shouldn't happen with OAuth, but handle it)
      if (result.data && 'user' in result.data) {
        // Sign-in completed successfully
        onClose?.()
        setIsSigningIn(false)
        return
      }

      // Unexpected response - log and show error
      console.error('Unexpected sign-in response:', result)
      alert('Unexpected response from sign-in. Please try again.')
      setIsSigningIn(false)
    } catch (error) {
      console.error('Sign-in error:', error)
      alert(`An error occurred during sign-in: ${error instanceof Error ? error.message : 'Please try again.'}`)
      setIsSigningIn(false)
    }
  }

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      alert('Please enter both email and password')
      return
    }

    try {
      setIsEmailSigningIn(true)
      const result = await authClient.signIn.email({
        email,
        password,
      })
      if (result.error) {
        console.error('Email sign-in error:', result.error)
        alert(result.error.message || 'Failed to sign in. Please check your credentials.')
      } else {
        // Reset form on success
        setEmail('')
        setPassword('')
        setNickname('')
        setDisplayName('')
        setIsSignUpMode(false)
        onClose?.()
      }
    } catch (error) {
      console.error('Email sign-in error:', error)
      alert('An error occurred during sign-in. Please try again.')
    } finally {
      setIsEmailSigningIn(false)
    }
  }

  const handleEmailSignUp = async () => {
    if (!email || !password) {
      alert('Please enter both email and password')
      return
    }

    try {
      setIsEmailSigningIn(true)
      // Build sign-up data with optional fields
      const signUpData: {
        email: string
        password: string
        name?: string
        username?: string
      } = {
        email,
        password,
      }

      // Only include optional fields if they have values
      if (displayName.trim()) {
        signUpData.name = displayName.trim()
      }
      if (nickname.trim()) {
        signUpData.username = nickname.trim()
      }

      // Type assertion needed because better-auth types may require these fields
      const result = await authClient.signUp.email(signUpData as any)
      if (result.error) {
        console.error('Email sign-up error:', result.error)
        alert(result.error.message || 'Failed to sign up. Please try again.')
      } else {
        // Reset form on success
        setEmail('')
        setPassword('')
        setNickname('')
        setDisplayName('')
        setIsSignUpMode(false)
        onClose?.()
      }
    } catch (error) {
      console.error('Email sign-up error:', error)
      alert('An error occurred during sign-up. Please try again.')
    } finally {
      setIsEmailSigningIn(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="w-full max-w-md my-auto">
          <PageLikePanel title={isSignUpMode ? "Sign Up" : "Sign In"} titleCenter={true} className={className}>
            <div className="space-y-4">
              {/* Toggle between Sign In and Sign Up */}
              <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(false)}
                  className={cn(
                    'flex-1 py-1 text-sm font-medium transition-colors',
                    !isSignUpMode
                      ? 'text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(true)}
                  className={cn(
                    'flex-1 py-1 text-sm font-medium transition-colors',
                    isSignUpMode
                      ? 'text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  )}
                >
                  Sign Up
                </button>
              </div>

              {/* Email/Password Form */}
              <div className="space-y-3">
                <div>
                  <Label>Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={isEmailSigningIn}
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isEmailSigningIn}
                    className="w-full mt-1"
                  />
                </div>

                {isSignUpMode && (
                  <>
                    <div>
                      <Label>Username (e.g: siteuser777, vitalik)</Label>
                      <Input
                        id="nickname"
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="username"
                        disabled={isEmailSigningIn}
                        className="w-full mt-1"
                      />
                    </div>

                    <div>
                      <Label>Display Name (e.g: John Doe, Satoshi Nakamoto)</Label>
                      <Input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your Name"
                        disabled={isEmailSigningIn}
                        className="w-full mt-1"
                      />
                    </div>
                  </>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  disabled={isEmailSigningIn}
                  onClick={() => {
                    if (isSignUpMode) {
                      handleEmailSignUp()
                    } else {
                      handleEmailSignIn()
                    }
                  }}
                  className="w-full"
                >
                  {isEmailSigningIn
                    ? isSignUpMode
                      ? 'Signing up...'
                      : 'Signing in...'
                    : isSignUpMode
                      ? 'Sign Up'
                      : 'Sign In'}
                </Button>
              </div>

              {/* Separator */}
              <div className="flex items-center gap-2 py-2">
                <hr className="flex-1 border-slate-200 dark:border-slate-700" />
                <span className="text-xs text-slate-500 dark:text-slate-400">OR</span>
                <hr className="flex-1 border-slate-200 dark:border-slate-700" />
              </div>

              {/* Login with GitHub Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-2"
              >
                <FaGithub className="w-4 h-4" />
                {isSigningIn ? 'Signing in...' : 'Login with GitHub'}
              </Button>
            </div>
          </PageLikePanel>
        </div>
      </div>
    </>
  )
}

export default AuthDialog

