// Sentiment word lists for highlighting
export const POSITIVE_WORDS = [
  "love", "loved", "loving", "amazing", "awesome", "great", "excellent",
  "fantastic", "wonderful", "perfect", "best", "incredible", "beautiful",
  "brilliant", "outstanding", "superb", "magnificent", "exceptional",
  "thank", "thanks", "appreciate", "helpful", "informative", "inspiring",
  "enjoy", "enjoyed", "enjoying", "favorite", "favourite", "good", "nice",
  "cool", "fire", "goat", "legendary", "masterpiece", "genius", "blessed"
];

export const NEGATIVE_WORDS = [
  "hate", "hated", "hating", "terrible", "awful", "worst", "bad", "horrible",
  "disgusting", "pathetic", "disappointing", "disappointed", "waste",
  "boring", "annoying", "stupid", "dumb", "trash", "garbage", "useless",
  "wrong", "false", "misleading", "clickbait", "scam", "fake", "liar",
  "dislike", "disliked", "sucks", "suck", "poor", "ridiculous", "absurd"
];

export const SUGGESTION_WORDS = [
  "should", "could", "would", "suggest", "suggestion", "recommend",
  "please", "maybe", "perhaps", "consider", "try", "hope", "wish",
  "need", "want", "improve", "better", "next", "future", "idea",
  "how about", "what if", "can you", "will you", "do more", "make more"
];

export interface HighlightedWord {
  text: string;
  type: "positive" | "negative" | "suggestion" | "normal";
  start: number;
  end: number;
}

export function highlightText(text: string): HighlightedWord[] {
  const words: HighlightedWord[] = [];

  // Create a map of all word positions
  const wordRegex = /\b[\w']+\b/g;
  let match;

  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];
    const lowerWord = word.toLowerCase();
    const start = match.index;
    const end = start + word.length;

    let type: HighlightedWord["type"] = "normal";

    if (POSITIVE_WORDS.some((pw) => lowerWord === pw || lowerWord.startsWith(pw))) {
      type = "positive";
    } else if (NEGATIVE_WORDS.some((nw) => lowerWord === nw || lowerWord.startsWith(nw))) {
      type = "negative";
    } else if (SUGGESTION_WORDS.some((sw) => lowerWord === sw || lowerWord.startsWith(sw))) {
      type = "suggestion";
    }

    words.push({ text: word, type, start, end });
  }

  return words;
}

export function getHighlightedSegments(
  text: string
): { text: string; type: HighlightedWord["type"] }[] {
  const words = highlightText(text);
  const segments: { text: string; type: HighlightedWord["type"] }[] = [];

  let lastEnd = 0;

  for (const word of words) {
    // Add any text before this word
    if (word.start > lastEnd) {
      segments.push({
        text: text.slice(lastEnd, word.start),
        type: "normal",
      });
    }

    // Add the word itself
    segments.push({
      text: text.slice(word.start, word.end),
      type: word.type,
    });

    lastEnd = word.end;
  }

  // Add any remaining text
  if (lastEnd < text.length) {
    segments.push({
      text: text.slice(lastEnd),
      type: "normal",
    });
  }

  return segments;
}
