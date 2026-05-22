import { useState } from 'react';
import { useNavigate } from "react-router-dom"
import { useAuth } from '../../components/AuthContext';
import SimpleInputBlack from '../../components/SimpleInputBlack';
import SubmitButtonBlack from '../../components/SubmitButtonBlack';

const NewActivityForm = () => {
    const { accessToken } = useAuth();
    
    const API_URL = import.meta.env.VITE_API_URL;

    let year = new Date().getFullYear();
    let monthNumber = new Date().getMonth()+1;
    const daysInMonth = new Date(year, monthNumber, 0 ).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    let monthName = new Date().toLocaleDateString("ES-es", {month:'long'});
    const [errors, setErrors] = useState([]);
    const [serverError, setServerError] = useState("");

    const navigate = useNavigate();

    const[activityName, setActivityName] = useState("");

    const[tracks, setTracks] = useState([]);

    const addTrack = (track) =>{
        if(tracks.includes(track)){
            setTracks(tracks.filter(t => t !== track));
        }else{
            setTracks([...tracks, track]);
        }
    }

    const handleSubmit = async() => {
        try{
            const response = await fetch(`${API_URL}/activities/new`,{
                method: "POST",
                headers:{
                    "Content-Type":"application/json",
                        Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    activityName
                })
            });
            const status = response.status;
            const data = await response.json(); 
            console.log(response);
            if(status==200){
                const id = data.id;
                const trackDates = tracks.map((day) => {
                    const date = new Date(year, monthNumber-1, day);
                    return date.toISOString().split("T")[0];
                });
                const bodyData = {
                    tracks:[
                        {
                            activityId: id,
                            dates: trackDates
                        }
                    ]
                }
                const responseTracks = await fetch(`${API_URL}/activities/track/new`,{
                    method: "POST",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(bodyData)
                });
                const statusTracks = responseTracks.status;
                if(statusTracks == 200){
                    navigate("/activities")
                }
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
                }else{
                    setServerError("Estamos teniendo problemas con el servidor, vuelve a intentarlo más adelante")
                }
            }
        }catch{
            console.error();
        }
    }

    return(
        <div className='body-container'>
            <h1 className='text-[1.9rem]'>Nueva actividad</h1>
            <h2 className='text-[1.5rem]'>Registros para {monthName} de {year} </h2>
            <div className="form-space">
                <form className=' pt-3 text-2xl grid gap-y-4'
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}>
                    <SimpleInputBlack 
                        value={activityName}
                        onChange={(e) => setActivityName(e.target.value)}
                        placeholder={"Nueva actividad"}
                        error={errors.activityName}
                    />
                    <div className="grid grid-cols-7 gap-2">
                    {days.map((day) => (

                        tracks.includes(day)?
                            <div key={day} className="border rounded text-center 
                            bg-black text-white" onClick={() => addTrack(day)}>
                                {day}
                            </div>:
                            <div key={day} className="border rounded text-center "
                            onClick={() => addTrack(day)}>
                                {day}
                            </div>
                    ))}
                    </div>
                    <SubmitButtonBlack
                        text={"Registrar actividad"}
                    />
                    {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
                </form>                    
            </div>
            
        </div>
    )
}

export default NewActivityForm;