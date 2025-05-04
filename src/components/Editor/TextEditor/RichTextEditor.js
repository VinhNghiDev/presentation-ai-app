// src/components/Editor/TextEditor/RichTextEditor.js
import React, { useState, useEffect, useRef } from 'react';
import { createEditor, Transforms, Editor, Text } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import isHotkey from 'is-hotkey';

// Định nghĩa các hotkeys
const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

// Component chính
const RichTextEditor = ({ initialValue, onChange, placeholder }) => {
  // Khởi tạo editor với các plugins
  const [editor] = useState(() => withHistory(withReact(createEditor())));
  
  // Giá trị mặc định nếu không có
  const defaultValue = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  // Phân tích initialValue nếu là chuỗi
  const getInitialValue = () => {
    if (!initialValue) return defaultValue;
    
    try {
      if (typeof initialValue === 'string') {
        // Chuyển đổi chuỗi văn bản thành định dạng Slate
        return [
          {
            type: 'paragraph',
            children: initialValue.split('\n').map(line => ({
              text: line
            })),
          },
        ];
      }
      return initialValue;
    } catch (error) {
      console.error('Error parsing initialValue:', error);
      return defaultValue;
    }
  };

  // Kích hoạt onChange khi value thay đổi
  const handleChange = value => {
    const isAstChange = editor.operations.some(
      op => op.type !== 'set_selection'
    );
    
    if (isAstChange && onChange) {
      // Chuyển đổi giá trị Slate thành HTML hoặc chuỗi văn bản đơn giản
      const content = serializeToString(value);
      onChange(content);
    }
  };

  // Xử lý các hotkey
  const handleKeyDown = event => {
    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const mark = HOTKEYS[hotkey];
        toggleMark(editor, mark);
      }
    }
  };

  // Hàm chuyển đổi nội dung Slate thành chuỗi văn bản
  const serializeToString = nodes => {
    return nodes
      .map(node => {
        if (Text.isText(node)) {
          let string = node.text;
          if (node.bold) string = `**${string}**`;
          if (node.italic) string = `*${string}*`;
          if (node.underline) string = `_${string}_`;
          if (node.code) string = `\`${string}\``;
          return string;
        }
        
        if (node.children) {
          return serializeToString(node.children);
        }
        
        return '';
      })
      .join('\n');
  };

  return (
    <div className="rich-text-editor border rounded p-2">
      <Toolbar editor={editor} />
      
      <Slate editor={editor} value={getInitialValue()} onChange={handleChange}>
        <Editable
          className="p-2 min-h-[100px]" 
          placeholder={placeholder || "Nhập nội dung văn bản..."}
          onKeyDown={handleKeyDown}
          renderLeaf={props => <Leaf {...props} />}
        />
      </Slate>
    </div>
  );
};

// Component Toolbar
const Toolbar = ({ editor }) => {
  const buttons = [
    { format: 'bold', icon: 'bi-type-bold' },
    { format: 'italic', icon: 'bi-type-italic' },
    { format: 'underline', icon: 'bi-type-underline' },
    { format: 'code', icon: 'bi-code' },
  ];

  return (
    <div className="toolbar border-bottom p-1 mb-2 d-flex gap-1">
      {buttons.map((button, index) => (
        <ToolbarButton 
          key={index} 
          format={button.format} 
          icon={button.icon} 
          editor={editor} 
        />
      ))}
      
      <div className="ms-2 border-start ps-2">
        <select 
          className="form-select form-select-sm"
          onChange={e => {
            // Thêm logic để thay đổi font size
            const fontSize = e.target.value;
            Transforms.setNodes(
              editor,
              { fontSize },
              { match: Text.isText, split: true }
            );
          }}
        >
          <option value="">Font Size</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="28px">28px</option>
          <option value="32px">32px</option>
        </select>
      </div>
      
      <div className="ms-2">
        <input 
          type="color" 
          className="form-control form-control-sm"
          style={{ width: '40px', padding: '2px' }}
          onChange={e => {
            // Thêm logic để thay đổi màu chữ
            const color = e.target.value;
            Transforms.setNodes(
              editor,
              { color },
              { match: Text.isText, split: true }
            );
          }}
        />
      </div>
    </div>
  );
};

// Component nút trên toolbar
const ToolbarButton = ({ format, icon, editor }) => {
  return (
    <button
      className={`btn btn-sm ${isMarkActive(editor, format) ? 'btn-primary' : 'btn-outline-secondary'}`}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      title={format.charAt(0).toUpperCase() + format.slice(1)}
    >
      <i className={`bi ${icon}`}></i>
    </button>
  );
};

// Component Leaf cho việc render text
const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  // Áp dụng các style khác nếu có
  const style = {
    ...(leaf.fontSize && { fontSize: leaf.fontSize }),
    ...(leaf.color && { color: leaf.color }),
  };

  return (
    <span {...attributes} style={style}>
      {children}
    </span>
  );
};

// Helpers
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export default RichTextEditor;