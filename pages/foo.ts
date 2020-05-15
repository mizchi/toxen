import { useEffect, useCallback } from "preact/hooks";
import { html } from "htm/preact";
import { Layout } from "../components/Layout.ts";

export default () => {
  useEffect(() => {
    console.log("mounted");
  }, []);
  return html`
    <${Layout}>
      <${Foo} />
    <//>
  `;
};

function Foo() {
  const onClick = useCallback(() => {
    console.log("clicked");
  }, []);
  return html`<button onClick=${onClick}>Foo</button>`;
}
