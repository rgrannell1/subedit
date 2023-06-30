import { AbstractPrism, Prism } from "./types.ts";

export class Prisms {
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
