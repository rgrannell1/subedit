/*
 * A prism is an optic that:
 * - may or may not return a part
 * - may or may not update a whole, depending if the part was found
 */
export interface Prism<Whole, Part> {
  view(whole: Whole): Part | null;
  set(newPart: Part, whole: Whole): Whole;
  modify(modifier: (part: Part) => Part, whole: Whole): Whole;
  composePrism<SubPart>(
    secondPrism: Prism<Part, SubPart>,
  ): Prism<Whole, SubPart>;
}

export abstract class AbstractPrism<Whole, Part> implements Prism<Whole, Part> {
  abstract view(whole: Whole): Part | null;
  abstract set(newPart: Part, whole: Whole): Whole;

  modify(modifier: (part: Part) => Part, whole: Whole): Whole {
    const presentPart = this.view(whole);

    if (presentPart === null) {
      return whole;
    }

    return this.set(modifier(presentPart), whole);
  }

  composePrism<SubPart>(
    secondPrism: Prism<Part, SubPart>,
  ): Prism<Whole, SubPart> {
    let self = this;

    return new class extends AbstractPrism<Whole, SubPart>
      implements Prism<Whole, SubPart> {
      /*
       * Retrieve the part from the first, then from the second. Account for nulls.
       */
      view(whole: Whole): SubPart | null {
        const firstPart = self.view(whole);

        if (firstPart === null) {
          return null;
        }

        return secondPrism.view(firstPart as Part);
      }

      /*
       * Retrieve the part from the first. Update it with a second prism,
       * and update with the newly updated part
       */
      set(newPart: SubPart, whole: Whole): Whole {
        const firstPart = self.view(whole) as Part;

        if (firstPart === null) {
          return whole;
        }

        // TODO check types
        return self.set(
          secondPrism.set(newPart, firstPart) as Part,
          whole,
        );
      }
    }();
  }
}

/*
 * A traversal is an optic (sorry if this is misnamed!) that:
 * - views 0...n parts
 * - modifies the whole at the site of 0...n parts
 */
export interface Traversal<Whole, Part> {
  view(whole: Whole): Part[];
  modify(modifier: (part: Part) => Part, whole: Whole): Whole;
  composePrism<SubPart>(prism: Prism<Part, SubPart>): Traversal<Whole, SubPart>;
}

export abstract class AbstractTraversal<Whole, Part>
  implements Traversal<Whole, Part> {
  abstract view(whole: Whole): Part[];
  abstract modify(modifier: (part: Part) => Part, whole: Whole): Whole;

  composePrism<SubPart>(
    prism: Prism<Part, SubPart>,
  ): Traversal<Whole, SubPart> {
    let self = this;

    return new class extends AbstractTraversal<Whole, SubPart>
      implements Traversal<Whole, SubPart> {
      view(whole: Whole): SubPart[] {
        // traverse the whole, and find parts
        const parts = self.view(whole);

        const subparts: SubPart[] = [];

        for (let part of parts) {
          const subpart = prism.view(part);

          // prisms can return null; do not preserve it
          if (subpart !== null) {
            subparts.push(subpart as SubPart);
          }
        }

        return subparts;
      }
      modify(modifier: (subpart: SubPart) => SubPart, whole: Whole): Whole {
        return self.modify((part: Part): Part => {
          const subpart = prism.view(part);

          if (subpart === null) {
            // no inner part to transform
            return part;
          } else {
            // modify the inner part, and set it back using the prism
            return prism.set(modifier(subpart), part);
          }
        }, whole);
      }
    }();
  }

  composeTraversal<SubPart>(
    secondTraversal: Traversal<Part, SubPart>,
  ): Traversal<Whole, SubPart> {
    let self = this;

    return new class extends AbstractTraversal<Whole, SubPart>
      implements Traversal<Whole, SubPart> {
      view(whole: Whole): SubPart[] {
        // traverse the whole, and find parts
        const parts = self.view(whole);

        let subparts: SubPart[] = [];

        for (let part of parts) {
          subparts = subparts.concat(secondTraversal.view(part));
        }

        return subparts;
      }
      modify(modifier: (subpart: SubPart) => SubPart, whole: Whole): Whole {
        return self.modify((part: Part): Part => {
          return secondTraversal.modify(modifier, part);
        }, whole);
      }
    }();
  }
}

export abstract class StringPrism extends AbstractPrism<string, string> {
  abstract indices(whole: string): number[] | null;
}

export abstract class StringTraversal extends AbstractTraversal<string, string> {
  abstract indices(whole: string): number[][];
}

export type RegExpMatchArrayIndexed = RegExpMatchArray & {
  indices: number[][];
};
