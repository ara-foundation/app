'use client'
import React, { useState, useEffect } from 'react'
import AuthStar from '@/components/auth/AuthStar'
import Button from '@/components/custom-ui/Button'
import { authClient } from '@/client-side/auth'
import { getStarByUserId, updateStarSunshines } from '@/client-side/star'
import { FaGithub } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import { Popover } from '@base-ui-components/react/popover'
import { getIcon } from '@/components/icon'
import Input from '@/components/Input'
import Label from '@/components/custom-ui/Label'
import WelcomeDialog from '@/components/auth/WelcomeDialog'
import type { AuthUser } from '@/types/auth'
import type { Star } from '@/types/star'

interface Props {
  className?: string
}
const welcomeSunshines = 100

const AuthHeader: React.FC<Props> = ({ className }) => {
  const { data: session, isPending } = authClient.useSession()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isEmailSigningIn, setIsEmailSigningIn] = useState(false)
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [star, setStar] = useState<Star | null>(null)
  const [isLoadingStar, setIsLoadingStar] = useState(false)
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [displayName, setDisplayName] = useState('')

  // Fetch star when user is signed in
  useEffect(() => {
    const fetchStar = async () => {
      const user = session?.user as AuthUser | undefined
      if (user?.id) {
        setIsLoadingStar(true)
        try {
          // Fetch star by userId
          const fetchedStar = await getStarByUserId(user.id)

          if (fetchedStar !== null) {
            setStar(fetchedStar)
          }
        } catch (error) {
          console.error('Error fetching or updating star:', error)
          setStar(null)
        } finally {
          setIsLoadingStar(false)
        }
      } else {
        setStar(null)
      }
    }

    if (!isPending && session?.user) {
      fetchStar()
    } else if (!session?.user) {
      setStar(null)
    }
  }, [session, isPending, showWelcomeDialog])

  // Fetch star when user is signed in
  useEffect(() => {
    const claimSunshines = async () => {
      setIsLoadingStar(true)
      let updateResult: {
        success: boolean;
        error?: string;
      } = { success: false };
      // Check if sunshines are claimed (100) or not claimed (0)
      try {
        // Sunshines are 0, update to 100
        updateResult = await updateStarSunshines(star!._id!, welcomeSunshines)
      } catch (error) {
        console.error('Error fetching or updating star:', error)
      } finally {
        if (updateResult.success) {
          const updatedStar: Star = {
            ...star!,
            sunshines: welcomeSunshines,
          }
          setStar(updatedStar)
          // Show welcome dialog since sunshines were just claimed
          setShowWelcomeDialog(true)
        }

        setIsLoadingStar(false)
      }
    }

    const sunshinesClaimed = star?.sunshines !== undefined && star.sunshines > 0;
    if (star !== null && false === sunshinesClaimed) {
      claimSunshines()
    }
  }, [star, session])


  const handleSignIn = async () => {
    try {
      setIsSigningIn(true)
      const result = await authClient.signIn.social({
        provider: 'github',
      })
      if (result.error) {
        console.error('Sign-in error:', result.error)
        alert('Failed to sign in. Please try again.')
      } else {
        // Star creation will be handled by the session effect above
        // This ensures we only create once and after session is properly updated
      }
    } catch (error) {
      console.error('Sign-in error:', error)
      alert('An error occurred during sign-in. Please try again.')
    } finally {
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

        // Star creation will be handled by the session effect above
        // This ensures we only create once and after session is properly updated
      }
    } catch (error) {
      console.error('Email sign-up error:', error)
      alert('An error occurred during sign-up. Please try again.')
    } finally {
      setIsEmailSigningIn(false)
    }
  }

  // Loading state
  if (isPending) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
    )
  }

  const user = session?.user as AuthUser | undefined

  if (user) {
    return (
      <>
        <AuthStar
          star={star || undefined}
          src={user.image}
          email={user.email}
          nickname={user.name || user.username || user.email?.split('@')[0] || 'User'}
          className="w-8 h-8"
        />
        <WelcomeDialog
          isOpen={showWelcomeDialog}
          sunshines={welcomeSunshines}
          onClose={() => setShowWelcomeDialog(false)}
        />
      </>
    )
  }

  return (
    <>
      <Popover.Root>
        <Popover.Trigger
          className={cn(
            "hyperlink flex items-center justify-center shadow-none",
            "px-3 py-1.5 text-sm font-medium rounded-md",
            "bg-indigo-600 hover:bg-indigo-700 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors",
            className
          )}
          disabled={isSigningIn}
        >
          {isSigningIn ? 'Signing in...' : 'Login'}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8} side="bottom" align="end" className={'z-700!'}>
            <Popover.Popup className="w-64 origin-[var(--transform-origin)] rounded-xs bg-[canvas] px-6 py-4 text-gray-900 shadow-sm shadow-gray-900 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
              <Popover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                {getIcon('arrow')}
              </Popover.Arrow>

              {!user && (
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
                          <Label>Nickname (optional)</Label>
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
                          <Label>Display Name (optional)</Label>
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
              )}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      <WelcomeDialog
        isOpen={showWelcomeDialog}
        sunshines={welcomeSunshines}
        onClose={() => setShowWelcomeDialog(false)}
      />
    </>
  )
}

export default AuthHeader
