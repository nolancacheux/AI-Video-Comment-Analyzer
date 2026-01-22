"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { isValidYouTubeUrl, extractVideoId, getVideoThumbnail, isUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface UrlInputProps {
  onValidUrl: (url: string) => void;
  onSearch?: (query: string) => void;
  disabled?: boolean;
  className?: string;
}

export function UrlInput({
  onValidUrl,
  onSearch,
  disabled,
  className,
}: UrlInputProps): JSX.Element {
  const [url, setUrl] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  const validateAndTrigger = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setIsValid(null);
        setVideoId(null);
        return;
      }

      const valid = isValidYouTubeUrl(trimmed);
      setIsValid(valid);

      if (valid) {
        const id = extractVideoId(trimmed);
        setVideoId(id);
        onValidUrl(trimmed);
      } else {
        setVideoId(null);
      }
    },
    [onValidUrl]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedText = e.clipboardData.getData("text");
      setTimeout(() => validateAndTrigger(pastedText), 0);
    },
    [validateAndTrigger]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setUrl(value);

      // Check if it's a URL
      if (isUrl(value)) {
        // URL mode - validate immediately
        if (isValidYouTubeUrl(value)) {
          validateAndTrigger(value);
        } else if (!value.trim()) {
          setIsValid(null);
          setVideoId(null);
        } else {
          setIsValid(false);
          setVideoId(null);
        }
      } else {
        // Search mode - don't auto-search, wait for Enter or button click
        setIsValid(null);
        setVideoId(null);
      }
    },
    [validateAndTrigger]
  );

  const triggerSearch = useCallback(() => {
    const trimmed = url.trim();
    if (trimmed.length >= 3 && !isUrl(trimmed)) {
      onSearch?.(trimmed);
    }
  }, [url, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const trimmed = url.trim();

        // If it's a URL, validate it
        if (isUrl(trimmed)) {
          validateAndTrigger(trimmed);
        } else if (trimmed.length >= 3) {
          // Otherwise trigger search
          onSearch?.(trimmed);
        }
      }
    },
    [url, validateAndTrigger, onSearch]
  );

  const isSearchMode = url.trim().length >= 3 && !isUrl(url);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Paste a YouTube URL or search for videos..."
          value={url}
          onChange={handleChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "h-14 text-lg px-6 pr-12 transition-colors",
            isValid === true && "border-emerald-500 focus-visible:ring-emerald-500",
            isValid === false && "border-rose-500 focus-visible:ring-rose-500"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isValid === true && (
            <svg
              className="w-6 h-6 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {isValid === false && (
            <svg
              className="w-6 h-6 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          {isValid === null && isSearchMode && (
            <button
              type="button"
              onClick={triggerSearch}
              className="p-1 rounded hover:bg-muted transition-colors"
              title="Search YouTube"
            >
              <svg
                className="w-5 h-5 text-muted-foreground hover:text-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          )}
          {isValid === null && !isSearchMode && !url.trim() && (
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {isValid === false && url.trim() && isUrl(url) && (
        <p className="text-sm text-rose-500">
          Please enter a valid YouTube URL (youtube.com/watch, youtu.be, or youtube.com/shorts)
        </p>
      )}

      {videoId && (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
          <img
            src={getVideoThumbnail(videoId)}
            alt="Video thumbnail"
            className="w-32 h-20 object-cover rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Video ID: {videoId}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Press Enter or paste a URL to start analysis
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
