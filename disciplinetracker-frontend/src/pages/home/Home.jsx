import { useEffect, useState } from 'react';
import {Link} from 'react-router-dom'
import ActivitiesToday from '../../components/home/ActivitiesToday';
import WeeklyState from '../../components/home/WeeklyState';
import { useAuth } from '../../components/AuthContext';

const Home = () => {
    const { accessToken } = useAuth();

    const [monthlyActivities, setMonthlyActivities] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL;

    let date = new Date();
    let monthNumber = date.getMonth()+1;

    useEffect(() => {
        const getActivitiesThisMonth = async() =>{
            try{
                const response = await fetch(`${API_URL}/activities/detail?month=${monthNumber}`,{
                    method: "GET",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                setMonthlyActivities(data);
            }catch{
                
            }
        };
        if(accessToken) getActivitiesThisMonth();
    }, [accessToken]);

    return (
        <div className='body-container'>
            <ActivitiesToday 
                monthlyActivities={monthlyActivities} 
            />
            <WeeklyState
                monthlyActivities={monthlyActivities}
            />
        </div>

    );
}

export default Home;