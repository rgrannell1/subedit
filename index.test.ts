import * as Mod from "./index.ts";

import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";

class Optics {
  static number = Mod.MaybeMatch(/[0-9]+/);
  static numbers = Mod.EachMatch(/[0-9]+/dg);

  static urn = Mod.MaybeMatch(/urn:[^ ]+/);
  static protocol = Mod.MaybeMatch(/protocol-[a-z]+/);

  static lastDigits = Mod.EachGroupMatch(/([0-9]+)([0-9])/dg, 2);
}

/*
 * MaybeMatch
 */
Deno.test({
  name: "MaybeMatch: Optics.number.view",
  fn() {
    let tcases = [
      { whole: "", part: null },
      { whole: "123", part: "123" },
      { whole: "abc-123-def", part: "123" },
    ];

    for (const tcase of tcases) {
      const focus = Optics.number.view(tcase.whole);
      assertEquals(focus, tcase.part);
    }
  },
});

Deno.test({
  name: "MaybeMatch: Optics.number.set",
  fn() {
    let tcases = [
      { whole: "", newPart: "noop", expected: "" },
      { whole: "123", newPart: "456", expected: "456" },
      { whole: "abc-123-def", newPart: "4567", expected: "abc-4567-def" },
    ];

    for (const tcase of tcases) {
      const newWhole = Optics.number.set(tcase.newPart, tcase.whole);
      assertEquals(newWhole, tcase.expected);
    }
  },
});

Deno.test({
  name: "MaybeMatch: composition view",
  fn() {
    const urnPrococol = Optics.urn
      .composePrism(Optics.protocol);

    let tcases = [
      { whole: "++ urn:protocol-foo ++", expected: "protocol-foo" },
      { whole: "++ urn:protocol-bar ++", expected: "protocol-bar" },
      { whole: "++ urn:protocol-baz ++", expected: "protocol-baz" },
    ];

    for (const tcase of tcases) {
      const focus = urnPrococol.view(tcase.whole);

      assertEquals(focus, tcase.expected);
    }
  },
});

Deno.test({
  name: "MaybeMatch: composition set",
  fn() {
    const urnPrococol = Optics.urn
      .composePrism(Optics.protocol);

    let tcases = [
      {
        whole: "++ urn:protocol-foo ++",
        part: "foo",
        expected: "++ urn:foo ++",
      },
      {
        whole: "++ urn:protocol-bar ++",
        part: "bar",
        expected: "++ urn:bar ++",
      },
      {
        whole: "++ urn:protocol-baz ++",
        part: "baz",
        expected: "++ urn:baz ++",
      },
    ];

    for (const tcase of tcases) {
      const focus = urnPrococol.set(tcase.part, tcase.whole);
      assertEquals(focus, tcase.expected);
    }
  },
});

/*
 * EachMatch
 */
Deno.test({
  name: "EachMatch: Optics.number.view",
  fn() {
    let tcases = [
      { whole: "", parts: [] },
      { whole: "123", parts: ["123"] },
      { whole: "abc-123-def", parts: ["123"] },
      { whole: "abc-123-def-456-ghi", parts: ["123", "456"] },
    ];

    for (const tcase of tcases) {
      const focus = Optics.numbers.view(tcase.whole);
      assertEquals(focus, tcase.parts);
    }
  },
});

Deno.test({
  name: "EachMatch: Optics.number.modify",
  fn() {
    let tcases = [
      {
        whole: "",
        expected: "",
        modifier() {
          return "noop";
        },
      },
      {
        whole: "123",
        expected: "456",
        modifier() {
          return "456";
        },
      },
      {
        whole: "abc-123-def-456",
        expected: "abc-321-def-654",
        modifier(x: string) {
          return x.split("").reverse().join("");
        },
      },
    ];

    for (const tcase of tcases) {
      const newWhole = Optics.numbers.modify(tcase.modifier, tcase.whole);
      assertEquals(newWhole, tcase.expected);
    }
  },
});

Deno.test({
  name: "MaybeGroupMatch: view",
  fn() {
    let tcases = [
      { whole: "http://example.com", groups: ["http", "example.com"] },
    ];

    const url = (idx: number) => Mod.MaybeGroupMatch(/(.+)\:\/\/(.+)/d, idx)

    assertEquals(url(1).view(""), null);

    for (const tcase of tcases) {
      const firstFocus = url(1).view(tcase.whole) as any;
      const secondFocus = url(2).view(tcase.whole) as any;

      assertEquals(firstFocus, tcase.groups[0]);
      assertEquals(secondFocus, tcase.groups[1]);
    }
  },
});

Deno.test({
  name: "MaybeMatch: Optics.number.set",
  fn() {
    let tcases = [
      { whole: "", newPart: "noop", expected: "" },
      { whole: "http://google.com", newPart: "floogle", expected: "http://floogle.com" }
    ];

    const url = (idx: number) => Mod.MaybeGroupMatch(/(.+)\:\/\/(.+).com/d, idx)

    for (const tcase of tcases) {
      const updated = url(2).set(tcase.newPart, tcase.whole) as any;

      assertEquals(updated, tcase.expected);
    }
  },
});

Deno.test({
  name: "EachGroupMatch: view",
  fn() {
    let tcases = [
      { whole: "", parts: [] },
      { whole: "123\n456", parts: ["3", "6"] },
    ];

    for (const tcase of tcases) {
      const focus = Optics.lastDigits.view(tcase.whole);
      assertEquals(focus, tcase.parts);
    }
  },
});

Deno.test({
  name: "EachGroupMatch: modify",
  fn() {
    let tcases = [
      {
        whole: "",
        expected: "",
        modifier() {
          return "noop";
        },
      },
      {
        whole: "123\n456",
        expected: "129\n459",
        modifier() {
          return "9";
        },
      }
    ];


    for (const tcase of tcases) {
      const newWhole = Optics.lastDigits.modify(tcase.modifier, tcase.whole);
      assertEquals(newWhole, tcase.expected);
    }
  },
});