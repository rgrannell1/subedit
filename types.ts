
/*
 * A prism is an optic that:
 * - may or may not return a part
 * - may or may not update a whole, depending if the part was found
 */
export interface Prism <Whole, Part> {
  view(whole: Whole): Part | null
  set(newPart: Part, whole: Whole): Whole
}

/*
 * A traversal is an optic (sorry if this is misnamed!) that:
 * - views 0...n parts
 * - modifies the whole at the site of 0...n parts
 */
export interface Traversal<Whole, Part> {
  view(whole: Whole): Part[]
  modify(modifier: (part: Part) => Part, whole: Whole): Whole
}