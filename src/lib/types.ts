export type Priority = 'high' | 'medium' | 'low';
export type Access = 'Owner' | 'Can edit' | 'Can comment' | 'Can view';
export type MockName = 'search' | 'compare' | 'signin' | 'email' | 'tokens' | 'profile';

export interface Person {
  id: string;
  name: string;
  role: string;
}

export interface Member extends Person {
  email?: string;
  access: Access;
}

/** One part of a project that gets its own feedback: a screen, a flow, a template. */
export interface Section {
  id: string;
  name: string;
  /** Background tint for its card in the updates overlay. */
  tint: string;
  /** Card size in the updates grid. */
  size: 'tall' | 'small' | 'wide';
  kind: 'mock' | 'image' | 'figma';
  mock?: MockName;
  url?: string;
  /** Where the screen sits on the canvas, in canvas pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
  priority?: Priority;
  /** AI overview of the requested changes. */
  summary?: string;
}

export interface Attachment {
  id: string;
  kind: 'link' | 'image';
  url: string;
  name?: string;
}

export interface Comment {
  id: string;
  sectionId: string;
  authorId: string;
  body: string;
  createdAt: number;
  attachments: Attachment[];
  parentId?: string;
}

export interface Task {
  id: string;
  title: string;
  sectionId?: string;
  assignee?: string;
  due?: string;
  priority: Priority;
  createdAt: number;
  doneAt?: number;
}

export interface Update {
  id: string;
  authorId: string;
  body: string;
  createdAt: number;
  resolved: string[];
  alsoSentTo: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tint: string;
  createdAt: number;
  updatedAt: number;
  sections: Section[];
  /** Section ids in the order the user arranged their cards. */
  order: string[];
  members: Member[];
  comments: Comment[];
  tasks: Task[];
  updates: Update[];
}

export interface AppState {
  version: 2;
  me: Person;
  people: Person[];
  projects: Project[];
  sidebarOpen: boolean;
}
