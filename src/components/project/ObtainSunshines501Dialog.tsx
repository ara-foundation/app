import React, { useState } from 'react';
import Button from '@/components/custom-ui/Button';
import PageLikePanel from '@/components/panel/PageLikePanel';
import SocialLink from '@/components/utilitified_decorations/SocialLink';
import { socialLinks } from '@/types/ara';

interface ObtainSunshines501DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ObtainSunshines501Dialog: React.FC<ObtainSunshines501DialogProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] flex items-center justify-center">
        <PageLikePanel title="Not Available Yet" titleCenter={true}>
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg text-center">
            You’ve already earned 100 Sunshines! Additional Sunshines will become available on the mainnet beta. Stay tuned for updates, and I'm also grateful to all contributors.          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <SocialLink link={socialLinks.github} className="flex rounded-sm w-10 h-10 items-center justify-center hover:opacity-80 transition-opacity" />
            <SocialLink link={socialLinks.twitter} className="flex rounded-sm w-10 h-10 items-center justify-center hover:opacity-80 transition-opacity" />
            <SocialLink link={socialLinks.bluesky} className="flex rounded-sm w-10 h-10 items-center justify-center hover:opacity-80 transition-opacity" />
            <SocialLink link={socialLinks.telegram} className="flex rounded-sm w-10 h-10 items-center justify-center hover:opacity-80 transition-opacity" />
            <SocialLink link={socialLinks.discord} className="flex rounded-sm w-10 h-10 items-center justify-center hover:opacity-80 transition-opacity" />
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              variant="primary"
              onClick={onClose}
              size="md"
            >
              Close
            </Button>
          </div>
        </PageLikePanel>
      </div>
    </>
  );
};

export default ObtainSunshines501Dialog;

