'use client'
import React, { useEffect, useState } from 'react'
import type { PanelEvents } from '@/types/eventTypes'
import ProfileRatingPanel from '../rating/ProfileRatingPanel'
import Followings from '../social-network/Followings'
import VotingPower from '../social-network/VotingPower'
import MenuAvatar from '../MenuAvatar'
import Link from '../custom-ui/Link'
import { FaGithub, FaLinkedin, FaTelegram } from 'react-icons/fa'; // Import the LinkedIn icon from Font Awesome
import { getIcon } from '../icon'
import Tooltip from '../custom-ui/Tooltip'
import { BasePanel } from '../panel'
import { ProfileProps, ProfileSocialLink } from '../../types/user'
import Editable from '../custom-ui/Editable'
import { Editor } from '@tiptap/react'
import EditableMenuPanel from '../custom-ui/EditableMenuPanel'
import EditableBadge from '../badge/EditableBadge'
import { Popover } from '@base-ui-components/react/popover'
import PanelFooter from '@/components/panel/PanelFooter'
import PanelStat from '@/components/panel/PanelStat'
import YourProfileBadge from '@/components/badge/YourBadge'

const getSocialProfile = (selfProfile: boolean, social: ProfileSocialLink, setSocialUrl: (socialType: string, url: string) => void) => {
  const content = social.type === 'linkedin' ?
    <FaLinkedin color="gray" className="w-5 h-5 text-blue-500 dark:text-blue-400! hover:text-teal-800! dark:hover:text-teal-200!" /> :
    social.type === 'github' ?
      <FaGithub color="gray" className="w-5 h-5 text-blue-500 dark:text-blue-400! hover:text-teal-800! dark:hover:text-teal-200!" /> :
      <FaTelegram color="gray" className="w-5 h-5 text-blue-500 dark:text-blue-400! hover:text-teal-800! dark:hover:text-teal-200!" />

  const trigger = (
    <Link key={social.type} asNewTab={true} uri={social.url} className="flex items-center space-x-2">
      {content}
    </Link>)
  if (!selfProfile) {
    return trigger;
  }

  return <Popover.Root>
    <Popover.Trigger
      className="hyperlink flex items-center justify-center shadow-none"
    >
      {content}
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner sideOffset={8} side='bottom' className={'z-700!'}>
        <Popover.Popup className={"w-96 origin-[var(--transform-origin)] rounded-xs bg-[canvas] px-6 py-4 text-gray-900 shadow-sm shadow-gray-900 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 "}
        >
          <Popover.Arrow className="data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
            {getIcon('arrow')}
          </Popover.Arrow>
          <Popover.Title className="text-gray-500 font-medium text-md flex items-center flex-row p-1">{content} URL</Popover.Title>
          <Popover.Description className="text-gray-600 w-40">
            <input id={`${social.type}-url`} className='w-80 flex' autoFocus={true} type='url' placeholder='Enter new URL' defaultValue={social.url} onBlur={(e) => setSocialUrl(social.type, e.target.value)} />
          </Popover.Description>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
}

