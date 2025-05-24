/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import ReactMarkdown from "react-markdown";
import ReactMde from "react-mde";
import remarkGfm from "remark-gfm";
import Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { Pencil } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function MarkdownEditable({ updateId, value, onSave, showToolbar = true, placeholder = "Click to add update...", alternateSaves }) {

  const [editingId, setEditingId] = useState(null);
  const clearEditingId = () => setEditingId(null);

  const isEditing = editingId === updateId;

  const [draft, setDraft] = useState(value ?? "");
  const editorRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      setDraft(value ?? ""); // ✅ Reset when editing starts
    }
  }, [isEditing, value]);

  useEffect(() => {
    if (isEditing && editorRef.current) {
      const textarea = editorRef.current.querySelector("textarea");
      if (textarea) textarea.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        clearEditingId();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onSave(draft.trim());
        clearEditingId();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, draft]);

  if (isEditing) {
    return (
      <div ref={editorRef}>
        <MarkdownEditor value={draft} onChange={setDraft} showToolbar={showToolbar} />
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={clearEditingId} className="text-sm px-3 py-1 rounded bg-red-400 text-gray-800 dark:text-white  hover:underline">
            Cancel
          </button>

          {alternateSaves?.map(({ icon, onClick, title }, idx) => (
            <button
              key={idx}
              onClick={() => {
                onClick(draft.trim());
                clearEditingId();
              }}
              disabled={!draft.trim()}
              className="p-2 rounded-full border text-gray-500 border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              title={title}
            >
              {icon}
            </button>
          ))}

          {!alternateSaves && (
            <button
              onClick={() => {
                onSave(draft.trim());
                clearEditingId();
              }}
              disabled={!draft.trim()}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setEditingId(updateId)} className="cursor-pointer group">
      {value?.trim() ? (
        <MarkdownDisplay className="text-white group-hover:opacity-90">{value}</MarkdownDisplay>
      ) : (
        <div className="text-sm italic text-gray-400 flex items-center gap-1">
          <Pencil size={14} />
          {placeholder}
        </div>
      )}
    </div>
  );
}

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});

export function MarkdownEditor({ value, onChange, showToolbar = true }) {
  const [selectedTab, setSelectedTab] = useState("write");

  return (
    <div className="text-sm w-full">
      <ReactMde
        value={value}
        onChange={onChange}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        toolbarCommands={showToolbar ? undefined : []}
        generateMarkdownPreview={(markdown) => {
          console.log("Rendering preview for:", markdown);
          return Promise.resolve(converter.makeHtml(markdown));
        }}
        minEditorHeight={60}
      />
    </div>
  );
}

export function MarkdownDisplay({ children, className = "" }) {
  return (
    <div className={`markdown-display ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-lg text-gray-800 dark:text-gray-200 font-bold mt-2 mb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base text-gray-800 dark:text-gray-200 font-semibold mt-2 mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm text-gray-800 dark:text-gray-200 font-medium mt-1 mb-1">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">{children}</p>,
          ul: ({ children }) => <ul className="list-disc text-gray-800 dark:text-gray-200 list-inside text-sm mb-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal text-gray-800 dark:text-gray-200 list-inside text-sm mb-1">{children}</ol>,
          code: ({ children }) => (
            <code className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-3 italic text-sm text-gray-800 dark:text-gray-200 mb-1">
              {children}
            </blockquote>
          )
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}