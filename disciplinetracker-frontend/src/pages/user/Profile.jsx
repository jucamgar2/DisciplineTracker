import { useAuth } from "../../components/AuthContext";
import { useState, useEffect } from "react";
import AnnualState from "../../components/home/AnnualState";
import SubmitButtonBlack from "../../components/SubmitButtonBlack";

const Profile = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    let { accessToken, logout } = useAuth();
    const [user, setUser] = useState();
    const [initials, setInitials] = useState("");
    const month = new Date().getMonth() +1;
    const [compPorc, setCompPorc] = useState(0);
    const daysInMonth = new Date(new Date().getFullYear(), month, 0 ).getDate();
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const getUser = async() =>{
            try{
                const response = await fetch(`${API_URL}/users/detail`,{
                    method: "GET",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                setUser(data);
                setInitials(`${data?.name?.[0] || ""}${data?.lastName?.[0] || ""}`);
            }catch(error){
                console.error(error);
            }
        }
        if(accessToken) getUser();
    }, [API_URL, accessToken]);

    useEffect(() => {
        const getStatistics = async() => {
            try{
                const response = await fetch(`${API_URL}/activities/detail?month=${month}`,{
                    method: "GET",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                const countTracks = data.reduce((total, activity) => {
                    return total + activity.tracks.length;
                }, 0);
                setCompPorc(
                    Math.round((countTracks / (daysInMonth * data.length)) * 100)
                );
                const uniqueDates = new Set();

                data.forEach(activity => {
                    activity.tracks.forEach(trackDate => {
                        uniqueDates.add(trackDate);
                    });
                });

                let st = 0;
                const currentDate = new Date();

                while (true) {

                    const dateString = currentDate.toISOString().split("T")[0];

                    if (uniqueDates.has(dateString)) {
                        st++;
                        currentDate.setDate(currentDate.getDate() - 1);
                    } else {
                        break;
                    }
                }

                setStreak(st);
            }catch(error){
                console.error(error);
            }
        }
        if(accessToken) getStatistics();
    }, [API_URL, accessToken])

    return  <div className='body-container'>
            <h1 className='text-[1.9rem]'>Perfil</h1>
                {user && (
                    <div className="flex items-center gap-4">
                        <div className="
                            w-18 h-18
                            rounded-full
                            bg-black
                            text-white
                            flex items-center justify-center
                            text-xl font-bold
                        ">
                            {initials}
                        </div>

                        <div>
                            <p className="text-2xl font-semibold">
                                {user.username}
                            </p>

                            <p className="text-gray-500 text-xl">
                                {user.name} {user.lastName}
                            </p>
                        </div>

                    </div>
                )}
                <div className="mt-6">
                    <h2 className="text-xl">Estadísticas globales</h2>
                    <h3 className="font-light">Racha del mes: {streak}</h3>
                    <h3 className="font-light">Hábitos completados(mensuales): {compPorc}%</h3>
                </div>
                <div className="mt-6">
                    <h2 className="text-xl">Progreso anual</h2>
                    <AnnualState />
                </div>

                <form className="text-center items-center"
                onSubmit={(e) => {
                        e.preventDefault();
                        logout();
                    }}>
                    <SubmitButtonBlack text={"Cerrar sesión"}/>
                </form>

                
            </div>
}

export default Profile;