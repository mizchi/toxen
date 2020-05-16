# Toxen

AMP and AMP Script Server on Deno

## Stack

- deno
- snowpack
- oak
- preact
- htm

## Why deno and snowpack?

`deno bundle` can bundle only local files.

snowpack download esm libs and generate its `import-map.json`.

Deno supports importMaps and `Deno.bundle(...)` (need `deno run --unstable`)

## How to dev

```
yarn install
yarn start
```

We use yarn but only for `snowpack`.

## How to build

Not yet

## TODO

- [ ] Support `_app.ts`
- [ ] Dynamic routing like `pages/[id].ts`
- [ ] Head
- [ ] `toxen out`
- [ ] Extract runner as mod

## LICENSE

MIT
