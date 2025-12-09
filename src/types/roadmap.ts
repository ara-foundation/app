export interface Patch {
  id: string
  completed: boolean
  title: string
  sunshines?: number
}

export interface Version {
  _id?: string
  galaxy: string
  tag: string
  createdTime: number
  status: 'completed' | 'active' | 'planned'
  patches: Patch[]
  maintainer: string
}

