// src/components/Editor/TextEditor/RichTextEditor.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createEditor, Transforms, Editor, Text, Element as SlateElement } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { withHistory } from 'slate-history';
import { Dropdown, ButtonGroup, Button } from 'react-bootstrap';
import isHotkey from 'is-hotkey';

// Định nghĩa các hotkeys
const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  'mod+shift+s': 'strikethrough',
  'mod+shift+h': 'highlight',
};

// Các kiểu đoạn văn bản
const PARAGRAPH_TYPES = [
  { format: 'paragraph', icon: 'bi-text-paragraph', label: 'Đoạn văn' },
  { format: 'heading-one', icon: 'bi-type-h1', label: 'Heading 1' },
  { format: 'heading-two', icon: 'bi-type-h2', label: 'Heading 2' },
  { format: 'heading-three', icon: 'bi-type-h3', label: 'Heading 3' },
  { format: 'block-quote', icon: 'bi-blockquote-left', label: 'Trích dẫn' },
  { format: 'bulleted-list', icon: 'bi-list-ul', label: 'Danh sách không thứ tự' },
  { format: 'numbered-list', icon: 'bi-list-ol', label: 'Danh sách có thứ tự' },
];

// Các kiểu định dạng ký tự
const MARK_BUTTONS = [
  { format: 'bold', icon: 'bi-type-bold', label: 'Đậm' },
  { format: 'italic', icon: 'bi-type-italic', label: 'Nghiêng' },
  { format: 'underline', icon: 'bi-type-underline', label: 'Gạch chân' },
  { format: 'strikethrough', icon: 'bi-type-strikethrough', label: 'Gạch ngang' },
  { format: 'highlight', icon: 'bi-highlighter', label: 'Đánh dấu' },
  { format: 'code', icon: 'bi-code', label: 'Code' },
];

// Kích thước font
const FONT_SIZES = [
  { size: '12px', label: '12px' },
  { size: '14px', label: '14px' },
  { size: '16px', label: '16px' },
  { size: '18px', label: '18px' },
  { size: '20px', label: '20px' },
  { size: '24px', label: '24px' },
  { size: '28px', label: '28px' },
  { size: '32px', label: '32px' },
  { size: '36px', label: '36px' },
  { size: '48px', label: '48px' },
];

// Các font chữ phổ biến
const FONT_FAMILIES = [
  { family: 'Arial, sans-serif', label: 'Arial' },
  { family: 'Helvetica, sans-serif', label: 'Helvetica' },
  { family: 'Times New Roman, serif', label: 'Times New Roman' },
  { family: 'Georgia, serif', label: 'Georgia' },
  { family: 'Courier New, monospace', label: 'Courier New' },
  { family: 'Verdana, sans-serif', label: 'Verdana' },
  { family: 'Roboto, sans-serif', label: 'Roboto' },
  { family: 'Open Sans, sans-serif', label: 'Open Sans' },
  { family: 'Lato, sans-serif', label: 'Lato' },
  { family: 'Montserrat, sans-serif', label: 'Montserrat' },
];

// Căn chỉnh văn bản
const ALIGNMENTS = [
  { format: 'left', icon: 'bi-text-left', label: 'Căn trái' },
  { format: 'center', icon: 'bi-text-center', label: 'Căn giữa' },
  { format: 'right', icon: 'bi-text-right', label: 'Căn phải' },
  { format: 'justify', icon: 'bi-justify', label: 'Căn đều' },
];

