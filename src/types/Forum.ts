// Forum types

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastSeen?: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  user: User;
  role: Role;
  assignedAt: Date;
  assignedBy: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  color?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserGroup {
  user: User;
  group: Group;
  joinedAt: Date;
  invitedBy: string;
}

export interface ForumSection {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  readPermissions: string[];
  writePermissions: string[];
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  section: ForumSection;
  author: User;
  isSticky: boolean;
  isLocked: boolean;
  isActive: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  lastPostAt?: Date;
}

// API types (without related objects)
export interface TopicApi {
  id: string;
  title: string;
  content: string;
  sectionId: string;
  authorId: string;
  authorName?: string;
  isSticky: boolean;
  isLocked: boolean;
  isActive: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  lastPostAt?: Date;
}

export interface Post {
  id: string;
  content: string;
  topic: Topic;
  author: User;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  editedBy?: string;
  editedAt?: Date;
  editReason?: string;
}

// API types (without related objects)
export interface PostApi {
  id: string;
  content: string;
  topicId: string;
  authorId: string;
  authorName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  editedBy?: string;
  editedAt?: Date;
  editReason?: string;
  replyTo?: string; // ID of the post this message replies to
  postNumber?: number; // Post number in the topic (for display)
}

export interface ImageUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  isActive: boolean;
}

export interface UserActionLog {
  id: string;
  user: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  metadata?: string;
}

// Types for creation/update
export interface CreateUserInput {
  username: string;
  email: string;
  avatar?: string;
}

export interface CreateTopicInput {
  title: string;
  content: string;
  sectionId: string;
}

export interface CreatePostInput {
  content: string;
  topicId: string;
  replyTo?: string; // ID of the post this message replies to
}

export interface CreateSectionInput {
  name: string;
  description?: string;
  order?: number;
  readPermissions?: string[];
  writePermissions?: string[];
}

// Types for access rights
export interface Permission {
  resource: string; // 'topic', 'post', 'section', etc.
  action: string; // 'create', 'read', 'update', 'delete', 'moderate'
  conditions?: Record<string, any>; // additional conditions
}

export interface UserPermissions {
  userId: string;
  roles: Role[];
  groups: Group[];
  permissions: Permission[];
}

// Types for moderation
export interface ModerationAction {
  type: 'warn' | 'ban' | 'delete' | 'edit' | 'lock' | 'sticky';
  targetId: string; // ID of the post/topic/user
  targetType: 'post' | 'topic' | 'user';
  reason: string;
  duration?: number; // for temporary bans in minutes
  moderatorId: string;
  createdAt: Date;
}

// Types for anti-spam
export interface SpamCheck {
  userId: string;
  action: string;
  content?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface SpamResult {
  isSpam: boolean;
  score: number;
  reasons: string[];
  action: 'allow' | 'moderate' | 'block';
} 