import { html } from "htm/preact";
import { useState } from "preact/hooks";

import { Layout } from "../../components/Layout.ts";

export default () => {
  const [state, setState] = useState(0);
  return html`
    <${Layout}>
      <div>slug</div>
      <button onClick=${() => setState((n: number) => n + 1)}>${state}</button>
    <//>
  `;
};
