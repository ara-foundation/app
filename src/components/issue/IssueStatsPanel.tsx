'use client'
import React, { useState, Suspense, lazy } from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import Badge from '@/components/badge/Badge'
import TimeAgo from 'timeago-react'
// import Following from '../social-network/Followings'
// import '../../styles/react-customize-token-input.css';

// Dynamic import for TokenInput to avoid SSR issues
const TokenInput = lazy(() => import('react-customize-token-input'));

interface IssueStatsProps {
  editable?: boolean
  tags?: string[]
  list?: string
  availableLists?: string[]
}

const IssueStatsPanel: React.FC<IssueStatsProps> = ({ editable = true, tags: _tags = ['tag1', 'tag2', 'tag3'], list: _list, availableLists: _availableLists = [] }) => {
  const [tags, setTags] = useState<string[]>(_tags)
  // const [list, setList] = useState<string | undefined>(_list);

  const tagsClassName = !editable ? 'border-1 rounded-xs border-gray-300 hover:border-teal-400 hover:bg-white/10 bg-teal-50/10' : ''

  return (
    <PageLikePanel
      className="mb-8"
      interactive={false}
      title="Issue Stats" >
      <div className="space-y-3 text-sm py-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 w-24">Status:</span>
          <Badge static={true} variant="success">Open</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 w-24">List/Roadmap</span>
          <Badge variant="info">N/A</Badge>
          {/* <Badge static={true} variant="info">v2.12.3</Badge> */}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 w-24">Updated:</span>
          {/* <i>N/A</i> */}
          <TimeAgo datetime={1730457600000} className='text-slate-600 dark:text-slate-400' />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 w-24">Contributor:</span>
          <span>N/A</span>
          {/* <div className="flex items-center space-x-2 gap-1">
            <MenuAvatar imgClassName="w-5 h-5 rounded-full" alt="Emily W." uri="/profile/emily" />
            supervised by
            <MenuAvatar imgClassName="w-5 h-5 rounded-full" alt="Emily W." uri="/profile/emily" />
          </div> */}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 w-24">Tags:</span>
          <Suspense fallback={<div className="text-gray-500 text-sm">Loading...</div>}>
            <TokenInput
              readOnly={!editable}
              tokenValues={tags}
              className={`flex w-full justify-end ${tagsClassName}`}
              onTokenValuesChange={(tags_) => setTags(tags_ as string[])}
            />
          </Suspense>
        </div>
      </div>
    </PageLikePanel>
  )
}

export default IssueStatsPanel
