import './App.css'
import {Route, Routes} from 'react-router-dom'
import Register from './pages/user/Register'
import Home from './pages/home/Home'
import Login from './pages/login/Login'
import PrivateRoute from "./components/PrivateRoute"
import LayoutWithFooter from './layouts/LayoutWihtFooter'
import Activities from './pages/activities/Activities'
import NewActivityForm from './pages/activities/NewActivityForm'

function App() {

  return(

    <div>
      <div className="pb-20">
        <Routes>
          <Route element = {<LayoutWithFooter/>}>
            <Route path='/' element={<PrivateRoute><Home/></PrivateRoute>}/>
            <Route path='/activities' element={<PrivateRoute><Activities/></PrivateRoute>}/>
            <Route path='/activities/new' element={<PrivateRoute><NewActivityForm/></PrivateRoute>}/>
          </Route>
          <Route path='/register' element={<Register/>}/>
          <Route path='/login' element={<Login/>}/>
        </Routes>
      </div>
    </div>
    
  )

  
}

export default App
