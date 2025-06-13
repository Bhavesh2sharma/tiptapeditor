import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, Quote,
  Code, Type, AlignLeft, AlignCenter, AlignRight,
  Download, Upload, FileText, Moon, Sun, Save, Undo, Redo,
  Table, Rows, Columns
} from 'lucide-react';

const TipTap = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [content, setContent] = useState('<p>Start typing your document...</p>');
  const [history, setHistory] = useState(['<p>Start typing your document...</p>']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  // Save to history for undo/redo
  const saveToHistory = useCallback((newContent) => {
    if (newContent !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [history, historyIndex]);

  // Undo functionality
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex];
      }
    }
  };

  // Redo functionality
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex];
      }
    }
  };

  // Execute command helper
  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    updateContent();
  }, []);

  // Update content while preserving cursor position
  const updateContent = useCallback(() => {
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    saveToHistory(newContent);
    
    // Restore cursor position
    if (range) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [saveToHistory]);

  // Formatting commands
  const toggleBold = () => execCommand('bold');
  const toggleItalic = () => execCommand('italic');
  const toggleUnderline = () => execCommand('underline');
  const makeHeading = () => execCommand('formatBlock', 'H1');
  const makeQuote = () => execCommand('formatBlock', 'BLOCKQUOTE');
  const toggleBulletList = () => execCommand('insertUnorderedList');
  const toggleOrderedList = () => execCommand('insertOrderedList');
  const alignLeft = () => execCommand('justifyLeft');
  const alignCenter = () => execCommand('justifyCenter');
  const alignRight = () => execCommand('justifyRight');

  // Custom code formatting
  const toggleCode = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        const codeElement = document.createElement('code');
        codeElement.className = 'bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm font-mono';
        codeElement.textContent = selectedText;
        
        range.deleteContents();
        range.insertNode(codeElement);
        selection.removeAllRanges();
        
        updateContent();
      }
    }
  };

  // Insert table
  const insertTable = () => {
    const rows = Math.max(1, Math.min(10, tableRows));
    const cols = Math.max(1, Math.min(10, tableCols));
    
    let tableHtml = '<table class="border-collapse border border-gray-400 w-full my-4">';
    
    for (let i = 0; i < rows; i++) {
      tableHtml += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHtml += `<td class="border border-gray-400 p-2" contenteditable="true">&nbsp;</td>`;
      }
      tableHtml += '</tr>';
    }
    
    tableHtml += '</table>';
    
    // Insert at current cursor position
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const div = document.createElement('div');
      div.innerHTML = tableHtml;
      
      // Remove empty parent nodes if needed
      const node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue === '') {
        range.selectNode(node.parentNode);
        range.deleteContents();
      }
      
      range.insertNode(div.firstChild);
      selection.removeAllRanges();
      
      updateContent();
    }
    
    setShowTableMenu(false);
  };

  // Handle content changes with proper cursor preservation
  const handleContentChange = useCallback(() => {
    updateContent();
  }, [updateContent]);

  // Convert HTML to Markdown with proper table support
  const htmlToMarkdown = useCallback((html) => {
    // Process tables first
    let markdown = html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, tableContent) => {
      const rows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      if (!rows) return '';
      
      let mdTable = '\n';
      
      rows.forEach((row, rowIndex) => {
        const cells = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
        if (!cells) return;
        
        const rowContent = cells.map(cell => {
          return cell.replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/i, '$1')
            .replace(/<[^>]*>/g, '')
            .replace(/\n/g, ' ')
            .trim();
        }).join(' | ');
        
        mdTable += `| ${rowContent} |\n`;
        
        if (rowIndex === 0) {
          mdTable += `| ${cells.map(() => '---').join(' | ')} |\n`;
        }
      });
      
      return mdTable;
    });
    
    // Process other elements
    markdown = markdown
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '<u>$1</u>')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
      })
      .replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, content) => {
        let counter = 1;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
      })
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
    
    return markdown;
  }, []);

  // Convert HTML to RTF with table support
  const htmlToRTF = useCallback((html) => {
    let rtf = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}{\\f1 Courier New;}}\\f0\\fs24 ';
    
    const processedHtml = html
      .replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, tableContent) => {
        const rows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
        if (!rows) return '';
        
        let rtfTable = '{\\trowd\\trgaph100\\trleft0';
        const cols = rows[0] ? rows[0].match(/<t[dh][^>]*>/gi)?.length || 1 : 1;
        const colWidth = Math.floor(5000 / cols);
        
        for (let i = 0; i < cols; i++) {
          rtfTable += `\\clbrdrl\\brdrs\\clbrdrt\\brdrs\\clbrdrb\\brdrs\\clbrdrr\\brdrs\\cellx${(i + 1) * colWidth}`;
        }
        
        rows.forEach(row => {
          const cells = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
          if (!cells) return;
          
          cells.forEach(cell => {
            const cellContent = cell.replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/i, '$1')
              .replace(/<[^>]*>/g, '')
              .replace(/&nbsp;/g, ' ')
              .trim();
            
            rtfTable += `\\intbl ${cellContent}\\cell`;
          });
          
          rtfTable += '\\row';
        });
        
        rtfTable += '}\\par';
        return rtfTable;
      })
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '{\\b\\fs32 $1}\\par\\par ')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '{\\b\\fs28 $1}\\par\\par ')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '{\\b\\fs24 $1}\\par\\par ')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '{\\b $1}')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '{\\b $1}')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '{\\i $1}')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '{\\i $1}')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '{\\ul $1}')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '{\\f1 $1}')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '{\\i "$1"}\\par\\par ')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\\par ') + '\\par ';
      })
      .replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, content) => {
        let counter = 1;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\\par `) + '\\par ';
      })
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\\par\\par ')
      .replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\\par\\par ')
      .replace(/<br\s*\/?>/gi, '\\par ')
      .replace(/<[^>]*>/g, '');
    
    rtf += processedHtml + '}';
    return rtf;
  }, []);

  // Create DOCX with table support
  const createDocx = useCallback((html) => {
    const processedHtml = html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, tableContent) => {
      const rows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      if (!rows) return '';
      
      let docxTable = `<w:tbl>
        <w:tblPr>
          <w:tblStyle w:val="TableGrid"/>
          <w:tblW w:w="5000" w:type="pct"/>
          <w:tblBorders>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
          </w:tblBorders>
          <w:tblLook w:val="04A0"/>
        </w:tblPr>`;
      
      rows.forEach(row => {
        const cells = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
        if (!cells) return;
        
        docxTable += '<w:tr>';
        
        cells.forEach(cell => {
          const cellContent = cell.replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/i, '$1')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .trim();
          
          docxTable += `
            <w:tc>
              <w:tcPr>
                <w:tcW w:w="2000" w:type="dxa"/>
              </w:tcPr>
              <w:p>
                <w:r>
                  <w:t>${cellContent}</w:t>
                </w:r>
              </w:p>
            </w:tc>`;
        });
        
        docxTable += '</w:tr>';
      });
      
      docxTable += '</w:tbl>';
      return docxTable;
    });
    
    const plainText = processedHtml
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '$1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '$1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '$1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '$1')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '$1')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '$1')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '$1')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '"$1"\n\n')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n') + '\n';
      })
      .replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, content) => {
        let counter = 1;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
      })
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${plainText.split('\n\n').map(paragraph => 
      paragraph.trim() ? `<w:p><w:r><w:t>${paragraph.replace(/\n/g, '</w:t></w:r><w:r><w:br/><w:t>')}</w:t></w:r></w:p>` : ''
    ).join('')}
  </w:body>
</w:document>`;
  }, []);

  // Handle file upload with table support
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        let fileContent = e.target.result;
        let htmlContent;
        
        if (file.name.endsWith('.rtf')) {
          htmlContent = fileContent
            .replace(/\\par\s*/g, '</p><p>')
            .replace(/\{\\b\s*(.*?)\}/g, '<strong>$1</strong>')
            .replace(/\{\\i\s*(.*?)\}/g, '<em>$1</em>')
            .replace(/\{\\ul\s*(.*?)\}/g, '<u>$1</u>')
            .replace(/\{\\trowd[\s\S]*?\\row\s*}/g, (match) => {
              const rows = match.split('\\row');
              let tableHtml = '<table border="1">';
              
              rows.forEach(row => {
                if (row.includes('\\cell')) {
                  tableHtml += '<tr>';
                  const cells = row.split('\\cell');
                  cells.forEach(cell => {
                    if (cell.includes('\\intbl')) {
                      const cellContent = cell.replace(/.*\\intbl\s*([^\\]*).*/g, '$1')
                        .replace(/\s+/g, ' ')
                        .trim();
                      tableHtml += `<td>${cellContent}</td>`;
                    }
                  });
                  tableHtml += '</tr>';
                }
              });
              
              tableHtml += '</table>';
              return tableHtml;
            })
            .replace(/\{[^}]*\}/g, '')
            .replace(/\\/g, '')
            .split('\n')
            .map(line => line.trim() ? `<p>${line}</p>` : '<p><br></p>')
            .join('');
        } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
          if (fileContent.includes('<body>')) {
            const bodyMatch = fileContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (bodyMatch) fileContent = bodyMatch[1];
          }
          
          htmlContent = fileContent
            .replace(/xmlns[^=]*="[^"]*"/g, '')
            .replace(/<\?xml[^>]*\?>/g, '')
            .replace(/<!DOCTYPE[^>]*>/g, '')
            .replace(/<html[^>]*>/g, '')
            .replace(/<\/html>/g, '')
            .replace(/<head[\s\S]*?<\/head>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<o:p>\s*<\/o:p>/g, '')
            .trim();
          
          if (!htmlContent.includes('<p>') && !htmlContent.includes('<h1>') && !htmlContent.includes('<div>')) {
            htmlContent = fileContent.split('\n').map(line => 
              line.trim() ? `<p>${line}</p>` : '<p><br></p>'
            ).join('');
          }
        } else {
          htmlContent = fileContent.split('\n').map(line => 
            line.trim() ? `<p>${line}</p>` : '<p><br></p>'
          ).join('');
        }
        
        setContent(htmlContent);
        editorRef.current.innerHTML = htmlContent;
        saveToHistory(htmlContent);
      };
      reader.readAsText(file);
    }
  };

  // Export functions
  const exportAsMarkdown = () => {
    const markdown = htmlToMarkdown(content);
    downloadFile(markdown, 'document.md', 'text/markdown');
  };

  const exportAsRTF = () => {
    const rtf = htmlToRTF(content);
    downloadFile(rtf, 'document.rtf', 'application/rtf');
  };

  const exportAsDocx = () => {
    const docx = createDocx(content);
    downloadFile(docx, 'document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
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

  // Apply styling to elements
  useEffect(() => {
    if (editorRef.current) {
      // Style blockquotes
      const blockquotes = editorRef.current.querySelectorAll('blockquote');
      blockquotes.forEach(blockquote => {
        blockquote.className = 'border-l-4 border-blue-500 pl-4 italic bg-blue-50 dark:bg-blue-900/20 py-2 my-4';
      });

      // Style headings
      const h1s = editorRef.current.querySelectorAll('h1');
      h1s.forEach(h1 => {
        h1.className = 'text-2xl font-bold mb-4 mt-6';
      });

      // Style lists
      const uls = editorRef.current.querySelectorAll('ul');
      uls.forEach(ul => {
        ul.className = 'list-disc list-inside ml-4 my-2 space-y-1';
      });

      const ols = editorRef.current.querySelectorAll('ol');
      ols.forEach(ol => {
        ol.className = 'list-decimal list-inside ml-4 my-2 space-y-1';
      });

      // Style tables
      const tables = editorRef.current.querySelectorAll('table');
      tables.forEach(table => {
        table.className = 'border-collapse border border-gray-400 w-full my-4';
        
        const cells = table.querySelectorAll('td, th');
        cells.forEach(cell => {
          cell.className = 'border border-gray-400 p-2';
        });
      });

      // Style paragraphs
      const paragraphs = editorRef.current.querySelectorAll('p');
      paragraphs.forEach(p => {
        if (!p.className) {
          p.className = 'mb-3';
        }
      });
    }
  }, [content]);

  const ToolbarButton = ({ active, onClick, children, title, disabled }) => (
    <button
      className={`p-2 rounded-lg transition-all ${
        disabled 
          ? 'opacity-50 cursor-not-allowed'
          : active
            ? 'bg-blue-500 text-white shadow-md'
            : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'}`
      }`}
      onClick={onClick}
      title={title}
      type="button"
      disabled={disabled}
    >
      {children}
    </button>
  );

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-blue-900' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header with Toolbar */}
        <div className={`rounded-2xl backdrop-blur-sm border mb-6 z-20 relative ${
          darkMode 
            ? 'bg-gray-800/30 border-gray-700 text-white' 
            : 'bg-white/40 border-gray-200 text-gray-800'
        }`}>
          {/* Top Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rich Text Editor
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
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-4">
            {/* File Operations */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".doc,.docx,.rtf,.txt,.html"
              className="hidden"
            />
            
            <ToolbarButton 
              onClick={() => fileInputRef.current?.click()}
              title="Upload File (.doc, .docx, .rtf, .txt, .html)"
            >
              <Upload className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              onClick={exportAsMarkdown}
              title="Export as Markdown"
            >
              <Download className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              onClick={exportAsDocx}
              title="Export as DOCX"
            >
              <FileText className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              onClick={exportAsRTF}
              title="Export as RTF"
            >
              <Save className="w-4 h-4" />
            </ToolbarButton>
            
            <div className={`w-px h-6 mx-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            
            {/* History */}
            <ToolbarButton 
              onClick={undo}
              title="Undo"
              disabled={historyIndex <= 0}
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              onClick={redo}
              title="Redo"
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
            
            <div className={`w-px h-6 mx-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            
            {/* Text Formatting */}
            <ToolbarButton 
              onClick={toggleBold}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              onClick={toggleItalic}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              onClick={toggleUnderline}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              onClick={toggleCode}
              title="Code (Select text first)"
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>
            
            <div className={`w-px h-6 mx-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            
            {/* Block Types */}
            <ToolbarButton 
              onClick={makeHeading}
              title="Make Heading"
            >
              <Type className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              onClick={makeQuote}
              title="Make Quote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              onClick={toggleBulletList}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              onClick={toggleOrderedList}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            
            <div className={`w-px h-6 mx-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            
            {/* Table Button with Dropdown */}
            <div className="relative">
              <ToolbarButton 
                onClick={() => setShowTableMenu(!showTableMenu)}
                title="Insert Table"
              >
                <Table className="w-4 h-4" />
              </ToolbarButton>
              
              {showTableMenu && (
                <div className={`absolute z-50 mt-1 left-0 p-4 rounded-lg shadow-lg ${
                  darkMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-3">
                    <Rows className="w-4 h-4" />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={tableRows}
                      onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                      className={`w-16 p-1 rounded border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Columns className="w-4 h-4" />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={tableCols}
                      onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                      className={`w-16 p-1 rounded border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <button
                    onClick={insertTable}
                    className={`w-full py-1 px-3 rounded ${
                      darkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Insert Table
                  </button>
                </div>
              )}
            </div>
            
            <div className={`w-px h-6 mx-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            
            {/* Alignment */}
            <ToolbarButton 
              onClick={alignLeft}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              onClick={alignCenter}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            
            <ToolbarButton 
              onClick={alignRight}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor */}
        <div className={`rounded-2xl backdrop-blur-sm border z-10 ${
          darkMode 
            ? 'bg-gray-800/30 border-gray-700' 
            : 'bg-white/40 border-gray-200'
        }`}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning={true}
            className={`min-h-96 p-6 focus:outline-none text-lg leading-relaxed ${
              darkMode 
                ? 'text-white' 
                : 'text-gray-800'
            }`}
            style={{ minHeight: '500px' }}
            onInput={handleContentChange}
            onBlur={handleContentChange}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Footer */}
        <div className={`mt-6 p-4 rounded-lg backdrop-blur-sm text-center ${
          darkMode 
            ? 'bg-gray-800/20 text-gray-300' 
            : 'bg-white/20 text-gray-600'
        }`}>
          <p className="text-sm">
            <strong>How to use:</strong> Select text and use formatting buttons • Upload .txt/.doc/.docx/.rtf/.html files • Export to Markdown, DOCX & RTF formats • Click the table icon to insert tables
          </p>
        </div>
      </div>
    </div>
  );
};

export default TipTap;