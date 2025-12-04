import React, { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import BasePanel from '@/components/panel/Panel'
import type { SectionProps } from '@/types/eventTypes';
import Link from '@/components/custom-ui/Link';

const AuthSuccessCard: React.FC<SectionProps & { gotoLink?: string, gotoLabel?: string }> = ({ gotoLink, gotoLabel, title, children }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true); // Set to true after 1000ms (1 second)
    }, 1000);

    // Cleanup function to clear the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <BasePanel className="w-full max-w-md mx-auto">
      <div className="text-center">
        <div className="mb-6">
          <LoadingSpinner />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h1>

        {children}

        <p className="text-sm text-gray-500">
          You will be redirected to the Ara alpha version shortly
        </p>
        <p>
          {
            showButton &&
            <Link uri={gotoLink!} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{gotoLabel}</Link>
          }
        </p>
      </div>
    </BasePanel>
  )
}

export default AuthSuccessCard
