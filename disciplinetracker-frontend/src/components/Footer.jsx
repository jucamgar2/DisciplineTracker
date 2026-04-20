import { UserCircleIcon, ListBulletIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { CalendarDateRangeIcon, UserIcon, QueueListIcon  } from '@heroicons/react/24/solid'
import { Link, useLocation } from "react-router-dom";
import { useState } from 'react';

const Footer = () => {

    const [page, setPage] = useState("Home");

    const location = useLocation();

    const inActivities = location.pathname.startsWith('/activities');
    const inProfile = location.pathname.startsWith('/user');
    
    return (
    <footer className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-between items-center px-6 py-3">
        <Link to='/'  onClick={() => setPage("Home")}>
            <button className="flex flex-col items-center ">
                {!inProfile && !inActivities && <CalendarDateRangeIcon className="w-8 text-black" />}
                {(inProfile || inActivities) && <CalendarIcon className="w-8" />}
                <p>Hoy</p>
            </button>
        </Link>
        <Link to='/activities'  onClick={() => setPage("Activities")}>
            <button className="flex flex-col items-center mx-auto">
                {inActivities?
                    <QueueListIcon className="w-8" />:
                    <ListBulletIcon className="w-8" />
                }
                <p>Mis hábitos</p>
            </button>
        </Link>
        <button className="flex flex-col items-center">
            {inProfile?
                <UserIcon className="w-8" />:
                <UserCircleIcon className="w-8" />
            }
            <p>Perfil</p>
        </button>
    </footer>
    )

}

export default Footer;