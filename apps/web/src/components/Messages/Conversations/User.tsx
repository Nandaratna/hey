import type { Profile } from '@hey/lens';
import type { CachedConversation } from '@xmtp/react-sdk';
import type { Address } from 'viem';

import Slug from '@components/Shared/Slug';
import {
  CheckBadgeIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import { HEY_API_URL } from '@hey/data/constants';
import { useProfileQuery } from '@hey/lens';
import formatAddress from '@hey/lib/formatAddress';
import getAvatar from '@hey/lib/getAvatar';
import getLennyURL from '@hey/lib/getLennyURL';
import getProfile from '@hey/lib/getProfile';
import getStampFyiURL from '@hey/lib/getStampFyiURL';
import hasMisused from '@hey/lib/hasMisused';
import { Image } from '@hey/ui';
import isVerified from '@lib/isVerified';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { type FC } from 'react';

import LatestMessage from './LatestMessage';

interface UserProps {
  address: Address;
  conversation: CachedConversation;
}

const User: FC<UserProps> = ({ address, conversation }) => {
  const fetchUserId = async (): Promise<null | string> => {
    try {
      const response = await axios.get(`${HEY_API_URL}/messages/id`, {
        params: { address }
      });

      return response.data.id;
    } catch {
      return null;
    }
  };

  const { data: id } = useQuery({
    queryFn: fetchUserId,
    queryKey: ['fetchUserId', address]
  });

  const { data, loading } = useProfileQuery({
    skip: !id,
    variables: { request: { forProfileId: id } }
  });

  if (loading) {
    return null;
  }

  const profile = data?.profile as Profile;

  if (!profile) {
    return (
      <div className="flex items-center space-x-3">
        <Image
          alt={address}
          className="z-[1] size-11 cursor-pointer rounded-full border bg-gray-200 dark:border-gray-700"
          height={44}
          loading="lazy"
          src={getStampFyiURL(address)}
          width={44}
        />
        <div>
          <div className="font-semibold">{formatAddress(address)}</div>
          <LatestMessage conversation={conversation} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Image
        alt={profile.id}
        className="z-[1] size-11 cursor-pointer rounded-full border bg-gray-200 dark:border-gray-700"
        height={44}
        loading="lazy"
        onError={({ currentTarget }) => {
          currentTarget.src = getLennyURL(profile.id);
        }}
        src={getAvatar(profile)}
        width={44}
      />
      <div>
        <div className="flex max-w-sm flex-wrap items-center">
          <span className="font-semibold">
            {getProfile(profile).displayName}
          </span>
          <Slug
            className="ml-1 truncate text-sm"
            slug={getProfile(profile).slugWithPrefix}
          />
          {isVerified(profile.id) ? (
            <CheckBadgeIcon className="text-brand-500 ml-1 size-4" />
          ) : null}
          {hasMisused(profile.id) ? (
            <ExclamationCircleIcon className="ml-1 size-4" />
          ) : null}
        </div>
        <LatestMessage conversation={conversation} />
      </div>
    </div>
  );
};

export default User;
