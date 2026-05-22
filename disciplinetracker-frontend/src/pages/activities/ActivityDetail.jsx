import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams  } from "react-router-dom"
import { useAuth } from '../../components/AuthContext';
import SubmitButtonBlack from '../../components/SubmitButtonBlack';


const ActivityDetail = () =>{
    let { accessToken } = useAuth();
    const [searchParams] = useSearchParams();
    let month = searchParams.get("month");
    const {id} = useParams();
    if(!month){
        month = new Date().getMonth()+1;
    }
    const API_URL = import.meta.env.VITE_API_URL;
    const [activityName, setActivityName] = useState("");
    const [initialTracks, setInitialTracks] = useState([]);
    let year = new Date().getFullYear();
    const daysInMonth = new Date(year, month, 0 ).getDate();
    const days = Array.from(
        { length: daysInMonth },
        (_, i) => 
            `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
    );
        let monthName = new Date().toLocaleDateString("ES-es", {month:'long'});

    const [clicked, setClicked] = useState([]);

    useEffect(() => {
        const getDetail = async() => {
            try{
                const response = await fetch(`${API_URL}/activities/detail/${id}?month=${month}`,{
                    method: "GET",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                setActivityName(data.name);
                setInitialTracks(data.tracks);
            }catch{
                console.error();
            }
        }
        if(accessToken) getDetail();
    }, [initialTracks]);

    const addTrack = (track) =>{
        if(clicked.includes(track)){
            setClicked(clicked.filter(t => t !== track));
        }else{
            setClicked([...clicked, track]);
        }
    }

    const handleSubmit = async() => {
        console.log(clicked);
        const bodyData = {
            tracks: [
                {
                    activityId: id,
                    dates: clicked,
                },
            ],
        };
        const responseTracks = await fetch(`${API_URL}/activities/track/new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(bodyData),
        });
        const statusTracks = responseTracks.status;
        if(statusTracks == 200){
            window.location.reload();
        }

    }

    return  <div className='body-container'>
                <h1 className='text-[1.9rem]'>{activityName}</h1>
                <h2 className='text-[1.5rem]'>Registros para {monthName} de {year} </h2>
                <div className="form-space">
                    <form className="pt-3 text-2xl grid gap-y-4"
                        onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}>
                    <div className="grid grid-cols-7 gap-2">
                    {days.map((day) => {
                        const isSelected =
                            initialTracks.includes(day) !== clicked.includes(day);
                        return (
                            <div
                                key={day}
                                className={`border rounded text-center ${
                                    isSelected ? "bg-black text-white" : "bg-white"
                                }`}
                                onClick={() => addTrack(day)}
                            >
                                {day.split("-")[2]}
                            </div>
                        );
                    })}
                    </div>
                    <SubmitButtonBlack
                        text={"Guardar datos"}
                    />

                    </form>
                </div>
            </div>
};

export default ActivityDetail;