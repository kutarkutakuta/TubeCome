export type SentimentLevel = 'strong_positive' | 'weak_positive' | 'neutral' | 'weak_negative' | 'strong_negative' | 'unknown';

export interface SentimentConfig {
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}

export const SENTIMENT_CONFIG: Record<SentimentLevel, SentimentConfig> = {
  strong_positive: { label: '強ポジ', icon: '💚💚', color: 'text-green-800', bg: 'bg-green-100', border: 'border-green-300' },
  weak_positive:   { label: '弱ポジ', icon: '💚',   color: 'text-green-700', bg: 'bg-green-50',  border: 'border-green-200' },
  neutral:         { label: '中立',   icon: '⚪',   color: 'text-gray-700',  bg: 'bg-gray-100',  border: 'border-gray-200' },
  weak_negative:   { label: '弱ネガ', icon: '💔',   color: 'text-red-700',   bg: 'bg-red-50',    border: 'border-red-200' },
  strong_negative: { label: '強ネガ', icon: '💔💔', color: 'text-red-800',   bg: 'bg-red-100',   border: 'border-red-300' },
  unknown:         { label: '未分析', icon: 'grey_question', color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200' },
};

export function getSentimentLevel(score: number | null | undefined): SentimentLevel {
  if (score === null || score === undefined) return 'unknown';
  
  if (score >= 0.7) return 'strong_positive';
  if (score >= 0.3) return 'weak_positive';
  if (score >= -0.3) return 'neutral';
  if (score >= -0.7) return 'weak_negative';
  return 'strong_negative';
}
