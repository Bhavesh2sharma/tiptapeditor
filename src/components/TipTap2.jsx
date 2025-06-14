import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, 
  AlignJustify, Code, Palette, Type, Highlighter, Table, Plus, Download, 
  Upload, Sun, Moon, Smile, FileText, File, Hash, ChevronDown
} from 'lucide-react';

const TipTap2 = () => {
  const [content, setContent] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentFont, setCurrentFont] = useState('Arial');
  const [currentSize, setCurrentSize] = useState('16');
  const [selectedText, setSelectedText] = useState('');
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'];
  const highlights = ['#FFFF00', '#00FF00', '#00FFFF', '#FF69B4', '#FFA500', '#FF0000', '#800Purple', '#CCCCCC'];
  const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS', 'Impact'];
  const sizes = ['10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '64'];
  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '🚀', '⭐', '💡', '📝', '📊', '📈', '✨', '🎯', '💪', '🌟'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const applyFormat = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    saveSelection();
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      setSelectedText(selection.toString());
    }
  };

  const restoreSelection = () => {
    editorRef.current?.focus();
  };

  const formatText = (type) => {
    restoreSelection();
    applyFormat(type);
  };

  const setAlignment = (align) => {
    const alignments = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull'
    };
    restoreSelection();
    applyFormat(alignments[align]);
  };

  const setTextColor = (color) => {
    restoreSelection();
    applyFormat('foreColor', color);
    setActiveDropdown(null);
  };

  const setHighlight = (color) => {
    restoreSelection();
    applyFormat('backColor', color);
    setActiveDropdown(null);
  };

  const setFontFamily = (font) => {
    restoreSelection();
    applyFormat('fontName', font);
    setCurrentFont(font);
    setActiveDropdown(null);
  };

  const setFontSize = (size) => {
    restoreSelection();
    // Convert px to font size number for execCommand
    const sizeMap = {
      '10': '1', '12': '2', '14': '3', '16': '4', 
      '18': '5', '20': '6', '24': '7', '28': '7',
      '32': '7', '36': '7', '48': '7', '64': '7'
    };
    applyFormat('fontSize', sizeMap[size] || '4');
    
    // Apply CSS style for larger fonts
    if (parseInt(size) > 24) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = size + 'px';
        try {
          range.surroundContents(span);
        } catch (e) {
          span.innerHTML = range.toString();
          range.deleteContents();
          range.insertNode(span);
        }
      }
    }
    
    setCurrentSize(size);
    setActiveDropdown(null);
  };

  const insertCodeBlock = () => {
    restoreSelection();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const code = document.createElement('code');
      code.style.cssText = `
        background-color: ${isDark ? '#374151' : '#f3f4f6'};
        padding: 4px 8px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: ${isDark ? '#e5e7eb' : '#374151'};
      `;
      
      if (selection.toString()) {
        try {
          range.surroundContents(code);
        } catch (e) {
          code.textContent = range.toString();
          range.deleteContents();
          range.insertNode(code);
        }
      } else {
        code.textContent = 'code';
        range.insertNode(code);
      }
    }
  };

  const insertTable = () => {
    restoreSelection();
    const tableHTML = `
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0; font-family: inherit;">
        <thead>
          <tr style="background-color: ${isDark ? '#374151' : '#f9fafb'};">
            <th style="border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; padding: 12px; text-align: left;">Header 1</th>
            <th style="border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; padding: 12px; text-align: left;">Header 2</th>
            <th style="border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; padding: 12px; text-align: left;">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; padding: 12px;">Cell 1</td>
            <td style="border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; padding: 12px;">Cell 2</td>
            <td style="border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; padding: 12px;">Cell 3</td>
          </tr>
          <tr>
            <td style="border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; padding: 12px;">Cell 4</td>
            <td style="border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; padding: 12px;">Cell 5</td>
            <td style="border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; padding: 12px;">Cell 6</td>
          </tr>
        </tbody>
      </table>
    `;
    applyFormat('insertHTML', tableHTML);
  };

  const insertEmoji = (emoji) => {
    restoreSelection();
    applyFormat('insertText', emoji);
    setActiveDropdown(null);
  };

  const downloadFile = (format) => {
    const content = editorRef.current?.innerHTML || '';
    let fileContent = '';
    let fileName = '';
    let mimeType = '';

    switch (format) {
      case 'doc':
        fileContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Document</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
            </style>
          </head>
          <body>${content}</body>
          </html>
        `;
        fileName = 'document.doc';
        mimeType = 'application/msword';
        break;
        
      case 'rtf':
        const stripHTML = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        fileContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs24 ${stripHTML}}`;
        fileName = 'document.rtf';
        mimeType = 'application/rtf';
        break;
        
      case 'md':
        fileContent = content
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
          .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
          .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
          .replace(/<u[^>]*>(.*?)<\/u>/gi, '$1')
          .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
          .replace(/<br[^>]*>/gi, '\n')
          .replace(/<div[^>]*>/gi, '\n')
          .replace(/<\/div>/gi, '')
          .replace(/<p[^>]*>/gi, '\n')
          .replace(/<\/p>/gi, '\n')
          .replace(/<table[^>]*>/gi, '\n')
          .replace(/<\/table>/gi, '\n')
          .replace(/<tr[^>]*>/gi, '| ')
          .replace(/<\/tr>/gi, ' |\n')
          .replace(/<th[^>]*>/gi, '')
          .replace(/<\/th>/gi, ' | ')
          .replace(/<td[^>]*>/gi, '')
          .replace(/<\/td>/gi, ' | ')
          .replace(/<[^>]*>/g, '')
          .replace(/\n\s*\n/g, '\n\n')
          .trim();
        fileName = 'document.md';
        mimeType = 'text/markdown';
        break;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      let content = e.target.result;
      
      if (file.name.endsWith('.md')) {
        content = content
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>')
          .replace(/^/, '<p>')
          .replace(/$/, '</p>');
      } else if (file.name.endsWith('.rtf')) {
        content = content
          .replace(/\{\\b (.*?)\}/g, '<strong>$1</strong>')
          .replace(/\{\\i (.*?)\}/g, '<em>$1</em>')
          .replace(/\\par/g, '<br>')
          .replace(/\{[^}]*\}/g, '')
          .replace(/\\[a-z]+[0-9]*\s?/gi, '');
      }
      
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
        setContent(content);
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const DropdownButton = ({ icon: Icon, label, isActive, onClick, children }) => (
    <div className="dropdown-container relative">
      <button
        onClick={onClick}
        className={`flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <Icon size={16} />
        {label && <span className="text-sm hidden sm:inline">{label}</span>}
        <ChevronDown size={14} className={`transition-transform ${isActive ? 'rotate-180' : ''}`} />
      </button>
      {isActive && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl z-50 min-w-max">
          {children}
        </div>
      )}
    </div>
  );

  const themeClasses = isDark 
    ? 'bg-gray-900 text-white' 
    : 'bg-white text-gray-900';

  const toolbarClasses = isDark 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-gray-50 border-gray-200';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden border dark:border-gray-700">
          
          {/* Toolbar */}
          <div className={`p-4 border-b ${toolbarClasses}`}>
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Toggle Theme"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

              {/* Basic Formatting */}
              <button onClick={() => formatText('bold')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Bold">
                <Bold size={18} />
              </button>
              <button onClick={() => formatText('italic')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Italic">
                <Italic size={18} />
              </button>
              <button onClick={() => formatText('underline')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Underline">
                <Underline size={18} />
              </button>
              <button onClick={() => formatText('strikethrough')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Strikethrough">
                <Strikethrough size={18} />
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

              {/* Font Family */}
              <DropdownButton
                icon={Type}
                label={currentFont}
                isActive={activeDropdown === 'font'}
                onClick={() => toggleDropdown('font')}
              >
                <div className="py-2 max-h-64 overflow-y-auto">
                  {fonts.map(font => (
                    <button
                      key={font}
                      onClick={() => setFontFamily(font)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </DropdownButton>

              {/* Font Size */}
              <DropdownButton
                icon={() => <span className="text-sm font-medium">{currentSize}</span>}
                isActive={activeDropdown === 'size'}
                onClick={() => toggleDropdown('size')}
              >
                <div className="py-2 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-1 p-2 min-w-32">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-center"
                      >
                        {size}px
                      </button>
                    ))}
                  </div>
                </div>
              </DropdownButton>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

              {/* Text Color */}
              <DropdownButton
                icon={Palette}
                isActive={activeDropdown === 'color'}
                onClick={() => toggleDropdown('color')}
              >
                <div className="p-3">
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </DropdownButton>

              {/* Highlight */}
              <DropdownButton
                icon={Highlighter}
                isActive={activeDropdown === 'highlight'}
                onClick={() => toggleDropdown('highlight')}
              >
                <div className="p-3">
                  <div className="grid grid-cols-4 gap-2">
                    {highlights.map(color => (
                      <button
                        key={color}
                        onClick={() => setHighlight(color)}
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </DropdownButton>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

              {/* Alignment */}
              <button onClick={() => setAlignment('left')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Align Left">
                <AlignLeft size={18} />
              </button>
              <button onClick={() => setAlignment('center')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Align Center">
                <AlignCenter size={18} />
              </button>
              <button onClick={() => setAlignment('right')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Align Right">
                <AlignRight size={18} />
              </button>
              <button onClick={() => setAlignment('justify')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Justify">
                <AlignJustify size={18} />
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

              {/* Code & Table */}
              <button onClick={insertCodeBlock} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Code Block">
                <Code size={18} />
              </button>
              <button onClick={insertTable} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Insert Table">
                <Table size={18} />
              </button>

              {/* Emojis */}
              <DropdownButton
                icon={Smile}
                isActive={activeDropdown === 'emoji'}
                onClick={() => toggleDropdown('emoji')}
              >
                <div className="p-3">
                  <div className="grid grid-cols-8 gap-1 max-w-80">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </DropdownButton>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

              {/* File Operations */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                title="Upload File"
              >
                <Upload size={16} />
                <span className="text-sm hidden sm:inline">Upload</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,.rtf,.md,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Download Buttons */}
              <button
                onClick={() => downloadFile('doc')}
                className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Download as DOC"
              >
                <FileText size={16} />
                <span className="text-sm">DOC</span>
              </button>
              
              <button
                onClick={() => downloadFile('rtf')}
                className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                title="Download as RTF"
              >
                <File size={16} />
                <span className="text-sm">RTF</span>
              </button>
              
              <button
                onClick={() => downloadFile('md')}
                className="flex items-center gap-1 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                title="Download as Markdown"
              >
                <Hash size={16} />
                <span className="text-sm">MD</span>
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="p-6">
            <div
              ref={editorRef}
              contentEditable
              className={`min-h-[500px] max-h-[600px] overflow-y-auto p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 ${
                isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}
              style={{ 
                fontSize: `${currentSize}px`,
                fontFamily: currentFont,
                lineHeight: '1.6'
              }}
              onInput={handleEditorChange}
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              suppressContentEditableWarning={true}
              placeholder="Start typing your content here..."
            >
              <p>Welcome to your rich text editor! Start typing here...</p>
              <p>You can format text, create tables, add code blocks, and much more!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipTap2;