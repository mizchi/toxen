import { html } from "htm/preact";
import { Layout } from "../components/Layout.ts";

export default () => {
  return html`
    <${Layout}>
      <div>hello</div>
    <//>
  `;
};
