import Link from "next/link";
import { memo, Children, isValidElement } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";

const components: Partial<Components> = {
  // @ts-expect-error
  code: CodeBlock,
  pre: ({ children }) => <>{children}</>,
  // Override paragraph to prevent nesting invalid elements
  // Override paragraph rendering to handle code blocks properly
  p: ({ node, children, ...props }) => {
    // Check if children contains a pre or div element
    const hasInvalidChild = Children.toArray(children).some(
      (child) =>
        isValidElement(child) &&
        (child.type === "pre" ||
          child.props?.node?.tagName === "pre" ||
          child.props?.node?.tagName === "div" ||
          child.props?.className?.includes("not-prose"))
    );

    // If it has an invalid child, render without the paragraph wrapper
    if (hasInvalidChild) {
      return <>{children}</>;
    }

    // Otherwise, render as a normal paragraph
    return <p {...props}>{children}</p>;
  },
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    const { href } = props;
    const isExternal = href?.startsWith("http") || href?.startsWith("mailto:");

    if (isExternal) {
      return (
        <a
          href={href || "#"}
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href || "#"} className="text-blue-500 hover:underline">
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
