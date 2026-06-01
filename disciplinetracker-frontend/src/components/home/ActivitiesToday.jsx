import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';


const ActivitiesToday = ({monthlyActivities, setMonthlyActivities}) => {
    const { accessToken } = useAuth();

    const [activities, setActivities] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL;

    let date = new Date();
    let day = date.getDate();
    let dayName = date.toLocaleDateString("ES-es", {weekday: 'long'});
    dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    let monthName = date.toLocaleDateString("ES-es", {month:'long'});
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    

    useEffect(() => {
        const getActivitiesToday = async() =>{
            const today = new Date().toISOString().split("T")[0];
            const result = monthlyActivities.map(activity => ({
                id: activity.id,
                name: activity.name,
                hasToday: activity.tracks.includes(today)
            }));
            setActivities(result);
        };
        getActivitiesToday();
    }, [monthlyActivities]);

    const completeActivity = async(activity) =>{
        const today = new Date().toISOString().split("T")[0]; 
        try{
            const bodyData = {
                tracks: [
                    {
                        activityId: activity.id,
                        dates: [today]
                    }
                ]
            };
            const response = await fetch(`${API_URL}/activities/track/new`,{
                    method: "POST",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(bodyData)
                });
            const status = response.status;
            if(status==200){
                setActivities(prevActivities =>
                    prevActivities.map(a =>
                        a.id === activity.id
                            ? { ...a, hasToday: !a.hasToday }
                            : a
                    )
                );
                setMonthlyActivities(prevMonthly =>
                    prevMonthly.map(a => {
                        if (a.id !== activity.id) return a;
                        const hasToday = a.tracks.includes(today);
                        return {
                            ...a,
                            tracks: hasToday
                                ? a.tracks.filter(date => date !== today)
                                : [...a.tracks, today] 
                        };
                    })
                );
            }
        }catch{
            console.error();
        }
    }

    return(
        <div className='h-[50vh] overflow-scroll'>
            <h1 className='text-[1.9rem]'>{dayName}, {day} de {monthName}</h1>
            <div className="p-4">
                {activities.map((activity) => (
                    <div key={activity.id} className='flex items-start gap-2 py-2'>
                        <button className="cursor-pointer transition-transform hover:scale-110 active:scale-95" onClick={() => completeActivity(activity)}>
                            {activity.hasToday ? 
                            (<div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="w-full h-full text-white" />
                            </div>) :
                            (<ClockIcon className='w-10 h-10'/>)}
                        </button>
                        

                        <p className='text-3xl ml-2 mt-1.5 font-medium'>{activity.name}</p>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default ActivitiesToday;