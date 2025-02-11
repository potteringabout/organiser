"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // Change the theme if needed
import { Card, CardContent } from "@/components/ui/card";

const MarkdownRenderer = ({ content }) => { // TODO: Use makrdown component
  return (
    <Card className="max-w-2xl mx-auto p-4 shadow-md">
      <CardContent className="prose dark:prose-invert">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{content}</ReactMarkdown>
      </CardContent>
    </Card>
  );
};

export default MarkdownRenderer;