const ProfilePanel: React.FC<ProfileProps & PanelEvents> = ({ onActionClick, ...props }) => {
  const [value, setValue] = useState<Record<string, any>>({
    'description': props.description,
    'name': props.children || 'Unnamed',
    'subtitle': props.subtitle,
    'socialLinks': props.socialLinks,
    'avatar': props.icon,
    'followers': props.followers,
    'following': props.following,
  });
  const [saving, setSaving] = useState(false);
  const [showEditBar, setShowEditBar] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);

  // Imitating a save operation.
  useEffect(() => {
    if (saving) {
      setTimeout(() => {
        setSaving(false);
      }, 2000);
    }
  }, [saving]);

  const setSocialUrl = (socialType: string, url: string) => {
    let changed = false;
    value['socialLinks'] = value['socialLinks'].map(
      (social: ProfileSocialLink) => {
        if (social.type === socialType) {
          changed = true;
          return { ...social, url };
        }
        return social;
      });
    if (changed) {
      setValue(value);
      setSaving(true);
    }
  }

  const eventProps = {
    onActivate: () => {
      setShowEditBar(!showEditBar);
    },
    onCancel: () => {
      setShowEditBar(false);
    },
    onBlur: (id: string, e: Editor | null) => {
      if (e !== null) {
        if (value[id] !== e.getHTML()) {
          value[id] = e.getHTML();
          setValue(value);
          setSaving(true);
        }
      }
    },
    onFocus: (id: string, nameEditor: Editor | null) => {
      setEditor(nameEditor);
    },
  }

  return (
    <BasePanel className={`${saving && 'cursor-progress'}`}>
      {showEditBar && editor !== null &&
        <EditableMenuPanel
          editor={editor}
          className='fixed top-0 left-0 right-0 h-28 z-999'
        />}
      <div className="flex items-start space-x-4">
        <div className="w-16 overflow-hidden flex flex-col space-y-2 items-center">
          <MenuAvatar className='w-16 h-16' imgClassName='w-full h-full' alt={`Profile avatar of ${value['name']}`} />
          <Followings selfProfile={props.selfProfile} following={props.following} followers={props.followers} onActionClick={() => { }} />
        </div>

        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <Tooltip
              openDelay={1000}
              content={
                <div className="text-sm">
                  Name is editable for your account.
                </div>
              }
            >
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-300 flex flex-row items-center space-x-1">
                {props.selfProfile ? <Editable id="name"
                  content={value['name']}
                  editable={!saving}
                  {...eventProps}
                /> : value['name']}
                {props.selfProfile && <YourProfileBadge saving={saving} />}
                {props.selfProfile && <EditableBadge showEditBar={showEditBar} setShowEditBar={setShowEditBar} />}
              </h1>
            </Tooltip>

            <div className="flex text-right flex-col">
              <ProfileRatingPanel
                ratings={props.ratings}
                topRating={props.topRating}
              />
            </div>
          </div>

          <Tooltip
            openDelay={1000}
            content={
              <div className="text-sm">
                Subtitle is editable for your account.
              </div>
            }
          >
            <div className="text-slate-800 dark:text-slate-300 text-sm mb-1 -mt-2">
              {props.selfProfile ? <Editable id="subtitle"
                content={value['subtitle']}
                editable={!saving}
                limit={64}
                {...eventProps}
              /> : value['subtitle']}
            </div>
          </Tooltip>

          <Tooltip
            openDelay={1000}
            content={
              <div className="text-sm">
                Description is editable for your account.
              </div>
            }
          >
            <div className="text-md mb-4 text-slate-700 dark:text-slate-400">
              {props.selfProfile ? <Editable id="description"
                content={value['description']}
                editable={!saving}
                limit={2048}
                {...eventProps}
              /> : value['description']}
            </div>
          </Tooltip>

          <PanelFooter>
            <Tooltip
              openDelay={1000}
              content={
                <div className="text-sm">
                  Right click to edit the social links.
                  Only if you are the owner.
                </div>
              }
            >
              <div className='flex space-x-4'>
                {value['socialLinks'].map((social: ProfileSocialLink) => getSocialProfile(props.selfProfile, social, setSocialUrl))}
              </div>
            </Tooltip>

            <div className='flex items-center justify-center space-x-4'>
              <VotingPower totalVotingPower={props.totalVotingPower} onActionClick={() => { }} />
              <PanelStat
                href={"/data/projects?userName=" + props.id || 'any'}
                iconType="project"
                hint={`${value['name']} involved in ${props.projectAmount} projects.`}
                fill={true}
                triggerClassName='text-slate-500 dark:text-slate-400'
              >
                {props.projectAmount} Projects
              </PanelStat>
            </div>
          </PanelFooter>
        </div>
      </div>
    </BasePanel>
  )
}

export default ProfilePanel
