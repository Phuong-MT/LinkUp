import React, { useState } from 'react';

import { type MentionUser } from '@/types/post.types';

interface ExpandableTextProps {
  text: string;
  className?: string;
  maxLines?: number;
  onClick?: () => void;
  mentions?: MentionUser[];
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  className = '',
  maxLines = 5,
  onClick,
  mentions,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const lines = text.split('\n');
  const needsTruncation = lines.length > maxLines || text.length > 350;

  const handleParagraphClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const renderTextWithMentions = (txt: string) => {
    if (!txt) return '';
    // Parse @ followed by 24 hex characters representing ObjectId
    const parts = txt.split(/(@[a-fA-F0-9]{24})/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const userId = part.substring(1);
        const user = mentions?.find((m) => m.id === userId);
        if (user) {
          const displayName = user.fullName || user.username;
          return (
            <span
              key={i}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              @{displayName}
            </span>
          );
        }
      }
      return part;
    });
  };

  if (!needsTruncation) {
    return (
      <p className={className} onClick={handleParagraphClick}>
        {renderTextWithMentions(text)}
      </p>
    );
  }

  if (isExpanded) {
    return (
      <div className="mb-3">
        <p className={className} onClick={handleParagraphClick}>
          {renderTextWithMentions(text)}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-1 focus:outline-none cursor-pointer block"
        >
          Collapse
        </button>
      </div>
    );
  }

  let truncatedText = '';
  if (lines.length > maxLines) {
    // Keep first 5 lines and add ellipsis
    truncatedText = lines.slice(0, maxLines).join('\n') + '...';
  } else {
    // Character limit fallback
    truncatedText = text.substring(0, 300) + '...';
  }

  return (
    <div className="mb-3">
      <p className={className} onClick={handleParagraphClick}>
        {renderTextWithMentions(truncatedText)}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
        className="text-xs text-blue-650 dark:text-blue-400 font-semibold hover:underline mt-0.5 focus:outline-none cursor-pointer block"
      >
        See more
      </button>
    </div>
  );
};

export default ExpandableText;
