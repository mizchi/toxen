import { useEffect, useCallback } from "preact/hooks";
import { html } from "htm/preact";

export default () => {
  useEffect(() => {
    console.log("mounted");
  }, []);
  return html`
    <div>
      <${Foo} />
    </div>
  `;
};

function Foo() {
  const onClick = useCallback(() => {
    console.log("clicked");
  }, []);
  return html`<button onClick=${onClick}>Foo</button>`;
}
