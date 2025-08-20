export interface Category {
  id: number;
  name: string;
  iconUrl?: string | null;
  icon?: string | null;
  order: number;
  
  // 多级分类支持
  parentId?: number | null;
  parent?: Category | null;
  children?: Category[];
  
  websites?: Website[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Website {
  id: number;
  name?: string | null;
  url: string;
  iconUrl?: string | null;
  description?: string | null;
  order: number;
  isRecommended: boolean;
  categoryId: number;
  category?: Category;
  websiteTags?: WebsiteTag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: number;
  name: string;
  color?: string | null;
  description?: string | null;
  websiteTags?: WebsiteTag[];
  _count?: {
    websiteTags: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WebsiteTag {
  id: number;
  websiteId: number;
  tagId: number;
  website?: Website;
  tag?: Tag;
  createdAt: Date;
}

export interface Admin {
  id: number;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  iconUrl?: string;
  icon?: string;
  order: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: number;
}

export interface CreateWebsiteInput {
  name?: string;
  url: string;
  iconUrl?: string;
  description?: string;
  order: number;
  isRecommended?: boolean;
  categoryId: number;
}

export interface UpdateWebsiteInput extends Partial<CreateWebsiteInput> {
  id: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export interface CreateTagInput {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateTagInput extends Partial<CreateTagInput> {
  id: number;
}

export interface AddWebsiteTagInput {
  websiteId: number;
  tagId: number;
}