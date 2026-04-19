import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const WeeklyState = ({monthlyActivities}) => {
    const { accessToken } = useAuth();
    const [weeklyActivities, setWeeklyActivities] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;

    let date = new Date();
    

    useEffect(() => {
        const getActivitiesLastMonth = async() =>{
            let lastMonth = date.getMonth(); 
            if(lastMonth === 0){
                lastMonth = 12;
            }
            try{
                const response = await fetch(`${API_URL}/activities/detail?month=${lastMonth}`,{
                    method: "GET",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                setWeeklyActivities(prev => [...prev, ...data]);
            }catch{
                console.error();
            }

        }
        setWeeklyActivities(monthlyActivities);
        if(date.getDate()<7){
            getActivitiesLastMonth();
        }
    }, [monthlyActivities, accessToken]);

    const today = new Date();
    const last7DaysArray = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - i);
        return d;
    }).reverse();

    const tasksPerDay = last7DaysArray.map(day => {
        const dayString = day.toISOString().split("T")[0];
        let count = 0;
        weeklyActivities.forEach(activity => {
            if (activity.tracks.includes(dayString)) {
                count++;
            }
        });

        const dayName = day.toLocaleDateString("es-ES", { weekday: 'short' });

        return {
            date: dayString,
            dayName: dayName.charAt(0).toUpperCase() ,
            count
            };
    });

    return(
       <div className='h-[25vh] mt-2 text-[1.3rem] p-4'>
            <h1 className="text-xl font-bold mb-2">ESTADO SEMANAL</h1>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={tasksPerDay}
                    margin={{ top: 10, right: 10, left: -40, bottom: 0 }}
                >
                    <Bar dataKey="count"  fill="#D6D6D6" barSize={20}/>
                    <XAxis width="auto" dataKey="dayName" tick={{ fill: "#000000" }}/>
                    <YAxis allowDecimals={false} tick={{ fill: "#000000" }}/>
                    <Tooltip />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default WeeklyState;