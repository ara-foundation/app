import React, { useState, useEffect } from 'react'
import SearchBar from '@/components/SearchBar'
import PageLikePanel, { PageLikePanelProps } from '@/components/panel/PageLikePanel'
import Link from '../custom-ui/Link'
import { ProjectInfo } from '@/types/project'
import { githubUrlToGit } from '@/lib/url'
import { getIcon } from '../icon'
import { Issue } from '@/types/issue'
import List from '../list/List'
import SelectableItem from '../list/SelectableItem'
import { useSelectableList } from '../list/useSelectableList'
import Badge from '../badge/Badge'
import Button from '../custom-ui/Button'
import IssueLinkPanel4 from '../issue/IssueLink'
import NumberFlow from '@number-flow/react'

export type ForkLinkingPanelProps = Omit<PageLikePanelProps, 'title' | 'children'> & {
  project: Omit<ProjectInfo, 'forkId'>
  fork: Omit<ProjectInfo, 'forkId'>
  onSelectedIssuesChange?: (issueIds: string[]) => void
}

const ForkLinkingPanel: React.FC<ForkLinkingPanelProps> = ({ className, onActionClick, onSelectedIssuesChange, project, fork, ...props }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { selectedItem, setSelectedItem } = useSelectableList({ allowMany: true })

  useEffect(() => {
    onSelectedIssuesChange?.(selectedItem.asArray)
  }, [selectedItem, onSelectedIssuesChange])

  const issues: Issue[] = [
    {
      uri: 'https://github.com/example/repo/issues/142',
      number: '#142',
      title: 'Improve blockchain verification performance',
      description: 'Transaction verification takes too long on large repositories',
      type: 'improvement',
      storage: 'github',
      author: {
        uri: '',
        children: 'alice-blockchain',
        icon: 'https://avatars.githubusercontent.com/u/1234567?v=4'
      }
      ,
      projectId: '',
    },
    {
      uri: 'https://github.com/example/repo/issues/156',
      number: '#156',
      title: 'Add support for Solana blockchain',
      description: 'Currently only supports Ethereum and Polygon networks',
      type: 'feature',
      storage: 'github',
      author: {
        uri: '',
        children: 'bob-blockchain',
        icon: 'https://avatars.githubusercontent.com/u/1234567?v=4'
      },
      projectId: '',
    },
    {
      uri: 'https://github.com/example/repo/issues/189',
      number: '#189',
      title: 'Fix dependency vulnerability in crypto module',
      description: 'Security issue identified in v2.3.1 of the crypto verification module',
      type: 'bug',
      storage: 'github',
      author: {
        uri: '',
        children: 'charlie-blockchain',
        icon: 'https://avatars.githubusercontent.com/u/1234567?v=4'
      },
      projectId: '',
    },
    {
      uri: 'https://github.com/example/repo/issues/201',
      number: '#201',
      title: 'Implement batch processing for large SBOMs',
      description: 'Current implementation fails with memory errors on repositories with 1000+ dependencies',
      type: 'enhancement',
      storage: 'github',
      author: {
        uri: '',
        children: 'david-blockchain',
        icon: 'https://avatars.githubusercontent.com/u/1234567?v=4'
      },
      projectId: '',
    },
    {
      uri: 'https://app.ara.foundation/issues/custom',
      number: 'Other',
      title: 'Custom issue or enhancement',
      description: 'Describe your own contribution',
      type: 'custom',
      storage: 'arada-',
      author: {
        uri: '',
        children: 'eve-blockchain',
        icon: 'https://avatars.githubusercontent.com/u/1234567?v=4'
      },
      projectId: '',
    }
  ]

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const action = <div className="">
    <p className={`text-center text-sm mt-2 mb-1 border-t-1 border-gray-300 ${selectedItem.amount === 0 ? 'text-rose-500' : 'text-sky-600'}`}>
      {selectedItem.amount === 0 ?
        <span>Select the issue. Didn't find the issue you want? <Link uri={`/data/issue/post?project=${githubUrlToGit(fork.repository)}&notYetCreated=true&fork=${githubUrlToGit(project.repository)}`}>Create a new issue</Link></span> :
        <span>Fork is related to {selectedItem.amount} issues</span>}
    </p>
    <div className="flex justify-center">
      <Button
        variant='primary'
        disabled={selectedItem.amount === 0}
        onClick={() => { onActionClick && onActionClick({}) }}
      >Next</Button>
    </div>
  </div>

  return (
    <PageLikePanel
      {...props}
      interactive={false}
      className={className}
      title={"Reason of the forking"}
      rightHeader={
        <Link
          uri={`/data/issue/post?project=${githubUrlToGit(fork.repository)}&notYetCreated=true&fork=${githubUrlToGit(project.repository)}`}
        >
          Create New Issue
        </Link>
      }
      actions={action}>
      <strong className='inline-flex items-center gap-1 h-2 '>Your project has been forked from
        <Link className='ml-1' uri={fork.repository} >
          <div className='inline-flex items-center gap-1'>{getIcon('github')} {fork.name}</div>
        </Link>
      </strong>
      <p className="text-sm text-gray-600 dark:text-gray-500 mb-4">
        <span>
          Choose one or many issues that explains why you forked.<br />
          The issues will be attached to the original project to make your fork <b>discoverable</b>.
        </span>
      </p>

      <h3 className='text-md font-medium mb-2'>
        <div className='inline-flex items-center gap-1'>
          {getIcon('github')} {fork.name} Issues <Badge variant="info"><NumberFlow
            value={filteredIssues.length}
            locales="en-US"
            format={{ useGrouping: false }}
          /></Badge>
        </div>
      </h3>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search for issues in the original repository..."
      />

      <List className="mb-6" contentHeight="min-h-48 max-h-96">
        {filteredIssues.map((issue) => (
          <SelectableItem
            iconClassName={issue.type === 'bug' ? 'border-red-300 dark:border-red-700' : issue.type === 'feature' ? 'border-blue-300 dark:border-blue-700' : issue.type === 'improvement' ? 'border-green-300 dark:border-green-700' : issue.type === 'enhancement' ? 'border-purple-300 dark:border-purple-700' : 'border-gray-300 dark:border-gray-700'}
            key={issue.uri}
            id={issue.uri}
            onClick={setSelectedItem}
            selectedId={selectedItem.has(issue.uri) ? issue.uri : undefined}
          >
            <IssueLinkPanel4 {...issue} />
          </SelectableItem>
        ))}
      </List>
    </PageLikePanel >
  )
}

export default ForkLinkingPanel
