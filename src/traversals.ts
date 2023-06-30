import { AbstractTraversal, Traversal } from "./types.ts";

/**
 * Static methods for traversals
 */
export class Traversals {
  /**
   * Construct a traversal that joins the views of multiple traversals.
   *
   * - view: returns the concatenation of the views of each traversal
   * - modify: applies the modifier to the view of each traversal
   */
  static union<Whole, Part>(...traversals: Traversal<Whole, Part>[]) {
    return new class extends AbstractTraversal<Whole, Part> {
      view(whole: Whole): Part[] {
        let parts: Part[] = [];

        for (const traversal of traversals) {
          const subparts = traversal.view(whole);
          parts = parts.concat(subparts);
        }

        return parts;
      }

      modify(modifier: (part: Part) => Part, whole: Whole) {
        return traversals.reduce((whole: Whole, traversal) => {
          return traversal.modify(modifier, whole);
        }, whole);
      }
    }();
  }
}
