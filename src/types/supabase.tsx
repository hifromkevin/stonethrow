export interface Link {
  id: string;
  user_id: string;
  original_url: string; // what user pasted
  canonical_url: string | null; // stripped down version of url
  domain: string | null;
  title: string | null;
  description: string | null;
  site_name: string | null;
  summary: string | null;
  category: string | null;
  content_type: 'article' | 'video' | 'tweet' | 'github'; //TODO: Update this
  status: 'new' | 'done';
  created_at: string;
  updated_at: string;
}

export interface Category {
  name: string;
  count: number;
}

interface UserIdentity {
  id: string;
  user_id: string;
  identity_data?: {
    [key: string]: any;
  };
  identity_id: string;
  provider: string;
  created_at?: string;
  last_sign_in_at?: string;
  updated_at?: string;
}
interface UserAppMetadata {
  provider?: string;
  providers?: string[];
  [key: string]: any;
}

const FactorTypes = ['totp', 'phone', 'webauthn'] as const;
const FactorVerificationStatuses = ['verified', 'unverified'] as const;
type FactorType = (typeof FactorTypes)[number];
type FactorVerificationStatus = (typeof FactorVerificationStatuses)[number];

type Factor<
  Type extends FactorType = FactorType,
  Status extends FactorVerificationStatus =
    (typeof FactorVerificationStatuses)[number],
> = {
  id: string;
  friendly_name?: string;
  factor_type: Type;
  status: Status;

  created_at: string;
  updated_at: string;
};

interface UserMetadata {
  [key: string]: any;
}

export interface User {
  id: string;
  app_metadata: UserAppMetadata;
  user_metadata: UserMetadata;
  aud: string;
  confirmation_sent_at?: string;
  recovery_sent_at?: string;
  email_change_sent_at?: string;
  new_email?: string;
  invited_at?: string;
  action_link?: string;
  email?: string;
  phone?: string;
  created_at: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string;
  updated_at?: string;
  identities?: UserIdentity[];
  is_anonymous?: boolean;
  is_sso_user?: boolean;
  factors?: (
    | Factor<FactorType, 'verified'>
    | Factor<FactorType, 'unverified'>
  )[];
  deleted_at?: string;
}
