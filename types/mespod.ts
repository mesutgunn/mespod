// Type definitions for MesPOD API requests and responses

// Auth types
export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface AuthRegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthRegisterResponse {
  success: boolean;
  message?: string;
}

// Etsy scraper types
export interface EtsyRequest {
  url: string;
}

export interface EtsyResponse {
  title: string;
  description: string;
  tags: string[];
  imageUrls: string[];
}

// Design generation types
export interface DesignRequest {
  baseImageUrl: string;
  stylePrompt?: string;
}

export interface DesignVariant {
  id: string;
  imageUrl: string;
  prompt: string;
}

export interface DesignResponse {
  variants: DesignVariant[];
}

// Mockup types
export interface MockupRequest {
  designImageUrl: string;
  mockupTemplateId: string;
}

export interface MockupResponse {
  mockupImageUrl: string;
}

// SEO generation types
export interface SeoRequest {
  baseTitle: string;
  baseDescription: string;
  baseTags: string[];
  mockupImageUrl: string;
}

export interface SeoResponse {
  title: string;
  description: string;
  tags: string[];
}

// User type from Prisma
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
