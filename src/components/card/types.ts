import { MatchPlayerRecord } from '@/@types/match';

export interface CardProps {
  match: MatchPlayerRecord;
  onPress?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}
