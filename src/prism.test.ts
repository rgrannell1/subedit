import * as SubEdit from "../src/mod.ts";
import * as Peach from "https://deno.land/x/peach_ts@0.2.0/src/mod.ts";
import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";

const sampleNumbers = Peach.String.from(
  Peach.String.digit(Peach.Number.uniform),
  Peach.Number.uniform(1, 10),
);

const sampleNumberPairs = Peach.Array.concat(sampleNumbers, sampleNumbers);

// ++++ MaybeMatch ++++ //
Deno.test({
  name: "MaybeMatch.view: if the pattern never matches, .view is nulpotent",
  fn() {
    const prism = SubEdit.MaybeMatch(/[a-z]+/d);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      assertEquals(prism.view(whole), null);
    }
  },
});

Deno.test({
  name:
    "MaybeMatch.view: if the pattern matches the full string, .view is idempotent",
  fn() {
    const prism = SubEdit.MaybeMatch(/[0-9]+/d);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      assertEquals(prism.view(whole), whole);
    }
  },
});

Deno.test({
  name:
    "MaybeMatch.view: if the pattern matches the first n characters in a string, .view returns a string prefix",
  fn() {
    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      const prefixSize = Peach.Number.uniform(0, 100)();
      const part = whole.slice(0, prefixSize);

      const prism = SubEdit.MaybeMatch(
        new RegExp(`[0-9]{${prefixSize}}`, "d"),
      );

      if (part.length < prefixSize) {
        continue;
      }

      assertEquals(prism.view(whole), part);
    }
  },
});

Deno.test({
  name: "MaybeMatch.set: if the pattern never matches, .set is idempotent",
  fn() {
    const prism = SubEdit.MaybeMatch(/[a-z]+/d);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      assertEquals(prism.set("never", whole), whole);
    }
  },
});

Deno.test({
  name:
    "MaybeMatch.set: if the pattern always entirely matches, .set returns the part provided",
  fn() {
    const prism = SubEdit.MaybeMatch(/[0-9]+/d);

    for (const [part, whole] of Peach.Array.from(sampleNumberPairs, 100)()) {
      assertEquals(prism.set(part, whole), part);
    }
  },
});

// ++++ MaybeGroupMatch ++++ //
Deno.test({
  name:
    "MaybeGroupMatch.view: if the pattern never matches, .view is nulpotent",
  fn() {
    const prism = SubEdit.MaybeGroupMatch(/[a-z]+/d, 1);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      assertEquals(prism.view(whole), null);
    }
  },
});

Deno.test({
  name:
    "MaybeGroupMatch.view: if the pattern matches the full string, .view is idempotent",
  fn() {
    const prism = SubEdit.MaybeGroupMatch(/([0-9]+)/d, 1);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      assertEquals(prism.view(whole), whole);
    }
  },
});

Deno.test({
  name:
    "MaybeGroupMatch.view: if the pattern matches the first n characters in a string, .view returns a string prefix",
  fn() {
    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      const prefixSize = Peach.Number.uniform(0, 100)();
      const part = whole.slice(0, prefixSize);

      const prism = SubEdit.MaybeGroupMatch(
        new RegExp(`([0-9]{${prefixSize}})`, "d"),
        1,
      );

      if (part.length < prefixSize) {
        continue;
      }

      assertEquals(prism.view(whole), part);
    }
  },
});

Deno.test({
  name: "MaybeGroupMatch.view: view only shows the relevant focus",
  fn() {
    const firstFocusPrism = SubEdit.MaybeGroupMatch(/([0-9]+)-([0-9]+)/d, 1);
    const secondFocusPrism = SubEdit.MaybeGroupMatch(/([0-9]+)-([0-9]+)/d, 2);

    for (const [first, second] of Peach.Array.from(sampleNumberPairs, 100)()) {
      const whole = `${first}-${second}`;

      assertEquals(firstFocusPrism.view(whole), first);
      assertEquals(secondFocusPrism.view(whole), second);
    }
  },
});

Deno.test({
  name: "MaybeGroupMatch.set: if the pattern never matches, .set is idempotent",
  fn() {
    const prism = SubEdit.MaybeGroupMatch(/([a-z]+)/d, 1);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      assertEquals(prism.set("never", whole), whole);
    }
  },
});

Deno.test({
  name:
    "MaybeGroupMatch.set: if the pattern always entirely matches, .set returns the part provided",
  fn() {
    const prism = SubEdit.MaybeGroupMatch(/([0-9]+)/d, 1);

    for (const [part, whole] of Peach.Array.from(sampleNumberPairs, 100)()) {
      assertEquals(prism.set(part, whole), part);
    }
  },
});

Deno.test({
  name: "MaybeGroupMatch.set: set only updates the relevant focus",
  fn() {
    const firstFocusPrism = SubEdit.MaybeGroupMatch(/([0-9]+)-([0-9]+)/d, 1);
    const secondFocusPrism = SubEdit.MaybeGroupMatch(/([0-9]+)-([0-9]+)/d, 2);

    const samples = Peach.Array.concat(
      sampleNumbers,
      sampleNumbers,
      sampleNumbers,
      sampleNumbers,
    );

    for (
      const [first, second, firstPart, secondPart] of Peach.Array.from(
        samples,
        100,
      )()
    ) {
      const whole = `${first}-${second}`;

      assertEquals(
        firstFocusPrism.set(firstPart, whole),
        `${firstPart}-${second}`,
      );
      assertEquals(
        secondFocusPrism.set(secondPart, whole),
        `${first}-${secondPart}`,
      );
    }
  },
});

// ++++ Prism Composition ++++ //
Deno.test({
  name: "Prism.composePrism: identity composition is idempotent",
  fn() {
    const identity = SubEdit.MaybeMatch(/.*/d);

    for (const [part, whole] of Peach.Array.from(sampleNumberPairs, 100)()) {
      assertEquals(identity.view(whole), whole);

      assertEquals(
        identity.view(whole),
        identity.composePrism(identity).view(whole),
      );

      assertEquals(
        identity.set(part, whole),
        identity.composePrism(identity).set(part, whole),
      );
    }
  },
});
