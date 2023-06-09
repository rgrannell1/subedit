/*
 * A prism is an optic that:
 * - may or may not return a part
 * - may or may not update a whole, depending if the part was found
 */
export interface Prism<Whole, Part> {
  view(whole: Whole): Part | null;
  set(newPart: Part, whole: Whole): Whole;
}

export abstract class AbstractPrism<Whole, Part> implements Prism<Whole, Part> {
  abstract view(whole: Whole): Part | null;
  abstract set(newPart: Part, whole: Whole): Whole;

  composePrism<SubPart>(
    secondPrism: Prism<Part, SubPart>,
  ): Prism<Whole, SubPart> {
    let self = this;

    return new class extends AbstractPrism<Whole, SubPart> implements Prism<Whole, SubPart> {
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
}

export abstract class AbstractTraversal<Whole, Part> implements Traversal<Whole, Part> {
  abstract view(whole: Whole): Part[];
  abstract modify(modifier: (part: Part) => Part, whole: Whole): Whole;
}
