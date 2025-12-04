import React from 'react'
import QuestRow from './QuestRow'

const questData = [
  {
    task: "Write onboarding docs",
    category: "Communication",
    description: "Create clear docs to help new contributors join...",
    reward: "+3 Rep",
    rewardDetail: "+1-5 Rep depending on project's rating",
    startCondition: "When project start",
    goal: "When issue status change",
    likes: 42,
    dislikes: 3,
    discussion: "3 msg",
    issue: "1d"
  },
  {
    task: "Fix memory leak in code",
    category: "Project",
    description: "Debug and patch recurring memory usage issue.",
    reward: "+10 Rep",
    rewardDetail: "+2-10 Rep if project has high demand rating",
    startCondition: "When project start",
    goal: "When issue status change",
    likes: 65,
    dislikes: 1,
    discussion: "5 msg",
    issue: "1d"
  },
  {
    task: "Promote release on social media",
    category: "Visibility",
    description: "Share project updates with official blog online.",
    reward: "+2 Rep",
    rewardDetail: "+1-3 Rep based on social reach",
    startCondition: "When project start",
    goal: "When issue status change",
    likes: 23,
    dislikes: 5,
    discussion: "5 msg",
    issue: "1d"
  },
  {
    task: "Translate README into Spanish",
    category: "Communication",
    description: "Make project accessible to Spanish-speaking devs.",
    reward: "+5 Rep",
    rewardDetail: "+1-4 Rep if translation improves visibility",
    startCondition: "When project start",
    goal: "When issue status change",
    likes: 38,
    dislikes: 2,
    discussion: "5 msg",
    issue: "1d"
  },
  {
    task: "Implement dark mode UI",
    category: "Project",
    description: "Add a dark theme toggle to improve UX.",
    reward: "+12 Rep",
    rewardDetail: "+3-8 Rep if widely adopted by users",
    startCondition: "When project start",
    goal: "When issue status change",
    likes: 70,
    dislikes: 6,
    discussion: "5 msg",
    issue: "1d"
  },
  {
    task: "Create banner design for launch",
    category: "Visibility",
    description: "Design a banner for marketing campaign.",
    reward: "+4 Rep",
    rewardDetail: "+1-4 Rep depending on campaign's success",
    startCondition: "When project start",
    goal: "When issue status change",
    likes: 19,
    dislikes: 4,
    discussion: "5 msg",
    issue: "1d"
  }
]

const QuestTable: React.FC = () => {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800">Current Quests</h2>
        </div>
        <p className="text-gray-600">Here's a live snapshot of what quests look like on Ara:</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Task</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-left font-medium">
                <div>Reward</div>
                <div className="text-xs font-normal">Dynamic Reward</div>
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <div>Start Condition</div>
                <div className="text-xs font-normal">Goal</div>
              </th>
              <th className="px-4 py-3 text-left font-medium">Likes • Dislikes</th>
              <th className="px-4 py-3 text-left font-medium">Discussion</th>
              <th className="px-4 py-3 text-left font-medium">Issue</th>
            </tr>
          </thead>
          <tbody>
            {questData.map((quest, index) => (
              <QuestRow key={index} {...quest} />
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-500">
        <p className="text-sm text-gray-600 flex items-center">
          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
          Each quest is transparent: you see its purpose, its fixed rewards, how dynamic scaling works, community reaction, and the live discussions shaping it.
        </p>
      </div>
    </section>
  )
}

export default QuestTable
