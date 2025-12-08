import React from 'react'
import PageLikePanel from '@/components/panel/PageLikePanel'
import IssueLink from '@/components/issue/IssueLink'
import { Issue } from '@/types/issue'

const HighlightedIssues: React.FC = () => {
  const issues: Issue[] = [
    {
      title: 'Add Typescript Support',
      description: 'Add full TypeScript support to improve developer experience and type safety.',
      stats: {
        'follower': {
          type: 'follower',
          hint: 'Followers interested',
          children: 8
        },
        'voting-power': {
          type: 'voting-power',
          hint: 'Voting power',
          children: 32
        }
      },
      uri: '',
      type: 'improvement',
      projectId: '',
    },
    {
      title: 'Fix Linux memory leak',
      description: 'Resolve critical memory leak affecting Linux deployments in production.',
      stats: {
        'follower': {
          type: 'follower',
          hint: 'Followers interested',
          children: 8
        },
        'voting-power': {
          type: 'voting-power',
          hint: 'Voting power',
          children: 32
        }
      },
      uri: '',
      type: 'improvement',
      projectId: '',
    },
    {
      title: 'Consult me how the code work for internal project',
      description: 'Create comprehensive guides and examples for newcomers to the library.',
      stats: {
        'follower': {
          type: 'follower',
          hint: 'Followers interested',
          children: 1
        },
        'voting-power': {
          type: 'voting-power',
          hint: 'Voting power',
          children: 20
        }
      },
      uri: '',
      type: 'improvement',
      projectId: '',
    },
    {
      title: 'Better documentation for beginners',
      description: 'Create comprehensive guides and examples for newcomers to the library.',
      stats: {
        'follower': {
          type: 'follower',
          hint: 'Followers interested',
          children: 5
        },
        'voting-power': {
          type: 'voting-power',
          hint: 'Voting power',
          children: 20
        }
      },
      uri: '',
      type: 'improvement',
      projectId: '',
    }
  ]

  return (
    <PageLikePanel className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4" title='Highlighted Issues'>
      {issues.map((issue, index) => (
        <IssueLink
          key={index}
          {...issue}
        />
      ))}
    </PageLikePanel>
  )
}

export default HighlightedIssues
