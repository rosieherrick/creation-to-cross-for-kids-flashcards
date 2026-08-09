#!/usr/bin/env node

import { unified } from "unified";
import remarkParse from "remark-parse";

async function getLessonsCount(readmeUrl = "https://github.io") {
  try {
    // 1. Fetch the raw markdown content
    const response = await fetch(readmeUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch README: ${response.status}`);
    }
    const markdownText = await response.text();

    // 2. Use a regular expression to match all occurrences of "- [Lesson X:"
    // This looks for a hyphen, space, opening bracket, the word 'Lesson', a space, and digits
    const lessonRegex = /- \[Lesson (\d+):/g;

    let maxLesson = 0;
    let match;

    // 3. Loop through all matches found in the file to find the highest number
    while ((match = lessonRegex.exec(markdownText)) !== null) {
      const lessonNumber = parseInt(match[1], 10);
      if (lessonNumber > maxLesson) {
        maxLesson = lessonNumber;
      }
    }

    return maxLesson;
  } catch (error) {
    console.error("Error parsing lessons count:", error);
    return 0; // Return 0 as a fallback if the network/parse fails
  }
}

function collectText(node) {
  if (node.type === "text") return node.value || "";
  if (!node.children) return "";
  return node.children.map(collectText).join("");
}

function collectEmphasisTexts(node) {
  const texts = [];
  function walk(n) {
    if (n.type === "emphasis") {
      texts.push(collectText(n));
      return;
    }
    if (n.children) {
      for (const c of n.children) walk(c);
    }
  }
  walk(node);
  return texts;
}

function collectQuestionFromListItem(listItemNode) {
  if (!listItemNode.children) return "";

  for (const child of listItemNode.children) {
    if (child.type === "paragraph") {
      return collectText(child).trim();
    }
  }

  let q = "";
  for (const child of listItemNode.children) {
    if (child.type === "text") {
      q += child.value || "";
    }
  }
  return q.trim();
}

function processRemarkTree(tree) {
  const results = [];

  function visit(node, fn, parent = null, depth = 0) {
    const result = fn(node, parent, depth);
    if (result === "skip") return;

    if (node.children) {
      const isList = node.type === "list" || node.type === "listItem";
      const childDepth = isList ? depth + 1 : depth;
      for (const c of node.children) {
        visit(c, fn, node, childDepth);
      }
    }
  }

  visit(tree, (node, parent, depth) => {
    if (node.type !== "listItem" || depth !== 1) return;

    const question = collectQuestionFromListItem(node);
    const answers = collectEmphasisTexts(node)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (!question) return;

    results.push({
      question,
      answers,
    });
  });

  return results;
}

async function parseQuestionsFromMarkdown(markdown) {
  const tree = unified().use(remarkParse).parse(markdown);
  return processRemarkTree(tree);
}

const totalLessons = await getLessonsCount(
  "https://rosieherrick.github.io/creation-to-cross-for-kids/lessons/README.md",
);

const allLessonsQuestions = [];

for (let i = 1; i <= totalLessons; i++) {
  const url = `https://rosieherrick.github.io/creation-to-cross-for-kids/lessons/${i}/content/questions.md`;
  try {
    const response = await fetch(url);
    if (response.ok) {
      const markdown = await response.text();
      if (markdown.trim().length > 0) {
        const questions = await parseQuestionsFromMarkdown(markdown);
        allLessonsQuestions.push({
          lesson: i,
          url,
          questions,
        });
      }
    }
  } catch (err) {
    console.error(`Failed to process lesson ${i}:`, err);
  }
}

console.log(JSON.stringify(allLessonsQuestions, null, 2));
