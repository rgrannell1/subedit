# SubEdit [![Test](https://github.com/rgrannell1/subedit/actions/workflows/test.yaml/badge.svg)](https://github.com/rgrannell1/subedit/actions/workflows/test.yaml)

A regular-expression optic library for composable text-editing. See
https://rgrannell.xyz/posts/composable-text-editing.html for details

## Optics

SubEdit defines several optic-constructors; parameterised functions that
construct prisms or traversals suitable for viewing / updating
regular-expression matches in text.

### MaybeMatch

```ts
SubEdit.MaybeMatch(regexp): Prism<string, string>
```

Construct a prism that:

- Gets the first regular-expression match as a string (if present)
- Overrides the first regular-expression match (if present)

### EachMatch

```ts
SubEdit.EachMatch(pattern: RegExp): Traversal<string, string>
```

Construct a traversal that:

- Gets each regular-expression match as an array of strings
- Applies a modifier function to each regular-expression match, allowing
  in-place update

### EachGroupMatch

```ts
SubEdit.EachGroupMatch(pattern: RegExp, index: number): Traversal<string, string>
```

Construct a traversal that:

- Gets each regular-expression match's nth capture-group as an array of strings
- Applies a modifier function to each regular-expression's nth capture-group
  match, allowing in-place update

### MaybeGroupMatch

```ts
SubEdit.MaybeGroupMatch(pattern: RegExp, index: number): Prism<string, string>
```

Construct a prism that:

- Gets a capture-group from the first regular-expression match as a string (if
  present)
- Overrides the capture-group in the first regular-expression match (if present)

## License

The MIT License

Copyright (c) 2023 Róisín Grannell

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
