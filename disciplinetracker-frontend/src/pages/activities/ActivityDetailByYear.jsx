import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
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
    const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

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
    }, [API_URL, accessToken, id, selectedYear]);

    const handleYearChange = (nextYear) => {
        setSearchParams((prevParams) => {
            const nextParams = new URLSearchParams(prevParams);
            nextParams.set("year", String(nextYear));
            return nextParams;
        });
    };

    const months = [
        { label: "E", month: 1 },
        { label: "F", month: 2 },
        { label: "M", month: 3 },
        { label: "A", month: 4 },
        { label: "M", month: 5 },
        { label: "J", month: 6 },
        { label: "J", month: 7 },
        { label: "A", month: 8 },
        { label: "S", month: 9 },
        { label: "O", month: 10 },
        { label: "N", month: 11 },
        { label: "D", month: 12 },
    ];

    return  <div className='body-container'>
                <h1 className='text-[1.9rem]'>{activityName}</h1>
                <div className="mt-2 mb-4 w-full">
                    <label className="text-[1.2rem] flex flex-col gap-1  ">
                        <span>Año</span>
                        <select
                            className="border rounded px-3 py-2 text-[1.2rem] w-full"
                            value={selectedYear}
                            onChange={(e) => handleYearChange(Number(e.target.value))}
                        >
                            {yearOptions.map((yearOption) => (
                                <option key={yearOption} value={yearOption}>
                                    {yearOption}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <div>
                    <h2 className="text-[1.2rem]">Actividad completada {tracks.length} veces en el año</h2>
                </div>
                <div className="w-full overflow-x-auto items-center">
                    <div className="mx-auto flex w-max gap-0">    
                        {months.map(({ label, month }) => {
                            return (
                                <div
                                    key={`month-${month}`}
                                    className="flex flex-col items-center"
                                >
                                    <h2 className="font-bold mb-1">
                                        {label}
                                    </h2>
                                    {Array.from({ length: 31 }, (_, i) => {
                                        const day = i + 1;
                                        const formattedDate =
                                            `${selectedYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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
                <div className="text-center">
                    <Link  className='text-[1.2rem] text-center cursor-pointer'
                        to={`/activities/${id}`}>
                        Ver reporte mensual
                    </Link>
                </div>
            </div>
}

export default ActivityDetailByYear;