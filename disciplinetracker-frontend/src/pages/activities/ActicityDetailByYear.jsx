import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../components/AuthContext";

const ActivityDetailByYear = () =>{
    const API_URL = import.meta.env.VITE_API_URL;
    let { accessToken } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const {id} = useParams();
    const [tracks, setTracks] = useState([]);
    const [activityName, setActivityName] = useState("");
    const today = new Date();
    const currentYear = today.getFullYear();
    const selectedYear = Number(searchParams.get("year") || currentYear);

    useEffect(() => {
        const getTracks = async() => {
            try{
                const response = await fetch(`${API_URL}/activities/detail/${id}?year=${selectedYear}`,{
                    method: "GET",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                console.log(data);
                setActivityName(data.name);
                setTracks(data.tracks);
            }catch(error){
                console.error(error);
            }
        }
        if(accessToken) getTracks(); 
    }, [API_URL]);

    const months = [
        "E",
        "F",
        "M",
        "A",
        "M",
        "J",
        "J",
        "A",
        "S",
        "O",
        "N",
        "D",
    ];

    return  <div className='body-container'>
                <h1 className='text-[1.9rem]'>{activityName}</h1>
                <div className="flex gap-0 overflow-x-auto">
                    {months.map((monthName, monthIndex) => {
                        const daysInMonth = new Date(
                            selectedYear,
                            monthIndex + 1,
                            0
                        ).getDate();

                        return (
                            <div
                                key={monthIndex}
                                className="flex flex-col items-center"
                            >
                                <h2 className="font-bold mb-1">
                                    {monthName}
                                </h2>
                                {Array.from({ length: daysInMonth }, (_, i) => {
                                    const day = i + 1;
                                    const formattedDate =
                                        `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                    const hasTrack =
                                        tracks.includes(formattedDate);
                                    return (
                                        <div
                                            key={formattedDate}
                                            className={`
                                                w-7 h-7 border-[0.8px]
                                                ${hasTrack
                                                    ? "bg-black"
                                                    : "bg-white"}
                                            `}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
}

export default ActivityDetailByYear;