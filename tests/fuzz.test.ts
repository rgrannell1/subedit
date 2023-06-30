import * as Peach from "../../peach.ts/src/mod.ts";
import * as SubEdit from "../src/mod.ts";
import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";

const U = Peach.Number.uniform;

// a stretch of digits
const digitSpan = Peach.String.from(
  Peach.String.digit(U),
  U(1, 10),
);

// a stretch of letters
const letterSpan = Peach.String.from(
  Peach.String.blocks.javanese(U),
  U(1, 10),
);

// a sequence embedding a digit-span
function embeddedNumbers() {
  return () => {
    const expected = digitSpan();

    const prefix = Peach.Logic.oneOf(U, [
      letterSpan() + expected,
      expected + letterSpan(),
    ]);

    const suffix = Peach.String.from(
      Peach.Logic.oneOf(U, [digitSpan(), letterSpan()]),
      U(0, 10),
    );

    return {
      expected,
      sequence: Peach.String.concat(prefix, letterSpan, suffix)(),
    };
  };
}

const $firstNumber = SubEdit.MaybeGroupMatch(/([0-9]+)/d, 1);

Deno.test({
  name:
    "MaybeMatch: A numeric capture-group always extracts the first numeric sequence in a string",
  fn() {
    const cases = Peach.Array.from(embeddedNumbers(), 100);

    for (const { sequence, expected } of cases()) {
      assertEquals($firstNumber.view(sequence), expected);
    }
  },
});
