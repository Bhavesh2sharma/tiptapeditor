import { useState } from 'react'
import './App.css'
// import TipTap from './components/TipTap'
// import Quill from './components/Quill'
// import Slate from './components/Slate'
import TipTap2 from './components/TipTap2'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <TipTap2 />
        {/* <TipTap /> */}
        {/* <Quill /> */}
        {/* <Slate /> */}
      </div>
     
    </>
  )
}

export default App
