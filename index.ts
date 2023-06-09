import type { Traversal } from "./types.ts";
import { AbstractPrism } from "./types.ts";

/*
 * A prism that matches a regular expression (at most once) against a string.
 *
 * - view: returns the matched string, or null if no match
 * - set: replaces the matched string with the new string, or returns the original string if no match
 */
export function MaybeMatch(pattern: RegExp) {
  return new class extends AbstractPrism<string, string> {
    view(whole: string): string | null {
      const matches = whole.match(pattern);

      return matches === null || matches.length === 0 ? null : matches[0];
    }

    set(newPart: string, whole: string) {
      const matches = whole.match(pattern);

      if (
        matches === null || matches.length === 0 || matches?.index === undefined
      ) {
        return whole;
      }

      const idx = matches.index;

      return whole.slice(0, idx) +
        newPart +
        whole.slice(idx + matches[0].length, whole.length);
    }
  }();
}

/*
 * A traversal that matches a regular expression against a string.
 *
 * - view: returns an array of all matched strings
 * - modify: replaces all matched strings with the result of the modifier
 */
export function EachMatch(pattern: RegExp): Traversal<string, string> {
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

  return new class implements Traversal<string, string> {
    view(whole: string) {
      let parts: string[] = [];

      for (const match of whole.matchAll(pattern)) {
        parts.push(match[0]);
      }

      return parts;
    }
    modify(modifier: (part: string) => string, whole: string) {
      let parts: string[] = [];
      let start = 0;

      for (const match of whole.matchAll(pattern)) {
        const text = match[0];
        const boundaries = (match as any).indices[0];

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
