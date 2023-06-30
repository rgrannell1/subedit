import * as SubEdit from "../src/mod.ts";
import * as Peach from "../../peach.ts/src/mod.ts";
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
  name: "EachMatch.view: if the pattern matches each character, .view acts as split",
  fn() {
    const traversal = SubEdit.EachMatch(/[0-9]/gd);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      assertEquals(traversal.view(whole), whole.split(''));
    }
  },
});

Deno.test({
  name: "EachMatch.modify: if the input is empty, .modify acts as an identity function",
  fn() {
    const traversal = SubEdit.EachMatch(/[a-z]+/gd);

    assertEquals(traversal.modify(() => {
      throw Error('bang')
    }, ""), "");
  },
});

Deno.test({
  name: "EachMatch.modify: if the pattern never matches, .modify acts as an identity function",
  fn() {
    const traversal = SubEdit.EachMatch(/[a-z]+/gd);

    for (const whole of Peach.Array.from(sampleNumbers, 100)()) {
      const updated = traversal.modify(() => {
        throw Error('bang')
      }, whole);

      assertEquals(updated, whole);
    }
  },
});

Deno.test({
  name: "EachMatch.modify: elementwise uppercasing is the same as String.toUpperCase",
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
  name: "EachMatch.modify: elementwise uppercasing is the same as String.toUpperCase",
  fn() {
    const traversal = SubEdit.EachMatch(/polo/gd);
    const dialogue = Peach.String.from(
      Peach.Logic.oneOf(Peach.Number.uniform, ['marco', 'polo']),
      Peach.Number.uniform(1, 10))

    for (const whole of Peach.Array.from(dialogue, 100)()) {
      const updated = traversal.modify((polo: string) => {
        return polo.toUpperCase();
      }, whole);

      const replaced = whole.replace(/polo/g, 'POLO')
      assertEquals(updated, replaced);
    }
  },
});
