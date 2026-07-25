import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { searchFriendsAsync } from '@/redux/features/userThunks';
import { type AppDispatch } from '@/redux/store';

interface Suggestion {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
}

interface MentionTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChangeValue: (val: string) => void;
  containerClassName?: string;
}

export const MentionTextarea: React.FC<MentionTextareaProps> = ({
  value,
  onChangeValue,
  containerClassName = '',
  className = '',
  placeholder,
  rows = 4,
  onKeyDown,
  ...props
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionTriggerIndex, setMentionTriggerIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync auto-resize or focus if autoFocus is present
  useEffect(() => {
    if (props.autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [props.autoFocus]);

  // Auto-grow height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${scrollHeight}px`;

    // Only show scrollbar when content is larger than 5 rows (approx 96px)
    if (scrollHeight > 96) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch users when searchQuery changes
  useEffect(() => {
    if (!showDropdown || !searchQuery) {
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const data = await dispatch(searchFriendsAsync(searchQuery)).unwrap();
        setSuggestions(data);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Failed to fetch user suggestions', err);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, showDropdown, dispatch]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChangeValue(val);

    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = val.substring(0, selectionStart);

    // Look for the last '@' sign in the text before the cursor
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');

    if (lastAtIdx !== -1) {
      // Ensure there's a space, newline or it is the start of the string before the '@'
      const charBeforeAt = lastAtIdx > 0 ? textBeforeCursor[lastAtIdx - 1] : '';
      const isWordStart = charBeforeAt === '' || /\s/.test(charBeforeAt);

      if (isWordStart) {
        const textAfterAt = textBeforeCursor.substring(lastAtIdx + 1);
        // Only trigger mention if the query matches username format (no spaces)
        if (!/\s/.test(textAfterAt)) {
          setShowDropdown(true);
          setSearchQuery(textAfterAt);
          setMentionTriggerIndex(lastAtIdx);
          return;
        }
      }
    }

    setShowDropdown(false);
    setSuggestions([]);
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    if (mentionTriggerIndex === -1 || !textareaRef.current) return;

    const val = value;
    const selectionStart = textareaRef.current.selectionStart;
    const textBeforeMention = val.substring(0, mentionTriggerIndex);
    const textAfterCursor = val.substring(selectionStart);

    // Insert @id followed by a space
    const insertedText = `@${suggestion.id} `;
    const newValue = textBeforeMention + insertedText + textAfterCursor;

    onChangeValue(newValue);
    setShowDropdown(false);

    // Restore focus and put cursor after the inserted mention
    const newCursorPos = mentionTriggerIndex + insertedText.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showDropdown && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectSuggestion(suggestions[selectedIndex]);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowDropdown(false);
        return;
      }
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className={`relative ${containerClassName}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={className}
        {...props}
      />

      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 z-50 bottom-full mb-1.5 max-h-[225px] overflow-y-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => selectSuggestion(suggestion)}
              className={`flex items-center gap-2.5 cursor-pointer rounded-md px-3 py-2 transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/60'
              }`}
            >
              <img
                src={suggestion.avatar || 'https://i.pravatar.cc/150'}
                alt={suggestion.fullName}
                className="h-7 w-7 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">{suggestion.fullName}</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  @{suggestion.username}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
