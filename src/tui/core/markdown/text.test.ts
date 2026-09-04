/** @brief Tests for mdToText (block → plain text). @since 0.1.1 */
import { describe, expect, test } from "bun:test";
import { colors } from "../style/colors";
import { mdToText, parseMd } from "./index";

describe("mdToText", () => {
  test("concatenates paragraph inline nodes", () => {
    const block = parseMd("hello **bold** world")[0]!;
    expect(mdToText(block, colors)).toBe("hello bold world");
  });

  test("returns codeblock content unchanged", () => {
    const block = parseMd("```\nraw\n```")[0]!;
    expect(mdToText(block, colors)).toBe("raw");
  });

  test("returns empty string for hr", () => {
    expect(mdToText({ type: "hr" }, colors)).toBe("");
  });
});
