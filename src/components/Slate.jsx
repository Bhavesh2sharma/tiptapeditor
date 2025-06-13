import React, { useState, useCallback, useMemo } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote,
  Code,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Download,
  FileText,
  Moon,
  Sun,
  Save
} from 'lucide-react';

// Mock Slate implementation since we can't import it directly
// In a real app, you'd install: npm install slate slate-react slate-history

const Slate = () => {
  const [darkMode, setDarkMode] = useState(false);
  
  // Mock editor state - in real Slate, this would be the Slate value
  const [editorValue, setEditorValue] = useState([
    {
      type: 'paragraph',
      children: [
        { text: 'Welcome to Slate.js Rich Text Editor!', bold: true, fontSize: '24px' }
      ]
    },
    {
      type: 'paragraph',
      children: [{ text: '' }]
    },
    {
      type: 'paragraph',
      children: [
        { text: 'This editor is built with ' },
        { text: 'Slate.js', bold: true },
        { text: ' and supports advanced text editing features.' }
      ]
    },
    {
      type: 'paragraph',
      children: [{ text: '' }]
    },
    {
      type: 'paragraph',
      children: [{ text: 'Key features include:', bold: true }]
    },
    {
      type: 'bulleted-list',
      children: [
        {
          type: 'list-item',
          children: [{ text: 'Rich text formatting (bold, italic, underline)' }]
        },
        {
          type: 'list-item',
          children: [{ text: 'Multiple list types and blockquotes' }]
        },
        {
          type: 'list-item',
          children: [{ text: 'Code blocks and inline code' }]
        },
        {
          type: 'list-item',
          children: [{ text: 'Export to Markdown and DOCX formats' }]
        }
      ]
    },
    {
      type: 'paragraph',
      children: [{ text: '' }]
    },
    {
      type: 'blockquote',
      children: [
        { text: 'Try editing this text and then export your document!', italic: true }
      ]
    },
    {
      type: 'paragraph',
      children: [{ text: '' }]
    },
    {
      type: 'code-block',
      children: [
        { text: 'console.log("Hello from Slate.js!");' }
      ]
    }
  ]);

  // Mock formatting states
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    code: false
  });

  const [activeBlock, setActiveBlock] = useState('paragraph');
  const [activeAlign, setActiveAlign] = useState('left');

  // Convert Slate value to Markdown
  const slateToMarkdown = useCallback((nodes) => {
    return nodes.map(node => {
      if (node.type === 'paragraph') {
        return serializeLeaves(node.children);
      } else if (node.type === 'heading-one') {
        return `# ${serializeLeaves(node.children)}`;
      } else if (node.type === 'heading-two') {
        return `## ${serializeLeaves(node.children)}`;
      } else if (node.type === 'heading-three') {
        return `### ${serializeLeaves(node.children)}`;
      } else if (node.type === 'blockquote') {
        return `> ${serializeLeaves(node.children)}`;
      } else if (node.type === 'code-block') {
        return `\`\`\`\n${serializeLeaves(node.children)}\n\`\`\``;
      } else if (node.type === 'bulleted-list') {
        return node.children.map(child => `- ${serializeLeaves(child.children)}`).join('\n');
      } else if (node.type === 'numbered-list') {
        return node.children.map((child, i) => `${i + 1}. ${serializeLeaves(child.children)}`).join('\n');
      }
      return serializeLeaves(node.children || []);
    }).join('\n\n').trim();
  }, []);

  // Convert Slate value to RTF for DOCX
  const slateToRTF = useCallback((nodes) => {
    let rtf = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}{\\f1 Courier New;}}\\f0\\fs24 ';
    
    nodes.forEach(node => {
      if (node.type === 'heading-one') {
        rtf += `{\\b\\fs32 ${serializeLeavesToRTF(node.children)}}\\par\\par `;
      } else if (node.type === 'heading-two') {
        rtf += `{\\b\\fs28 ${serializeLeavesToRTF(node.children)}}\\par\\par `;
      } else if (node.type === 'heading-three') {
        rtf += `{\\b\\fs24 ${serializeLeavesToRTF(node.children)}}\\par\\par `;
      } else if (node.type === 'blockquote') {
        rtf += `{\\i "${serializeLeavesToRTF(node.children)}"}\\par\\par `;
      } else if (node.type === 'code-block') {
        rtf += `{\\f1 ${serializeLeavesToRTF(node.children)}}\\par\\par `;
      } else if (node.type === 'bulleted-list') {
        node.children.forEach(child => {
          rtf += `• ${serializeLeavesToRTF(child.children)}\\par `;
        });
        rtf += '\\par ';
      } else if (node.type === 'numbered-list') {
        node.children.forEach((child, i) => {
          rtf += `${i + 1}. ${serializeLeavesToRTF(child.children)}\\par `;
        });
        rtf += '\\par ';
      } else {
        rtf += `${serializeLeavesToRTF(node.children)}\\par\\par `;
      }
    });
    
    rtf += '}';
    return rtf;
  }, []);

  // Helper function to serialize text with formatting
  const serializeLeaves = (leaves) => {
    return leaves.map(leaf => {
      let text = leaf.text || '';
      if (leaf.bold) text = `**${text}**`;
      if (leaf.italic) text = `*${text}*`;
      if (leaf.underline) text = `<u>${text}</u>`;
      if (leaf.code) text = `\`${text}\``;
      return text;
    }).join('');
  };

  // Helper function to serialize text to RTF
  const serializeLeavesToRTF = (leaves) => {
    return leaves.map(leaf => {
      let text = leaf.text || '';
      let rtfText = text;
      
      if (leaf.bold) rtfText = `{\\b ${rtfText}}`;
      if (leaf.italic) rtfText = `{\\i ${rtfText}}`;
      if (leaf.underline) rtfText = `{\\ul ${rtfText}}`;
      if (leaf.code) rtfText = `{\\f1 ${rtfText}}`;
      
      return rtfText;
    }).join('');
  };

  const exportAsMarkdown = () => {
    const markdown = slateToMarkdown(editorValue);
    downloadFile(markdown, 'document.md', 'text/markdown');
  };

  const exportAsDocx = () => {
    const rtf = slateToRTF(editorValue);
    downloadFile(rtf, 'document.rtf', 'application/rtf');
  };

  const saveAsJSON = () => {
    const json = JSON.stringify(editorValue, null, 2);
    downloadFile(json, 'slate-document.json', 'application/json');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Mock formatting functions (in real Slate, these would use Transforms)
  const toggleFormat = (format) => {
    setActiveFormats(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  const toggleBlock = (blockType) => {
    setActiveBlock(blockType);
  };

  const toggleAlign = (alignment) => {
    setActiveAlign(alignment);
  };

  const ToolbarButton = ({ active, onClick, children, title }) => (
    <button
      className={`p-2 rounded-lg transition-all ${
        active
          ? 'bg-blue-500 text-white shadow-md'
          : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`
      }`}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );

  // Mock editable area (in real Slate, this would be <Editable />)
  const MockEditableArea = () => (
    <div 
      className={`min-h-96 p-6 focus:outline-none text-lg leading-relaxed border-2 border-dashed rounded-lg ${
        darkMode 
          ? 'border-gray-600 bg-gray-800/50 text-white' 
          : 'border-gray-300 bg-white/50 text-gray-800'
      }`}
      style={{ minHeight: '400px' }}
    >
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-blue-600">Welcome to Slate.js Rich Text Editor!</h1>
        
        <p>
          This editor is built with <strong>Slate.js</strong> and supports advanced text editing features.
        </p>
        
        <p><strong>Key features include:</strong></p>
        
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Rich text formatting (bold, italic, underline)</li>
          <li>Multiple list types and blockquotes</li>
          <li>Code blocks and inline code</li>
          <li>Export to Markdown and DOCX formats</li>
        </ul>
        
        <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-blue-50/50 dark:bg-blue-900/20 py-2">
          <em>Try editing this text and then export your document!</em>
        </blockquote>
        
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <code>console.log("Hello from Slate.js!");</code>
        </pre>
        
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          darkMode ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
        }`}>
          <strong>Note:</strong> This is a demo interface. In a real implementation, this would be a fully interactive Slate.js editor where you can type, format text, and manipulate the document structure in real-time.
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-blue-900' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-5xl mx-auto p-6">
        
        {/* Header */}
        <div className={`rounded-t-2xl p-6 backdrop-blur-sm border-b ${
          darkMode 
            ? 'bg-gray-800/30 border-gray-700 text-white' 
            : 'bg-white/40 border-gray-200 text-gray-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Slate.js Rich Text Editor
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all ${
                  darkMode 
                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
                    : 'bg-gray-700/20 text-gray-700 hover:bg-gray-700/30'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={saveAsJSON}
                className="px-3 py-2 bg-purple-500/20 text-purple-600 hover:bg-purple-500/30 rounded-lg transition-all flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>JSON</span>
              </button>
              
              <button
                onClick={exportAsMarkdown}
                className="px-3 py-2 bg-green-500/20 text-green-600 hover:bg-green-500/30 rounded-lg transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Markdown</span>
              </button>
              
              <button
                onClick={exportAsDocx}
                className="px-3 py-2 bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 rounded-lg transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>DOCX</span>
              </button>
            </div>
          </div>
        </div>

        {/* Editor Container */}
        <div className={`rounded-b-2xl backdrop-blur-sm ${
          darkMode 
            ? 'bg-gray-800/30' 
            : 'bg-white/40'
        }`}>
          
          {/* Toolbar */}
          <div className={`flex flex-wrap items-center gap-2 p-4 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {/* Text Formatting */}
            <ToolbarButton 
              active={activeFormats.bold} 
              onClick={() => toggleFormat('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              active={activeFormats.italic} 
              onClick={() => toggleFormat('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              active={activeFormats.underline} 
              onClick={() => toggleFormat('underline')}
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              active={activeFormats.code} 
              onClick={() => toggleFormat('code')}
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>
            
            <div className={`w-px h-6 mx-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            
            {/* Block Types */}
            <ToolbarButton 
              active={activeBlock === 'heading-one'} 
              onClick={() => toggleBlock('heading-one')}
              title="Heading 1"
            >
              <Type className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              active={activeBlock === 'blockquote'} 
              onClick={() => toggleBlock('blockquote')}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              active={activeBlock === 'bulleted-list'} 
              onClick={() => toggleBlock('bulleted-list')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              active={activeBlock === 'numbered-list'} 
              onClick={() => toggleBlock('numbered-list')}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            
            <div className={`w-px h-6 mx-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            
            {/* Alignment */}
            <ToolbarButton 
              active={activeAlign === 'left'} 
              onClick={() => toggleAlign('left')}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              active={activeAlign === 'center'} 
              onClick={() => toggleAlign('center')}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              active={activeAlign === 'right'} 
              onClick={() => toggleAlign('right')}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Editor Area */}
          <div className="p-6">
            <MockEditableArea />
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-6 p-4 rounded-lg backdrop-blur-sm ${
          darkMode 
            ? 'bg-gray-800/20 text-gray-300' 
            : 'bg-white/20 text-gray-600'
        }`}>
          <div className="text-center">
            <p className="text-sm mb-2">
              Powered by <strong>Slate.js</strong> • Advanced rich text editing with structural document manipulation
            </p>
            <p className="text-xs">
              To use this with real Slate.js: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">npm install slate slate-react slate-history</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slate;