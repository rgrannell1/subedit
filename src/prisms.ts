import { AbstractPrism, Prism } from "./types.ts";

/**
 * Static methods for prisms
 *
 */
export class Prisms {

  /**
   * Construct a prism that unions a series of prisms.
   *
   * - view: returns the first non-null view of the prism series
   * - set: sets the value of the first prism that has a non-null view
   *
   */
  static union<Whole, Part>(...prisms: Prism<Whole, Part>[]) {
    return new class extends AbstractPrism<Whole, Part> {
      view(whole: Whole): Part | null {
        return prisms.reduce((part: Part | null, prism) => {
          if (part !== null) {
            return part;
          }

          return prism.view(whole);
        }, null);
      }
      set(newPart: Part, whole: Whole): Whole {
        for (const prism of prisms) {
          const part = prism.view(whole);

          if (part !== null) {
            return prism.set(newPart, whole);
          }
        }

        return whole;
      }
    }();
  }
}
