/**
 * Mautic API Type Definitions
 */

export interface MauticConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
}

export interface OAuth2TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
}

export interface MauticContact {
  id?: number;
  dateAdded?: string;
  dateModified?: string;
  createdBy?: number;
  createdByUser?: string;
  modifiedBy?: number;
  modifiedByUser?: string;
  owner?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  points?: number;
  lastActive?: string;
  fields: {
    core: {
      firstname?: { value: string };
      lastname?: { value: string };
      email?: { value: string };
      company?: { value: string };
      position?: { value: string };
      phone?: { value: string };
      mobile?: { value: string };
      [key: string]: { value: string | number } | undefined;
    };
    [category: string]: {
      [key: string]: { value: string | number } | undefined;
    };
  };
  tags?: string[];
}

export interface MauticEmail {
  id?: number;
  name: string;
  subject: string;
  customHtml?: string;
  plainText?: string;
  emailType?: 'template' | 'list';
  language?: string;
  publishUp?: string;
  publishDown?: string;
  fromAddress?: string;
  fromName?: string;
  replyToAddress?: string;
  bccAddress?: string;
}

export interface MauticSegment {
  id?: number;
  name: string;
  alias?: string;
  description?: string;
  isPublished?: boolean;
  isGlobal?: boolean;
  filters?: Array<{
    glue: 'and' | 'or';
    field: string;
    object: string;
    type: string;
    operator: string;
    properties?: Record<string, any>;
    filter?: string;
  }>;
}

export interface MauticCampaign {
  id?: number;
  name: string;
  description?: string;
  isPublished?: boolean;
  publishUp?: string;
  publishDown?: string;
  allowRestart?: boolean;
}

export interface MauticApiResponse<T> {
  [key: string]: T;
}

export interface MauticError {
  code: number;
  message: string;
  details?: {
    [key: string]: string[];
  };
}

export interface ContactCreateParams {
  firstname?: string;
  lastname?: string;
  email: string;
  company?: string;
  position?: string;
  phone?: string;
  tags?: string[];
  [key: string]: any;
}

export interface EmailSendParams {
  emails: {
    [email: string]: {
      firstname?: string;
      lastname?: string;
      tokens?: Record<string, string>;
    };
  };
}
