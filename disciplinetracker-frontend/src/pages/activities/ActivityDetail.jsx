import { useState, useEffect } from 'react';
import { useSearchParams, useParams  } from "react-router-dom"
import { useAuth } from '../../components/AuthContext';
import SubmitButtonBlack from '../../components/SubmitButtonBlack';

const capitalizeFirstLetter = (value) =>
    value.charAt(0).toUpperCase() + value.slice(1);

const ActivityDetail = () =>{
    let { accessToken } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const selectedMonth = Number(searchParams.get("month") || currentMonth);
    const selectedYear = Number(searchParams.get("year") || currentYear);
    const {id} = useParams();
    const API_URL = import.meta.env.VITE_API_URL;
    const [activityName, setActivityName] = useState("");
    const [initialTracks, setInitialTracks] = useState([]);
    const daysInMonth = new Date(selectedYear, selectedMonth, 0 ).getDate();
    const days = Array.from(
        { length: daysInMonth },
        (_, i) => 
            `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
    );
    const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString("ES-es", { month: "long" });
    const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    const [clicked, setClicked] = useState([]);

    useEffect(() => {
        const getDetail = async() => {
            try{
                const response = await fetch(`${API_URL}/activities/detail/${id}?month=${selectedMonth}&year=${selectedYear}`,{
                    method: "GET",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                setActivityName(data.name);
                setInitialTracks(data.tracks);
                setClicked([]);
            }catch{
                console.error();
            }
        }
        if(accessToken) getDetail();
    }, [API_URL, accessToken, id, selectedMonth, selectedYear]);

    useEffect(() => {
        if (!searchParams.get("month") || !searchParams.get("year")) {
            setSearchParams({ month: String(selectedMonth), year: String(selectedYear) });
        }
    }, [searchParams, selectedMonth, selectedYear, setSearchParams]);

    const addTrack = (track) =>{
        if(clicked.includes(track)){
            setClicked(clicked.filter(t => t !== track));
        }else{
            setClicked([...clicked, track]);
        }
    }

    const handlePeriodChange = (field, value) => {
        const nextMonth = field === "month" ? value : selectedMonth;
        const nextYear = field === "year" ? value : selectedYear;
        setSearchParams({ month: String(nextMonth), year: String(nextYear) });
    };

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
            globalThis.location.reload();
        }

    }

    return  <div className='body-container'>
                <h1 className='text-[1.9rem]'>{activityName}</h1>
                <h2 className='text-[1.5rem]'>Registros para {monthName} de {selectedYear} </h2>
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
                            <button
                                type="button"
                                key={day}
                                className={`border rounded text-center ${
                                    isSelected ? "bg-black text-white" : "bg-white"
                                }`}
                                onClick={() => addTrack(day)}
                            >
                                {day.split("-")[2]}
                            </button>
                        );
                    })}
                    </div>
                    <SubmitButtonBlack
                        text={"Guardar datos"}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="text-[1.2rem] flex flex-col gap-1">
                            <span>Mes</span>
                            <select
                                className="border rounded px-3 py-2 text-[1.2rem]"
                                value={selectedMonth}
                                onChange={(e) => handlePeriodChange("month", Number(e.target.value))}
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((monthOption) => (
                                    <option key={monthOption} value={monthOption}>
                                        {capitalizeFirstLetter(new Date(2000, monthOption - 1, 1).toLocaleDateString("ES-es", { month: "long" }))}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="text-[1.2rem] flex flex-col gap-1">
                            <span>Año</span>
                            <select
                                className="border rounded px-3 py-2 text-[1.2rem]"
                                value={selectedYear}
                                onChange={(e) => handlePeriodChange("year", Number(e.target.value))}
                            >
                                {yearOptions.map((yearOption) => (
                                    <option key={yearOption} value={yearOption}>
                                        {yearOption}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    </form>
                </div>
            </div>
};

export default ActivityDetail;