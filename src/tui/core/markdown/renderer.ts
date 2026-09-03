/**
 * @brief MdNode → text and MdNode → ink React element tree renderers.
 *
 * Split from markdown.ts (359 SLOC) so each file stays under the 250 SLOC ceiling.
 * @since 0.1.1
 */
import React from "react";
import { Box, Text } from "ink";
import { colors, type ColorToken } from "../style/colors.ts";
import type { MdNode } from "./ast.ts";

/** @brief Flatten an MdNode tree to a plain-text representation for assertions. @since 0.1.1 */
type Colors = Record<ColorToken, string>;
export function mdToText(node: MdNode, _colors: Colors): string {
  switch (node.type) {
    case "text":
    case "code":
      return node.content;
    case "heading":
    case "paragraph":
      return node.inline.map((n) => mdToText(n, colors)).join("");
    case "bold":
    case "italic":
    case "blockquote":
      return node.inline.map((n) => mdToText(n, colors)).join("");
    case "link":
      return node.content;
    case "codeblock":
      return node.content;
    case "hr":
      return "";
    case "list":
      return node.items
        .map((it) => (it.type === "text" ? it.content : mdToText(it, colors)))
        .join("\n");
  }
}

/**
 * @brief Render an MdNode tree to a React element tree suitable for ink.
 * @param node Root node.
 * @return Ink element (Box/Text composition).
 * @since 0.1.1
 */
export function mdToInk(node: MdNode): React.ReactElement {
  switch (node.type) {
    case "text":
      return React.createElement(Text, null, node.content);
    case "heading":
      return React.createElement(
        Box,
        { key: `h${node.content}` },
        React.createElement(Text, { bold: true, color: colors.accent }, node.inline.map((n, i) => React.cloneElement(mdToInk(n), { key: i }))),
      );
    case "bold":
      return React.createElement(
        Text,
        { bold: true },
        node.inline.map((n, i) => React.cloneElement(mdToInk(n), { key: i })),
      );
    case "italic":
      return React.createElement(
        Text,
        { italic: true },
        node.inline.map((n, i) => React.cloneElement(mdToInk(n), { key: i })),
      );
    case "code":
      return React.createElement(Text, { color: colors.warn }, node.content);
    case "codeblock":
      return React.createElement(
        Box,
        { borderStyle: "round", borderColor: colors.fgDim, paddingX: 1, flexDirection: "column" },
        React.createElement(Text, { color: colors.fgDim }, node.content),
      );
    case "link":
      return React.createElement(
        Text,
        { color: colors.accentBlue },
        node.content,
      );
    case "blockquote":
      return React.createElement(
        Box,
        { borderStyle: "round", borderColor: colors.fgDim, paddingX: 1, flexDirection: "column" },
        React.createElement(
          Text,
          { color: colors.fgDim },
          node.inline.map((n, i) => React.cloneElement(mdToInk(n), { key: i })),
        ),
      );
    case "hr":
      return React.createElement(Box, { borderStyle: "single", borderColor: colors.fgDim });
    case "paragraph":
      return React.createElement(
        Box,
        { flexDirection: "column" },
        React.createElement(
          Text,
          null,
          node.inline.map((n, i) => React.cloneElement(mdToInk(n), { key: i })),
        ),
      );
    case "list":
      return React.createElement(
        Box,
        { flexDirection: "column" },
        node.items.map((it, i) => {
          const marker = node.ordered ? `${i + 1}.` : "•";
          return React.createElement(
            Box,
            { key: i, flexDirection: "row" },
            React.createElement(Text, { color: colors.fgDim }, `${marker} `),
            it.type === "text"
              ? React.createElement(Text, null, it.content)
              : mdToInk(it),
          );
        }),
      );
  }
}