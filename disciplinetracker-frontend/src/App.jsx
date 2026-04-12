import './App.css'
import {Route, Routes} from 'react-router-dom'
import Register from './pages/user/Register'
import Home from './pages/home/Home'
import Login from './pages/login/Login'

function App() {

  return(
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/login' element={<Login/>}/>
    </Routes>
  )

  
}

export default App
