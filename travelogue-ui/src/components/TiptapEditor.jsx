import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

export default function TiptapEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Write anything…",
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      // Returns plain text; swap for editor.getHTML() if you want rich HTML stored
      onChange(editor.getText());
    },
  });

  // Sync external value changes (e.g. when editing an existing note)
  useEffect(() => {
    if (editor && value !== editor.getText()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-wrapper">
      {/* Toolbar */}
      <div className="tiptap-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "active" : ""}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "active" : ""}
          title="Italic"
        >
          <i>I</i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "active" : ""}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <div className="tiptap-divider" />
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "active" : ""}
          title="Bullet list"
        >
          ≡
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "active" : ""}
          title="Ordered list"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "active" : ""}
          title="Blockquote"
        >
          "
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "active" : ""}
          title="Inline code"
        >
          {"<>"}
        </button>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  );
}
