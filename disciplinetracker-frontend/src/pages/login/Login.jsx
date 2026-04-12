import { useSearchParams, useNavigate } from "react-router-dom"
import LogoAndTitle from '../../components/LogoAndTitle'
import { useState } from 'react'
import SimpleInputWhite from '../../components/SimpleInputWhite'
import SubmitButtonWhite from '../../components/SubmitButtonWhite'
import PasswordInput from "../../components/PasswordInputWhite"

const Login = () =>{
    const API_URL = import.meta.env.VITE_API_URL;

    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const [serverError, setServerError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async() =>{
        try{
            const response = await fetch(`${API_URL}/users/login`,{
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });
            const data = await response.json(); 
            const status = response.status;
            if(status==200){
                navigate("/")
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
            {success &&<div className="text-center w-8/10  rounded-lg bg-white ml-[10%] h-8 flex items-center justify-center">
                 <p className="text-black text-m ">Registro completado con exito</p>
            </div>}
            
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
                    <SubmitButtonWhite
                        text={"Iniciar sesión"}
                    />
                    {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
                </form>
            </div>
            
        </div>
    )

}

export default Login;