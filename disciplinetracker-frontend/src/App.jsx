import './App.css'
import {Route, Routes} from 'react-router-dom'
import Register from './pages/user/Register'
import Home from './pages/home/Home'

function App() {

  return(
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/register' element={<Register/>}/>
    </Routes>
  )

  
}

export default App
