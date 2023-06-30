import * as Peach from "../../peach.ts/src/mod.ts";
import * as SubEdit from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";

import { Prisms } from "./prisms.ts";

const sampleText = Peach.String.from(
  Peach.String.blocks.myanmarExtendedA(Peach.Number.uniform),
  Peach.Number.uniform(0, 100),
);

Deno.test({
  name: "Prisms.union.view: union() == null",
  fn() {
    const unioned = Prisms.union();

    for (const tcase of Peach.Array.from(sampleText, 100)()) {
      assertEquals(unioned.view(tcase), null);
    }
  },
});

Deno.test({
  name: "Prisms.union.view: union(prism_0, prism_0, ...) == prism_0",
  fn() {
    const prism = SubEdit.MaybeMatch(/.{3}/d);
    const unioned = Prisms.union(
      ...Peach.Array.from(prism, Peach.Number.uniform(1, 10))(),
    );

    for (const tcase of Peach.Array.from(sampleText, 100)()) {
      assertEquals(unioned.view(tcase), prism.view(tcase));
    }
  },
});

Deno.test({
  name: "Prisms.union.set: union() == null",
  fn() {
    const unioned = Prisms.union();

    for (const tcase of Peach.Array.from(sampleText, 100)()) {
      assertEquals(unioned.set("update", tcase), tcase);
    }
  },
});

Deno.test({
  name: "Prisms.union.set: union(prism_0, prism_0, ...) == prism_0",
  fn() {
    const prism = SubEdit.MaybeMatch(/.{3}/d);
    const unioned = Prisms.union(prism);

    for (const tcase of Peach.Array.from(sampleText, 100)()) {
      assertEquals(unioned.set("update", tcase), prism.set("update", tcase));
    }
  },
});
