"use client";

import {
  createElement,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import rehypeReact from "rehype-react";
import * as prod from "react/jsx-runtime";
import rehypeParse from "rehype-parse";
import { unified } from "unified";

type Components = {
  [k: string]: React.ComponentType;
};

function getProcessor(components: Components) {
  return unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeReact, {
      createElement,
      Fragment: prod.Fragment,
      jsx: prod.jsx,
      jsxs: prod.jsxs,
      components,
    } as any);
}

function useHTML(html: string, components: Components) {
  const processor = useMemo(() => getProcessor(components), [components]);
  const [Contents, setContents] = useState(createElement(Fragment));
  const effect = useCallback(
    (html: string) => {
      processor.process(html).then((file) => setContents(file.result as any));
    },
    [processor],
  );
  useEffect(() => effect(html), [html, effect]);
  return Contents;
}

export function HTML({
  html,
  components,
}: {
  html: string;
  components: Components;
}) {
  return useHTML(html, components);
}
