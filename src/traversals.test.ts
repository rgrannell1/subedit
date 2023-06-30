import * as Peach from "../../peach.ts/src/mod.ts";
import * as SubEdit from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";

import { Traversals } from "./traversals.ts";

const sampleText = Peach.String.from(
  Peach.String.blocks.myanmarExtendedA(Peach.Number.uniform),
  Peach.Number.uniform(0, 100),
);

Deno.test({
  name: "Traversals.union.view: union() == []",
  fn() {
    const unioned = Traversals.union();

    for (const tcase of Peach.Array.from(sampleText, 100)()) {
      assertEquals(unioned.view(tcase), []);
    }
  },
});

Deno.test({
  name: "Traversals.union.view: union(traversal) ~ traversal",
  fn() {
    const traversal = SubEdit.EachMatch(/.{3}/gd);
    const unioned = Traversals.union(traversal);

    for (const tcase of Peach.Array.from(sampleText, 100)()) {
      assertEquals(unioned.view(tcase), traversal.view(tcase));
    }
  },
});

Deno.test({
  name:
    "Traversals.union.view: union(traversal, traversal) ~ traversal + traversal",
  fn() {
    const traversal = SubEdit.EachMatch(/.{3}/gd);
    const unioned = Traversals.union(traversal, traversal);

    for (const tcase of Peach.Array.from(sampleText, 100)()) {
      assertEquals(
        unioned.view(tcase),
        traversal.view(tcase).concat(traversal.view(tcase)),
      );
    }
  },
});
