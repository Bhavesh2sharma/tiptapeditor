import { useState } from 'react'
import './App.css'
import TipTap from './components/TipTap'
import Quill from './components/Quill'
import Slate from './components/Slate'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <TipTap />
        {/* <Quill /> */}
        {/* <Slate /> */}
      </div>
     
    </>
  )
}

export default App
