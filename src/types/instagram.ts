// Instagram data types based on content detection

export interface Message {
  sender_name: string;
  timestamp_ms: number;
  content?: string;
  type?: string;
  photos?: Array<{ uri: string }>;
  videos?: Array<{ uri: string }>;
  share?: { link: string };
  reactions?: Array<{ reaction: string; actor: string }>;
}

export interface Conversation {
  participants: Array<{ name: string }>;
  messages: Message[];
  title?: string;
  thread_path?: string;
}

export interface LikeItem {
  title?: string;
  string_list_data?: Array<{
    href?: string;
    value?: string;
    timestamp?: number;
  }>;
  timestamp?: number;
  href?: string;
}

export interface MediaItem {
  uri?: string;
  creation_timestamp?: number;
  title?: string;
  media_metadata?: {
    photo_metadata?: any;
    video_metadata?: any;
  };
}

export interface PostItem {
  media?: MediaItem[];
  title?: string;
  creation_timestamp?: number;
}

export interface StoryItem {
  uri?: string;
  creation_timestamp?: number;
  title?: string;
}

export interface FollowerItem {
  string_list_data?: Array<{
    value?: string;
    timestamp?: number;
    href?: string;
  }>;
}

export interface CommentItem {
  title?: string;
  string_list_data?: Array<{
    value?: string;
    timestamp?: number;
  }>;
}

export interface SearchItem {
  string_map_data?: {
    Search?: { value: string; timestamp: number };
    Time?: { timestamp: number };
  };
}

export interface LoginItem {
  title?: string;
  string_map_data?: {
    "IP Address"?: { value: string };
    "User Agent"?: { value: string };
    Time?: { timestamp: number };
  };
}

export interface AdItem {
  title?: string;
  string_list_data?: Array<{
    value?: string;
    timestamp?: number;
  }>;
}

export interface SavedItem {
  title?: string;
  string_list_data?: Array<{
    href?: string;
    value?: string;
    timestamp?: number;
  }>;
}

// Processed stats types
export interface TopContact {
  username: string;
  totalMessages: number;
  sent: number;
  received: number;
  percentage: number;
  firstInteraction: Date;
  mostActiveMonth: string;
  // Extended stats for detail view
  messagesPerMonth: Record<string, number>;
  messagesPerHour: Record<number, number>;
  topWords: Array<{ word: string; count: number }>;
  topEmojis: Array<{ emoji: string; count: number }>;
  mediaStats: { 
    photos: number; videos: number; reels: number; links: number;
    reelsSent: number; reelsReceived: number;
  };
  avgResponseTime?: number;
  longestStreak: number;
  firstMessage?: { date: Date; content: string };
  lastMessage?: { date: Date; content: string };
}

export interface MessageStats {
  totalSent: number;
  totalReceived: number;
  totalConversations: number;
  messagesPerMonth: Record<string, number>;
  messagesPerDay: Record<string, number>;
  messagesPerHour: Record<number, number>;
  avgMessagesPerDay: number;
  longestStreak: number;
  longestConversation: { name: string; count: number };
  firstMessage: { date: Date; content: string; with: string } | null;
  lastMessage: { date: Date; content: string; with: string } | null;
  topContacts: TopContact[];
}

export interface LikeStats {
  totalGiven: number;
  likesPerMonth: Record<string, number>;
  likesPerHour: Record<number, number>;
  topLikedAccounts: Array<{ account: string; count: number }>;
  mediaTypeCounts: Record<string, number>;
}

export interface ContentStats {
  reels: {
    total: number;
    perMonth: Record<string, number>;
  };
  posts: {
    total: number;
    perMonth: Record<string, number>;
    mostActiveMonth: string;
  };
  stories: {
    total: number;
    perMonth: Record<string, number>;
    peakMonth: string;
  };
}

export interface ConnectionStats {
  followers: number;
  following: number;
  newFollowers: number;
  unfollowers: number;
  netGrowth: number;
  mutuals: number;
}

export interface SearchStats {
  totalSearches: number;
  topSearchedAccounts: Array<{ account: string; count: number }>;
  searchPersonality: string;
}

export interface LoginStats {
  totalLogins: number;
  devices: string[];
  mostUsedDevice: string;
  locations: string[];
}

export interface PersonalityInsight {
  tag: string;
  emoji: string;
  description: string;
  score: number;
}

export interface InstagramData {
  messages: MessageStats;
  likes: LikeStats;
  content: ContentStats;
  connections: ConnectionStats;
  searches: SearchStats;
  logins: LoginStats;
  comments: { total: number; perMonth: Record<string, number> };
  saves: { total: number };
  ads: { viewed: number; clicked: number; categories: string[] };
  personality: PersonalityInsight[];
  availableYears: number[];
  selectedYear: number;
}
