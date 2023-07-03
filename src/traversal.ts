import {
  RegExpMatchArrayIndexed,
  StringTraversal,
  Traversal,
} from "./types.ts";

/**
 * A traversal that matches a regular expression against a string.
 *
 * - view: returns an array of all matched strings
 * - modify: replaces all matched strings with the result of the modifier
 */
export function EachMatch(pattern: RegExp): StringTraversal {
  if (!pattern.flags.includes("d")) {
    throw new Error(
      "EachMatch requires the 'd' flag to be set on the input pattern",
    );
  }

  if (!pattern.flags.includes("g")) {
    throw new Error(
      "EachMatch requires the 'g' flag to be set on the input pattern",
    );
  }

  return new class extends StringTraversal {
    view(whole: string) {
      const parts: string[] = [];

      for (const match of whole.matchAll(pattern)) {
        parts.push(match[0]);
      }

      return parts;
    }
    indices(whole: string): number[][] {
      const slices: number[][] = [];

      for (const match of whole.matchAll(pattern)) {
        const matchIndices = (match as RegExpMatchArrayIndexed).indices[0];
        slices.push(matchIndices);
      }

      return slices;
    }

    modify(modifier: (part: string) => string, whole: string) {
      const parts: string[] = [];
      let start = 0;

      for (const match of whole.matchAll(pattern)) {
        const text = match[0];
        const boundaries = (match as RegExpMatchArrayIndexed).indices[0];

        // push text from the previous match up to this match
        parts.push(whole.slice(start, boundaries[0]));

        // push transformed text
        parts.push(modifier(text));

        start = boundaries[1];
      }

      // push the post-match remaining text
      parts.push(whole.slice(start, whole.length));

      return parts.join("");
    }
  }();
}

/**
 * A traversal that matches a regular expression's capture-group against a string.
 *
 * - view: returns an array of all matched strings
 * - modify: replaces all matched strings with the result of the modifier
 */
export function EachGroupMatch(
  pattern: RegExp,
  index: number,
): Traversal<string, string> {
  if (!pattern.flags.includes("d")) {
    throw new Error(
      "EachMatch requires the 'd' flag to be set on the input pattern",
    );
  }

  if (!pattern.flags.includes("g")) {
    throw new Error(
      "EachMatch requires the 'g' flag to be set on the input pattern",
    );
  }

  return new class extends StringTraversal {
    view(whole: string) {
      const parts: string[] = [];

      for (const match of whole.matchAll(pattern)) {
        parts.push(match[index]);
      }

      return parts;
    }
    indices(whole: string): number[][] {
      const slices: number[][] = [];

      for (const match of whole.matchAll(pattern)) {
        const matchIndices = (match as RegExpMatchArrayIndexed).indices[index];
        slices.push(matchIndices);
      }

      return slices;
    }
    modify(modifier: (part: string) => string, whole: string) {
      const parts: string[] = [];
      let start = 0;

      for (const match of whole.matchAll(pattern)) {
        const text = match[index];

        // the pattern matched, but not the group.
        // this can be legitimately empty depending on the regexp
        if (text === undefined) {
          continue
        }

        const boundaries = (match as RegExpMatchArrayIndexed).indices[index];

        // push text from the previous match up to this match
        parts.push(whole.slice(start, boundaries[0]));

        // push transformed text
        parts.push(modifier(text));

        start = boundaries[1];
      }

      // push the post-match remaining text
      parts.push(whole.slice(start, whole.length));

      return parts.join("");
    }
  }();
}
