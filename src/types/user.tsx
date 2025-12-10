import { AllPersonaRatings } from '../components/rating/ProfileRatingPanel'
import { RatingType, ProfileRatingProps } from '../components/rating/ProfileRating'
import { LinkProps, ComponentProps } from '@/types/eventTypes'

export interface ProfileLink extends LinkProps, Omit<ComponentProps, 'children'> {
  rating?: ProfileRatingProps
}

export interface ProfileProps extends ProfileLink {
  selfProfile: boolean
  description: string
  subtitle?: string
  socialLinks?: ProfileSocialLink[]
  ratings: AllPersonaRatings
  topRating: RatingType
  followers: number
  following: boolean
  totalVotingPower: number
  bonusPoints: number
  projectAmount: number
}

export interface ProfileSocialLink {
  type: 'telegram' | 'github' | 'linkedin'
  url: string
}

export interface FinanceInfoProps {
  balance: number;
  cascadingBalance: number;
  totalDonated: number;
  totalReceived: number;
}

export interface WorkStyleProps {
  availabilityStatus?: string;
  // Communication style metrics
  directness?: number;
  verbal?: number;
  approach?: number;
  ideas?: number;
  // Work methodology metrics
  faceToFace?: number;
  bigPicture?: number;
  workEthics?: number;
  // Collaboration style metrics
  research?: number;
  teamwork?: number;
  creativity?: number;
}