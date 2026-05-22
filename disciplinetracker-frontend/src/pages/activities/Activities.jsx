import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { ChartBarSquareIcon} from '@heroicons/react/24/outline';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { Link } from "react-router-dom";

const Activities = () => {
    const { accessToken } = useAuth();

    const API_URL = import.meta.env.VITE_API_URL;

    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const getActivities = async() =>{
            try{
                const response = await fetch(`${API_URL}/activities`,{
                    method: "GET",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                setActivities(data);
            }catch{

            }
        };
        if(accessToken) getActivities();
    }, [accessToken]);

    return(
        <div className='body-container'>
            <div className='h-[70vh] overflow-scroll '>
                <h1 className='text-[1.9rem]'>Mis habitos</h1>
                <div className='divide-y-1'>
                    {activities.map(activity => (
                        <Link key={activity.id} to={`/activities/${activity.id}`}>
                            <div className='flex h-[8vh] items-center'>
                                <p className='text-3xl ml-2 mt-1.5 font-medium'>{activity.activityName}</p>
                                <ChartBarSquareIcon className='w-9 ml-auto'/>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div>
                <Link to='/activities/new'>
                    <PlusCircleIcon className='w-15 ml-auto mt-3'/>
                </Link>
            </div>
        </div>
    )
};

export default Activities;