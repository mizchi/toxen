import { html } from "htm/preact";
import { Layout } from "../../components/Layout.ts";
import { useState } from "preact/hooks";

export default () => {
  const [state, setState] = useState(0);
  return html`
    <${Layout}>
      <div>x</div>
      <button onClick=${() => setState((n: number) => n + 1)}>${state}</button>
    <//>
  `;
};