// Component chính
const RichTextEditor = ({ initialValue, onChange, placeholder }) => {
  // Khởi tạo editor với các plugins
  const [editor] = useState(() => withHistory(withReact(createEditor())));
  
  // State hiển thị bảng chọn màu
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerType, setColorPickerType] = useState('text'); // 'text' hoặc 'background'
  
  // Ref cho bảng chọn màu
  const colorPickerRef = useRef(null);
  
  // Các màu có sẵn
  const PRESET_COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  ];
  
  // Giá trị mặc định nếu không có
  const defaultValue = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  // Xử lý click bên ngoài bảng chọn màu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Phân tích initialValue nếu là chuỗi
  const getInitialValue = () => {
    if (!initialValue) return defaultValue;
    
    try {
      if (typeof initialValue === 'string') {
        if (initialValue.startsWith('[') && initialValue.endsWith(']')) {
          // Nếu là JSON string, parse trực tiếp
          return JSON.parse(initialValue);
        }
        
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
      
      // Nếu đã là mảng object, sử dụng trực tiếp
      if (Array.isArray(initialValue)) {
        return initialValue;
      }
      
      return defaultValue;
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
      // Lưu trữ nội dung ở cả dạng JSON và text
      const plainText = serializeToPlainText(value);
      const jsonValue = JSON.stringify(value);
      
      // Gọi callback với nhiều định dạng nội dung
      onChange({
        plainText,
        jsonValue,
        rawValue: value // Giá trị Slate gốc
      });
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
  const serializeToPlainText = nodes => {
    return nodes
      .map(node => {
        if (Text.isText(node)) {
          return node.text;
        }
        
        if (node.children) {
          return serializeToPlainText(node.children);
        }
        
        return '';
      })
      .join('\n');
  };

  return (
    <div className="rich-text-editor border rounded">
      <Slate editor={editor} value={getInitialValue()} onChange={handleChange}>
        <div className="editor-toolbar border-bottom p-2 d-flex flex-wrap gap-1 bg-light">
          <BlockFormatDropdown />
          <div className="toolbar-divider mx-1"></div>
          
          {/* Format Marks Buttons */}
          <MarkButtonGroup />
          <div className="toolbar-divider mx-1"></div>
          
          {/* Text Alignment Buttons */}
          <AlignmentButtonGroup />
          <div className="toolbar-divider mx-1"></div>
          
          {/* Font Family Dropdown */}
          <FontFamilyDropdown />
          
          {/* Font Size Dropdown */}
          <FontSizeDropdown />
          <div className="toolbar-divider mx-1"></div>
          
          {/* Color Buttons */}
          <div className="d-flex align-items-center">
            <Button
              size="sm"
              variant="light"
              className="border d-flex align-items-center px-2 me-1"
              onClick={() => {
                setColorPickerType('text');
                setShowColorPicker(!showColorPicker);
              }}
              title="Màu chữ"
            >
              <i className="bi bi-type-color me-1"></i>
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  backgroundColor: 'currentColor',
                  border: '1px solid #ccc'
                }}
              ></div>
            </Button>
            
            <Button
              size="sm"
              variant="light"
              className="border d-flex align-items-center px-2"
              onClick={() => {
                setColorPickerType('background');
                setShowColorPicker(!showColorPicker);
              }}
              title="Màu nền"
            >
              <i className="bi bi-paint-bucket me-1"></i>
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  backgroundColor: '#ffff00',
                  border: '1px solid #ccc'
                }}
              ></div>
            </Button>
          </div>
          
          {/* Nút xóa định dạng */}
          <Button
            size="sm"
            variant="light"
            className="border ms-auto"
            onClick={() => clearFormatting(editor)}
            title="Xóa định dạng"
          >
            <i className="bi bi-eraser"></i>
          </Button>
        </div>
        
        {/* Color Picker Popover */}
        {showColorPicker && (
          <div
            ref={colorPickerRef}
            className="color-picker-popover p-2 border shadow"
            style={{
              position: 'absolute',
              zIndex: 1000,
              backgroundColor: 'white',
              width: '220px',
              borderRadius: '4px'
            }}
          >
            <div className="d-flex flex-wrap gap-1 mb-2">
              {PRESET_COLORS.map((color, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (colorPickerType === 'text') {
                      Editor.addMark(editor, 'color', color);
                    } else {
                      Editor.addMark(editor, 'backgroundColor', color);
                    }
                    setShowColorPicker(false);
                  }}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: color,
                    border: '1px solid #ccc',
                    cursor: 'pointer'
                  }}
                  title={color}
                ></div>
              ))}
            </div>
            <div className="d-flex align-items-center">
              <small className="me-2">Tùy chọn:</small>
              <input
                type="color"
                className="form-control form-control-sm"
                style={{ width: '50px', padding: '1px' }}
                onChange={(e) => {
                  const color = e.target.value;
                  if (colorPickerType === 'text') {
                    Editor.addMark(editor, 'color', color);
                  } else {
                    Editor.addMark(editor, 'backgroundColor', color);
                  }
                  setShowColorPicker(false);
                }}
              />
            </div>
          </div>
        )}
        
        <Editable
          className="p-3 min-h-[150px]"
          placeholder={placeholder || "Nhập nội dung văn bản..."}
          onKeyDown={handleKeyDown}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          style={{ minHeight: '200px' }}
        />
      </Slate>
    </div>
  );
};

