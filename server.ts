import { exists } from "https://deno.land/std/fs/exists.ts";
import { writeFileStr } from "https://deno.land/std/fs/write_file_str.ts";
import { ensureDir } from "https://deno.land/std/fs/ensure_dir.ts";
import { Application, send, Context } from "https://deno.land/x/oak/mod.ts";
import { md5 } from "https://deno.land/x/md5/mod.ts";
import renderToString from "preact-render-to-string";
import { h } from "preact";
import { basename, join } from "https://deno.land/std/path/mod.ts";

const tempDir = await Deno.makeTempDir();

const template = (body: string, workerScriptName: string) =>
  `<!doctype html>
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
  <amp-script layout="container" src="http://localhost:8000/gen/${workerScriptName}.js">
    <div id="root">
      ${body}
    </div>
  </amp-script>
  </body>
</html>
`;

const app = new Application();
app.use(async (ctx) => {
  console.log("path", ctx.request.url.pathname);
  if (ctx.request.url.pathname.endsWith(".js")) {
    await send(ctx, ctx.request.url.pathname, {
      root: Deno.cwd() + "/dist",
    });
    return;
  }
  let target = ctx.request.url.pathname.replace(/^\//, "");
  target = ["", "/"].includes(target) ? "index" : target;
  const basepath = basename(target);
  if (["", "/"].includes(basepath)) {
    // target.replace(basepath)
    target = join(target, "index");
  }
  try {
    // let realpath = target;
    // if () {

    // }
    // // const existPath = );
    // const existIndexPath = await exists(
    //   `${Deno.cwd()}/pages/${target}/index.ts`,
    // );

    // target = (await exists(`${Deno.cwd()}/pages/${target}.ts`) ?
    if (target && await exists(`${Deno.cwd()}/pages/${target}.ts`)) {
      const { default: Page } = await import(`./pages/${target}.ts`);
      const hashed = md5(target);
      const html = renderToString(h(Page));
      const tempPath = Deno.cwd() + `/.cache/${hashed}.ts`;
      const runnerCode =
        'import { h, render } from "preact";import Page from "../pages/' +
        target +
        '.ts";render(h(Page), document.querySelector("#root"));';
      // console.log("tempPath", tempPath, runnerCode);
      await writeFileStr(tempPath, runnerCode);
      const [, bundled] = await Deno.bundle(tempPath);
      await writeFileStr(Deno.cwd() + `/dist/gen/${hashed}.js`, bundled);
      ctx.response.headers.set("Content-Type", "text/html");
      ctx.response.body = template(html, hashed);
      return;
    } else {
      ctx.response.headers.set("Content-Type", "text/html");
      ctx.response.body = "Not Found:" + target;
      return;
    }
  } catch (error) {
    console.error(error);
    ctx.response.headers.set("Content-Type", "text/html");
    ctx.response.body = error.message;
  }
});

await ensureDir(Deno.cwd() + "/.cache");
await ensureDir(Deno.cwd() + "/dist/gen");

await app.listen({ port: 8000 });
