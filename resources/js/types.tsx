import React from "react";

// Redecalare forwardRef
declare module "react" {
    function forwardRef<T, P = {}>(
        render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
    ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}

type DateTime = string;

export type Nullable<T> = T | null;

export type InertiaSharedProps<T = {}> = T & {
    jetstream: {
      canCreateTeams: boolean;
      canManageTwoFactorAuthentication: boolean;
      canUpdatePassword: boolean;
      canUpdateProfileInformation: boolean;
      flash: any;
      hasAccountDeletionFeatures: boolean;
      hasApiFeatures: boolean;
      hasTeamFeatures: boolean;
      hasTermsAndPrivacyPolicyFeature: boolean;
      managesProfilePhotos: boolean;
    };
    user: User & {
      all_teams?: Team[];
      current_team?: Team;
    };
    errorBags: any;
    errors: any;
    urlPrev?: string;
  };

export interface Team {
    id: number;
    name: string;
    personal_team: boolean;
    created_at: DateTime;
    updated_at: DateTime;
}

export interface User {
    id: number;
    name: string;
    email: string;
    current_team_id: Nullable<number>;
    profile_photo_path: Nullable<string>;
    profile_photo_url: string;
    profile_photo_thumb_url: string;
    two_factor_enabled: boolean;
    email_verified_at: Nullable<DateTime>;
    last_message: string;
    created_at: DateTime;
    updated_at: DateTime;
  }

  export interface Message {
    id: number,
    from: number,
    to: number,
    message: string,
    created_at: DateTime,
    updated_at: DateTime,
    deleted_at: DateTime,
    seen_by: Array<User>
  }
  
  export interface ChatRoom {
    members: Array<User>,
    admin: Array<User>,
    created_by: User,
    created_at: DateTime,
    updated_at: DateTime,
    deleted_at: DateTime
  }