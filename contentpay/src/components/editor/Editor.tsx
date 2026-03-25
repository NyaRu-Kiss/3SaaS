"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your content here...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-md p-4 min-h-[300px]">
        <div className="animate-pulse bg-gray-100 h-full" />
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm font-bold ${
            editor.isActive("bold") ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded text-sm italic ${
            editor.isActive("italic") ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded text-sm line-through ${
            editor.isActive("strike") ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          S
        </button>
        <span className="border-l border-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 rounded text-sm font-bold ${
            editor.isActive("heading", { level: 1 }) ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded text-sm font-bold ${
            editor.isActive("heading", { level: 2 }) ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          H2
        </button>
        <span className="border-l border-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive("bulletList") ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive("orderedList") ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          1. List
        </button>
        <span className="border-l border-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive("blockquote") ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive("codeBlock") ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Code
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[300px] text-gray-900"
      />
    </div>
  );
}
