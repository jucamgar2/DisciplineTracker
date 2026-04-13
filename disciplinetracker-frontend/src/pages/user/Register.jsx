import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import './Register.css'
import SimpleInputWhite from '../../components/SimpleInputWhite'
import SubmitButtonWhite from '../../components/SubmitButtonWhite'
import LogoAndTitle from '../../components/LogoAndTitle'
import PasswordInput from "../../components/PasswordInputWhite"

const Register = () => {
    const API_URL = import.meta.env.VITE_API_URL;

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [errors, setErrors] = useState([]);
    const [serverError, setServerError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async() =>{
        try{
            const response = await fetch(`${API_URL}/users/new`,{
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    username,
                    password,
                    name,
                    lastName,
                    birthDate
                })
            });
            const data = await response.json(); 
            const status = response.status;
            if(status==200){
                navigate("/login?success=true")
            }else{
                const errorsResponse = data.errors;
                if(errorsResponse){
                    const formattedErrors = errorsResponse.reduce((acc, err) => {
                        if (!acc[err.field]) {
                            acc[err.field] = err.message;
                        }
                        return acc;
                    }, {});
                    setErrors(formattedErrors);
                    console.log(formattedErrors);
                }else{
                    setServerError("Estamos teniendo problemas con el servidor, vuelve a intentarlo más adelante")
                }
                
            }
        }catch(error){
            console.error(error);
        }
    }

    return(
        <div className="bg-black text-white p-10 min-h-screen">
            <LogoAndTitle/>
            <div className='form-space' >
                <form className=' pt-3 text-2xl grid gap-y-4' onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}>
                    <SimpleInputWhite 
                        value={username}
                        onChange={(e)=> setUsername(e.target.value)}
                        placeholder={"Nombre de usuario"}
                        error={errors.username}
                    />
                    <PasswordInput 
                        value={password}
                        onChange={(e)=> setPassword(e.target.value)}
                        placeholder={"Contraseña"}
                        error={errors.password}
                    />
                    <SimpleInputWhite 
                        value={name}
                        onChange={(e)=> setName(e.target.value)}
                        placeholder={"Nombre"}
                        error={errors.name}
                    />
                    <SimpleInputWhite 
                        value={lastName}
                        onChange={(e)=> setLastName(e.target.value)}
                        placeholder={"Apellido"}
                        error={errors.lastName}
                    />
                    <SimpleInputWhite 
                        value={birthDate}
                        onChange={(e)=> setBirthDate(e.target.value)}
                        type='date'
                        placeholder={"Fecha de nacimiento"}
                        error={errors.birthDate}
                    />
                    <SubmitButtonWhite
                        text={"Registrarse"}
                    />
                    {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
                    
                </form>
                <div className='text-center my-2'>
                    <h2>¿Ya tienes una cuenta? </h2>
                    <h2 className='underline'><a href='/login'>Iniciar sesión</a></h2>
                </div>
                
            </div>
            
        </div>

        
    )
}

export default Register;