// Component Block Format Dropdown
const BlockFormatDropdown = () => {
  const editor = useSlate();
  
  const getCurrentBlockType = () => {
    const [match] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type !== 'link',
    });
    
    return match ? match[0].type : 'paragraph';
  };
  
  const blockType = getCurrentBlockType();
  const currentFormat = PARAGRAPH_TYPES.find(type => type.format === blockType) || PARAGRAPH_TYPES[0];
  
  return (
    <Dropdown as={ButtonGroup}>
      <Button variant="light" className="border d-flex align-items-center" size="sm">
        <i className={`${currentFormat.icon} me-1`}></i>
        <span className="d-none d-md-inline">{currentFormat.label}</span>
      </Button>
      <Dropdown.Toggle split variant="light" className="border" size="sm" id="block-format-dropdown" />
      <Dropdown.Menu>
        {PARAGRAPH_TYPES.map((type, index) => (
          <Dropdown.Item 
            key={index}
            onClick={() => toggleBlock(editor, type.format)}
            active={blockType === type.format}
          >
            <i className={`${type.icon} me-2`}></i>
            {type.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

// Component Mark Button Group
const MarkButtonGroup = () => {
  return (
    <ButtonGroup size="sm">
      {MARK_BUTTONS.map((button, index) => (
        <MarkButton 
          key={index} 
          format={button.format} 
          icon={button.icon} 
          tooltip={button.label} 
        />
      ))}
    </ButtonGroup>
  );
};

// Component Alignment Button Group
const AlignmentButtonGroup = () => {
  return (
    <ButtonGroup size="sm">
      {ALIGNMENTS.map((alignment, index) => (
        <AlignmentButton 
          key={index} 
          format={alignment.format} 
          icon={alignment.icon} 
          tooltip={alignment.label} 
        />
      ))}
    </ButtonGroup>
  );
};

// Component Font Family Dropdown
const FontFamilyDropdown = () => {
  const editor = useSlate();
  
  const getCurrentFontFamily = () => {
    const marks = Editor.marks(editor);
    return marks?.fontFamily || FONT_FAMILIES[0].family;
  };
  
  const currentFontFamily = getCurrentFontFamily();
  const selectedFont = FONT_FAMILIES.find(f => f.family === currentFontFamily) || FONT_FAMILIES[0];
  
  return (
    <Dropdown as={ButtonGroup} className="me-1">
      <Button 
        variant="light" 
        className="border d-flex align-items-center" 
        size="sm"
        style={{ minWidth: '80px', fontFamily: selectedFont.family }}
      >
        <span className="d-none d-md-inline">{selectedFont.label}</span>
        <span className="d-md-none">Font</span>
      </Button>
      <Dropdown.Toggle split variant="light" className="border" size="sm" id="font-family-dropdown" />
      <Dropdown.Menu style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {FONT_FAMILIES.map((font, index) => (
          <Dropdown.Item 
            key={index}
            onClick={() => Editor.addMark(editor, 'fontFamily', font.family)}
            active={currentFontFamily === font.family}
            style={{ fontFamily: font.family }}
          >
            {font.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

// Component Font Size Dropdown
const FontSizeDropdown = () => {
  const editor = useSlate();
  
  const getCurrentFontSize = () => {
    const marks = Editor.marks(editor);
    return marks?.fontSize || '16px';
  };
  
  const currentFontSize = getCurrentFontSize();
  
  return (
    <Dropdown as={ButtonGroup} className="me-1">
      <Button variant="light" className="border d-flex align-items-center" size="sm" style={{ minWidth: '60px' }}>
        <span>{currentFontSize}</span>
      </Button>
      <Dropdown.Toggle split variant="light" className="border" size="sm" id="font-size-dropdown" />
      <Dropdown.Menu style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {FONT_SIZES.map((size, index) => (
          <Dropdown.Item 
            key={index}
            onClick={() => Editor.addMark(editor, 'fontSize', size.size)}
            active={currentFontSize === size.size}
          >
            {size.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

// Component Mark Button
const MarkButton = ({ format, icon, tooltip }) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);
  
  return (
    <Button
      variant={isActive ? 'primary' : 'light'}
      className={`${!isActive ? 'border' : ''}`}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      title={tooltip}
    >
      <i className={`bi ${icon}`}></i>
    </Button>
  );
};

// Component Alignment Button
const AlignmentButton = ({ format, icon, tooltip }) => {
  const editor = useSlate();
  const isActive = isAlignmentActive(editor, format);
  
  return (
    <Button
      variant={isActive ? 'primary' : 'light'}
      className={`${!isActive ? 'border' : ''}`}
      onMouseDown={event => {
        event.preventDefault();
        toggleAlignment(editor, format);
      }}
      title={tooltip}
    >
      <i className={`bi ${icon}`}></i>
    </Button>
  );
};

// Helpers
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const isAlignmentActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type !== 'link',
  });
  
  return match ? match[0].align === format : false;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const toggleAlignment = (editor, format) => {
  const isActive = isAlignmentActive(editor, format);
  
  Transforms.setNodes(
    editor,
    { align: isActive ? undefined : format },
    { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type !== 'link' }
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = format === 'bulleted-list' || format === 'numbered-list';

  Transforms.unwrapNodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && ['bulleted-list', 'numbered-list'].includes(n.type),
    split: true,
  });

  Transforms.setNodes(
    editor,
    {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    },
    { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type !== 'link' }
  );

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });

  return !!match;
};

// Clear all formatting
const clearFormatting = (editor) => {
  Transforms.select(editor, {
    anchor: Editor.start(editor, []),
    focus: Editor.end(editor, []),
  });
  
  // Remove all marks
  Editor.removeMark(editor, 'bold');
  Editor.removeMark(editor, 'italic');
  Editor.removeMark(editor, 'underline');
  Editor.removeMark(editor, 'code');
  Editor.removeMark(editor, 'strikethrough');
  Editor.removeMark(editor, 'highlight');
  Editor.removeMark(editor, 'color');
  Editor.removeMark(editor, 'backgroundColor');
  Editor.removeMark(editor, 'fontSize');
  Editor.removeMark(editor, 'fontFamily');
  
  // Reset blocks to paragraphs
  Transforms.setNodes(
    editor,
    { type: 'paragraph', align: undefined },
    { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) }
  );
  
  // Unwrap lists
  Transforms.unwrapNodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && ['bulleted-list', 'numbered-list'].includes(n.type),
    split: true,
  });
};

// Render Element
const renderElement = props => {
  const { attributes, children, element } = props;
  
  const style = { textAlign: element.align };

  switch (element.type) {
    case 'heading-one':
      return <h1 style={style} {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 style={style} {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 style={style} {...attributes}>{children}</h3>;
    case 'block-quote':
      return <blockquote style={style} className="border-start border-primary ps-3 my-3" {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul style={style} {...attributes}>{children}</ul>;
    case 'numbered-list':
      return <ol style={style} {...attributes}>{children}</ol>;
    case 'list-item':
      return <li style={style} {...attributes}>{children}</li>;
    default:
      return <p style={style} {...attributes}>{children}</p>;
  }
};

// Render Leaf
const renderLeaf = ({ attributes, children, leaf }) => {
  // Build style object
  const style = {
    ...(leaf.fontSize && { fontSize: leaf.fontSize }),
    ...(leaf.color && { color: leaf.color }),
    ...(leaf.backgroundColor && { backgroundColor: leaf.backgroundColor }),
    ...(leaf.fontFamily && { fontFamily: leaf.fontFamily }),
  };

  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <s>{children}</s>;
  }

  if (leaf.code) {
    children = <code className="bg-light px-1 rounded">{children}</code>;
  }

  if (leaf.highlight) {
    style.backgroundColor = style.backgroundColor || '#ffff00';
  }

  return (
    <span {...attributes} style={style}>
      {children}
    </span>
  );
};

export default RichTextEditor;