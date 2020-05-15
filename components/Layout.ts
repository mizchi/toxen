import { useEffect, useCallback } from "preact/hooks";
import { html } from "htm/preact";

export function Layout(props: { children: any }) {
  return html`
    <div>
      <header>
        <nav>
          <a href="/">Index</a>
          |
          <a href="/foo">foo</a>
          |
          <a href="/bar">bar</a>
        </nav>
      </header>

      <main>
        ${props.children}
      </main>
      <footer>
        <hr />
        --- footer ---
      </footer>
    </div>
  `;
}
