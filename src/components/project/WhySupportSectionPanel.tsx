import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Button from '@/components/custom-ui/Button'

const WhySupportSection: React.FC = () => {
  return (
    <PageLikePanel className="p-6" title='Why Support This Project?'>
      <p className="text-gray-600 mb-6">
        Supporting isn't just about giving — it's about shaping the future of open-source.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-100 p-4 rounded-lg text-center">
          <div className="w-12 h-12 bg-orange-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
          </div>
          <p className="text-sm font-medium">Give money to maintainers</p>
        </div>

        <div className="bg-purple-100 p-4 rounded-lg text-center">
          <div className="w-12 h-12 bg-purple-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <p className="text-sm font-medium">Obtain Voting Power</p>
        </div>

        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <div className="w-12 h-12 bg-blue-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium">Solve and get rating</p>
        </div>

        <div className="bg-green-100 p-4 rounded-lg text-center">
          <div className="w-12 h-12 bg-green-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm font-medium">Raise Issue that impact</p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-600 mb-4">
        All in open-based collaboration
      </div>

      <div className="space-y-3 text-sm">
        <h3 className="font-medium">What does rating give?</h3>
        <p className="text-gray-600">
          Influence and help other projects to get popular to later find developers to help you as
          well as turn your app ideas into a real project.
        </p>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Rating is a metrics of the successful collaboration</span>
          </div>

          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            <span>Which means, along with rating you get more networking</span>
          </div>

          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Find open-source developers to turn your idea into app</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button variant="outline" className="w-full">
          Learn More About Ara
        </Button>
      </div>
    </PageLikePanel>
  )
}

export default WhySupportSection
