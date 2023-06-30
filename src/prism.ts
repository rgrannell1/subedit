import { RegExpMatchArrayIndexed, StringPrism } from "./types.ts";

/*
 * A prism that matches a regular expression (at most once) against a string.
 *
 * - view: returns the matched string, or null if no match
 * - set: replaces the matched string with the new string, or returns the original string if no match
 */
export function MaybeMatch(pattern: RegExp) {
  if (pattern.flags.includes("g")) {
    throw new Error(
      "MaybeMatch does not support the 'g' flag on the input pattern",
    );
  }

  return new class extends StringPrism {
    view(whole: string): string | null {
      const matches = whole.match(pattern);

      return matches === null || matches.length === 0 ? null : matches[0];
    }

    indices(whole: string): number[] | null {
      const matches = whole.match(pattern) as RegExpMatchArrayIndexed;

      if (matches === null || matches.length === 0) {
        return null;
      }

      return matches.indices[0];
    }

    set(newPart: string, whole: string) {
      const matches = pattern.exec(whole);

      if (
        matches === null || matches.length === 0 || matches?.index === undefined
      ) {
        return whole;
      }

      const idx = matches.index;

      return `${whole.slice(0, idx)}${newPart}${
        whole.slice(idx + matches[0].length, whole.length)
      }`;
    }
  }();
}

/*
  * A prism that matches a regular expression with capture groups (at most once) against a string.
` *
  * - view: returns the matched capture-group, or null if no match
  * - set: replaces the matched capture-group with the new string, or returns the original string if no match
  *
  */
export function MaybeGroupMatch(pattern: RegExp, index: number) {
  if (pattern.flags.includes("g")) {
    throw new Error(
      "MaybeGroupMatch does not support the 'g' flag on the input pattern",
    );
  }

  if (!pattern.flags.includes("d")) {
    throw new Error(
      "MaybeGroupMatch requires the 'd' flag to be set on the input pattern",
    );
  }

  if (!Number.isInteger(index)) {
    throw new Error(
      "MaybeGroupMatch requires an integer index to be specified",
    );
  }

  if (index < 0) {
    throw new Error(
      "MaybeGroupMatch requires a non-negative integer index to be specified",
    );
  }

  return new class extends StringPrism {
    view(whole: string): string | null {
      const matches = whole.match(pattern);

      if (
        matches === null || matches.length < index ||
        matches[index] === undefined
      ) {
        return null;
      }

      return matches[index];
    }
    indices(whole: string): number[] | null {
      const matches = whole.match(pattern) as RegExpMatchArrayIndexed;

      if (matches === null || matches.length === 0) {
        return null;
      }

      if (matches.indices.length < index) {
        return null;
      }

      return matches.indices[index];
    }

    set(newPart: string, whole: string) {
      const matches = whole.match(pattern) as RegExpMatchArray & {
        indices: number[][];
      };

      if (
        matches === null || matches.length === 0 || matches?.index === undefined
      ) {
        return whole;
      }

      if (matches.indices.length <= index) {
        return whole;
      }

      let [groupStart, groupEnd] = matches.indices[index];

      return whole.slice(0, groupStart) +
        newPart +
        whole.slice(groupEnd, whole.length);
    }
  }();
}
