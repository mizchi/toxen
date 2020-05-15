import { exists } from "https://deno.land/std/fs/exists.ts";
import { writeFileStr } from "https://deno.land/std/fs/write_file_str.ts";
import { ensureDir } from "https://deno.land/std/fs/ensure_dir.ts";
import { Application, send, Context } from "https://deno.land/x/oak/mod.ts";

import renderToString from "preact-render-to-string";
import { h } from "preact";

const template = (body: string) => `<!doctype html>
<html ⚡>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <meta name="description" content="This is the AMP Boilerplate.">
    <link rel="preload" as="script" href="https://cdn.ampproject.org/v0.js">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <!-- Import other AMP Extensions here -->
    <style amp-custom>
    /* Add your styles here */
    </style>
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    <link rel="canonical" href=".">
    <title>My AMP Page</title>
    <script async custom-element="amp-script" src="https://cdn.ampproject.org/v0/amp-script-0.1.js"></script>
  </head>
  <body>
  <amp-script layout="container" src="http://localhost:8000/gen/foo.js">
    <div id="root">
      ${body}
    </div>
  </amp-script>
  </body>
</html>
`;

const app = new Application();
app.use(async (context) => {
  if (context.request.url.pathname.endsWith(".js")) {
    await send(context, context.request.url.pathname, {
      root: Deno.cwd() + "/dist",
    });
    return;
  }
  let target = context.request.url.pathname.replace(/^\//, "");
  target = ["", "/"].includes(target) ? "index" : target;
  try {
    if (target && (await exists(`${Deno.cwd()}/pages/${target}.ts`))) {
      const { default: Page } = await import(`./pages/${target}.ts`);
      const tempPath = Deno.cwd() + `/.cache/${target}.ts`;
      const runnerCode =
        'import { h, render } from "preact";import Page from "../pages/' +
        target +
        '.ts";render(h(Page), document.querySelector("#root"));';
      await writeFileStr(tempPath, runnerCode);
      const [, bundled] = await Deno.bundle(tempPath);
      await writeFileStr(Deno.cwd() + `/dist/gen/${target}.js`, bundled);
      context.response.headers.set("Content-Type", "text/html");
      context.response.body = template(renderToString(h(Page)));
      return;
    } else {
      context.response.headers.set("Content-Type", "text/html");
      context.response.body = "Not Found:" + target;
      return;
    }
  } catch (error) {
    console.error(error);
    context.response.headers.set("Content-Type", "text/html");
    context.response.body = error.message;
  }
});

await ensureDir(Deno.cwd() + "/.cache");
await app.listen({ port: 8000 });
