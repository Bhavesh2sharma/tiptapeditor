import React, { useRef, useEffect, useState } from 'react';

// Quill editor with creative features
const QuillEditor = () => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Initialize Quill
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js';
    script.onload = () => initQuill();
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  const initQuill = () => {
    if (window.Quill && editorRef.current) {
      quillRef.current = new window.Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: false // Disable default toolbar
        },
        placeholder: '✨ Start your creative journey here...'
      });

      // Word count tracker
      quillRef.current.on('text-change', () => {
        const text = quillRef.current.getText().trim();
        setWordCount(text ? text.split(/\s+/).length : 0);
      });

      // Set initial content with creative styling
      const delta = {
        ops: [
          { insert: 'Welcome to Your Creative Space', attributes: { header: 1, color: '#6366f1' } },
          { insert: '\n\n' },
          { insert: 'This is where your ideas come to life. Start typing and watch the magic happen! ✨', attributes: { italic: true, color: '#64748b' } },
          { insert: '\n\n' },
          { insert: 'Features:', attributes: { bold: true } },
          { insert: '\n• ' },
          { insert: 'Live word count', attributes: { color: '#10b981' } },
          { insert: '\n• ' },
          { insert: 'Fullscreen mode', attributes: { color: '#f59e0b' } },
          { insert: '\n• ' },
          { insert: 'Dark/Light themes', attributes: { color: '#8b5cf6' } },
          { insert: '\n• ' },
          { insert: 'Auto-save (simulated)', attributes: { color: '#ef4444' } },
          { insert: '\n\n' }
        ]
      };
      quillRef.current.setContents(delta);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const applyFormat = (format, value = true) => {
    if (!quillRef.current) return;
    
    const range = quillRef.current.getSelection();
    if (range && range.length > 0) {
      // Apply formatting to selected text
      quillRef.current.formatText(range.index, range.length, format, value);
    } else {
      // Apply formatting to current cursor position for new text
      quillRef.current.format(format, value);
    }
    quillRef.current.focus();
  };

  const insertQuote = () => {
    const quotes = [
      '"The only way to do great work is to love what you do." - Steve Jobs',
      '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
      '"Creativity is intelligence having fun." - Albert Einstein',
      '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt'
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    if (quillRef.current) {
      const range = quillRef.current.getSelection();
      quillRef.current.insertText(range ? range.index : 0, randomQuote, { 
        italic: true, 
        color: '#6366f1',
        background: '#f1f5f9'
      });
    }
  };

  const insertEmoji = (emoji) => {
    if (quillRef.current) {
      const range = quillRef.current.getSelection();
      quillRef.current.insertText(range ? range.index : 0, emoji);
    }
  };

  const exportContent = () => {
    if (quillRef.current) {
      const html = quillRef.current.root.innerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-creative-document.html';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    } ${isFullscreen ? 'fixed inset-0 z-50' : 'p-4'}`}>
      
      <div className={`mx-auto transition-all duration-300 ${
        isFullscreen ? 'h-full max-w-full' : 'max-w-4xl'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 rounded-t-xl border-b ${
          theme === 'dark' 
            ? 'bg-gray-800/80 border-gray-700 backdrop-blur-sm' 
            : 'bg-white/80 border-gray-200 backdrop-blur-sm'
        } ${!isFullscreen && 'shadow-lg'}`}>
          
          <div className="flex items-center gap-4">
            <h1 className={`text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
              ✍️ Quill Editor
            </h1>
            <div className={`px-3 py-1 rounded-full text-sm ${
              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {wordCount} words
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Text Formatting */}
            <button
              onClick={() => applyFormat('bold')}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              B
            </button>
            
            <button
              onClick={() => applyFormat('italic')}
              className={`px-3 py-1.5 rounded-lg text-sm italic transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              I
            </button>

            <button
              onClick={() => applyFormat('underline')}
              className={`px-3 py-1.5 rounded-lg text-sm underline transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              U
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <button
              onClick={() => applyFormat('header', 1)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
            >
              H1
            </button>

            <button
              onClick={() => applyFormat('header', 2)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
            >
              H2
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <button
              onClick={() => applyFormat('color', '#ef4444')}
              className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
            ></button>

            <button
              onClick={() => applyFormat('color', '#10b981')}
              className="w-8 h-8 rounded-lg bg-green-500 hover:bg-green-600 transition-colors"
            ></button>

            <button
              onClick={() => applyFormat('color', '#3b82f6')}
              className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
            ></button>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            {/* Quick Emojis */}
            <div className="flex gap-1">
              {['✨', '🚀', '💡'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => insertEmoji(emoji)}
                  className={`w-8 h-8 rounded-lg text-lg hover:scale-110 transition-transform ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <button
              onClick={insertQuote}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
              }`}
            >
              💭
            </button>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'bg-gray-800 hover:bg-gray-900 text-white'
              }`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {isFullscreen ? '⤋' : '⤢'}
            </button>

            <button
              onClick={exportContent}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-100 hover:bg-green-200 text-green-700'
              }`}
            >
              💾
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className={`${
          isFullscreen ? 'h-[calc(100vh-80px)]' : 'min-h-[500px]'
        } ${
          theme === 'dark' 
            ? 'bg-gray-800/80 backdrop-blur-sm' 
            : 'bg-white/80 backdrop-blur-sm'
        } rounded-b-xl ${!isFullscreen && 'shadow-lg'} overflow-hidden`}>
          
          <div 
            ref={editorRef}
            className={`h-full ${
              theme === 'dark' 
                ? '[&_.ql-editor]:bg-gray-800 [&_.ql-editor]:text-gray-100 [&_.ql-toolbar]:bg-gray-700 [&_.ql-toolbar]:border-gray-600' 
                : '[&_.ql-editor]:bg-white [&_.ql-editor]:text-gray-900'
            } [&_.ql-editor]:text-lg [&_.ql-editor]:leading-relaxed [&_.ql-editor]:font-normal`}
            style={{ 
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
          />
        </div>

      
      </div>
    </div>
  );
};

export default QuillEditor;