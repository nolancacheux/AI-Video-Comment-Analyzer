// VidInsight Type Definitions

export interface Video {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
}

export interface Comment {
  id: string;
  videoId: string;
  authorName: string;
  authorProfileImageUrl: string;
  text: string;
  likeCount: number;
  publishedAt: string;
  updatedAt: string;
  parentId?: string;
}

export interface CommentCategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export interface AnalysisResult {
  videoId: string;
  totalComments: number;
  analyzedAt: string;
  categories: CategoryResult[];
  sentiment: SentimentResult;
  topics: TopicResult[];
}

export interface CategoryResult {
  categoryId: string;
  categoryName: string;
  count: number;
  percentage: number;
  sampleComments: Comment[];
}

export interface SentimentResult {
  positive: number;
  neutral: number;
  negative: number;
}

export interface TopicResult {
  topic: string;
  count: number;
  keywords: string[];
  representativeComments: Comment[];
}
