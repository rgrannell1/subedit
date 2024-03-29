import * as SubEdit from "../src/mod.ts";
import * as Peach from "https://deno.land/x/peach_ts@0.2.0/src/mod.ts";
import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";

const sampleNumbers = Peach.String.from(
  Peach.String.digit(Peach.Number.uniform),
  Peach.Number.uniform(1, 10),
);

const sampleLetters = Peach.String.from(
  Peach.String.letters(Peach.Number.uniform),
  Peach.Number.uniform(1, 10),
);

Deno.test({
  name: "EachMatch.view: if the input is empty, .view returns no parts",
  fn() {
    const traversal = SubEdit.EachMatch(/[a-z]+/gd);

    assertEquals(traversal.view(""), []);
  },
});

Deno.test({
  name: "EachMatch.view: if the pattern never matches, .view returns no parts",
  fn() {
    const traversal = SubEdit.EachMatch(/[a-z]+/gd);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      assertEquals(traversal.view(whole), []);
    }
  },
});

Deno.test({
  name:
    "EachMatch.view: if the pattern matches each character, .view acts as split",
  fn() {
    const traversal = SubEdit.EachMatch(/[0-9]/gd);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      assertEquals(traversal.view(whole), whole.split(""));
    }
  },
});

Deno.test({
  name:
    "EachMatch.modify: if the input is empty, .modify acts as an identity function",
  fn() {
    const traversal = SubEdit.EachMatch(/[a-z]+/gd);

    assertEquals(
      traversal.modify(() => {
        throw Error("bang");
      }, ""),
      "",
    );
  },
});

Deno.test({
  name:
    "EachMatch.modify: if the pattern never matches, .modify acts as an identity function",
  fn() {
    const traversal = SubEdit.EachMatch(/[a-z]+/gd);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      const updated = traversal.modify(() => {
        throw Error("bang");
      }, whole);

      assertEquals(updated, whole);
    }
  },
});

Deno.test({
  name:
    "EachMatch.modify: elementwise uppercasing is the same as String.toUpperCase",
  fn() {
    const traversal = SubEdit.EachMatch(/[a-z]+/gd);

    for (const whole of Peach.Array.from(sampleLetters, 100)()) {
      const updated = traversal.modify((letter: string) => {
        return letter.toUpperCase();
      }, whole);

      assertEquals(updated, whole.toUpperCase());
    }
  },
});

Deno.test({
  name:
    "EachMatch.modify: elementwise uppercasing is the same as String.toUpperCase",
  fn() {
    const traversal = SubEdit.EachMatch(/polo/gd);
    const dialogue = Peach.String.from(
      Peach.Logic.oneOf(Peach.Number.uniform, ["marco", "polo"]),
      Peach.Number.uniform(1, 10),
    );

    for (const whole of Peach.Array.from(dialogue, 100)()) {
      const updated = traversal.modify((polo: string) => {
        return polo.toUpperCase();
      }, whole);

      const replaced = whole.replace(/polo/g, "POLO");
      assertEquals(updated, replaced);
    }
  },
});

Deno.test({
  name: "EachMatch.modify: modify is invoked elementwise",
  fn() {
    const numberPairs = SubEdit.EachMatch(/[0-9]{2}/dg);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      const expectedLength0 = numberPairs.view(whole);

      let actualLength0 = 0;
      numberPairs.modify((pair: string) => {
        actualLength0 += 1;
        return pair;
      }, whole);

      assertEquals(expectedLength0, expectedLength0);
    }
  },
});

Deno.test({
  name: "EachGroupMatch.modify: modify is invoked elementwise",
  fn() {
    const numberPairsGroup = SubEdit.EachGroupMatch(/([0-9]){2}/dg, 1);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      const expectedLength1 = numberPairsGroup.view(whole);

      let actualLength1 = 0;
      numberPairsGroup.modify((pair: string) => {
        actualLength1 += 1;
        return pair;
      }, whole);

      assertEquals(expectedLength1, expectedLength1);
    }
  },
});

// ++++ Traversal Composition ++++ //
Deno.test({
  name:
    "Traversal.composePrism.view: an always match prism acts as the original traversal",
  fn() {
    const digit = SubEdit.EachMatch(/[0-9]/dg);
    const digitPrism = SubEdit.MaybeMatch(/[0-9]/d);

    const composed = digit.composePrism(digitPrism);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      assertEquals(composed.view(whole), digit.view(whole));
    }
  },
});

Deno.test({
  name:
    "Traversal.composePrism.view: an always match prism acts as the original traversal",
  fn() {
    const digit = SubEdit.EachMatch(/[0-9]/dg);
    const digitPrism = SubEdit.MaybeMatch(/[0-9]{2}/d);

    const composed = digit.composePrism(digitPrism);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      assertEquals(composed.view(whole), []);
    }
  },
});
