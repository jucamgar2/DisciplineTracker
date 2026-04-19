import { UserCircleIcon, ListBulletIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { CalendarDateRangeIcon, UserIcon, QueueListIcon  } from '@heroicons/react/24/solid'
import { Link } from "react-router-dom";

const Footer = () => {

    const inActivities =  location.pathname.startsWith('/activity');
    const inProfile = location.pathname.startsWith('/user');

    return (
    <footer className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-between items-center px-6 py-3">
        <Link to='/'>
            <button className="flex flex-col items-center ">
                {!inProfile && !inActivities && <CalendarDateRangeIcon className="w-8 text-black" />}
                {(inProfile || inActivities) && <CalendarIcon className="w-8" />}
                <p>Hoy</p>
            </button>
        </Link>
        <button className="flex flex-col items-center mx-auto">
            {inProfile?
                <QueueListIcon className="w-8" />:
                <ListBulletIcon className="w-8" />
            }
            <p>Mis hábitos</p>
        </button>
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