import { useState, useCallback } from 'react';
import { useFriends, FriendWithProfile } from './useFriends';

export interface MentionSuggestion {
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
}

export function useMentionPrediction() {
  const { friends } = useFriends();
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  // Get mention suggestions based on partial input
  const getMentionSuggestions = useCallback((query: string): MentionSuggestion[] => {
    if (!query) {
      return friends.slice(0, 5).map(f => ({
        userId: f.user_id,
        displayName: f.display_name || 'User',
        username: f.username,
        avatarUrl: f.avatar_url,
      }));
    }

    const lowerQuery = query.toLowerCase();
    return friends
      .filter(f => 
        (f.display_name?.toLowerCase().includes(lowerQuery)) ||
        (f.username?.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 5)
      .map(f => ({
        userId: f.user_id,
        displayName: f.display_name || 'User',
        username: f.username,
        avatarUrl: f.avatar_url,
      }));
  }, [friends]);

  // Check if user is typing a mention
  const detectMention = useCallback((text: string, cursorPosition: number): {
    isMentioning: boolean;
    query: string;
    startIndex: number;
  } => {
    const textBeforeCursor = text.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      return {
        isMentioning: true,
        query: mentionMatch[1],
        startIndex: textBeforeCursor.lastIndexOf('@'),
      };
    }

    return {
      isMentioning: false,
      query: '',
      startIndex: -1,
    };
  }, []);

  // Insert a mention into text
  const insertMention = useCallback((
    text: string,
    cursorPosition: number,
    suggestion: MentionSuggestion
  ): { newText: string; newCursorPosition: number } => {
    const textBeforeCursor = text.slice(0, cursorPosition);
    const textAfterCursor = text.slice(cursorPosition);
    
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    if (mentionStart === -1) {
      return { newText: text, newCursorPosition: cursorPosition };
    }

    const mentionText = suggestion.username 
      ? `@${suggestion.username}` 
      : `@${suggestion.displayName.replace(/\s+/g, '')}`;
    
    const newText = textBeforeCursor.slice(0, mentionStart) + mentionText + ' ' + textAfterCursor;
    const newCursorPosition = mentionStart + mentionText.length + 1;

    return { newText, newCursorPosition };
  }, []);

  return {
    getMentionSuggestions,
    detectMention,
    insertMention,
    showMentions,
    setShowMentions,
    mentionQuery,
    setMentionQuery,
  };
}
