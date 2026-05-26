import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { Line, XAxis, YAxis, LineChart, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';


const AnnualState = () => {
    const { accessToken } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;
    const [monthlyReport, setMonthlyReport] = useState([]);

    useEffect(() => {
        const getMonthlyReport = async() =>{
            try{
                const response = await fetch(`${API_URL}/activities/track/monthly`,{
                    method: "GET",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                })
                const data = await response.json();
                const monthsOrder = {
                    Ene: 1,
                    Feb: 2,
                    Mar: 3,
                    Abr: 4,
                    May: 5,
                    Jun: 6,
                    Jul: 7,
                    Ago: 8,
                    Sep: 9,
                    Oct: 10,
                    Nov: 11,
                    Dic: 12,
                };

                const currentMonth = new Date().getMonth() + 1;

                const filteredData = data.filter(
                    item => monthsOrder[item.month] <= currentMonth
                );

                setMonthlyReport(filteredData);
            }catch(error){
                console.error(error);
            }
        }
        if(accessToken) getMonthlyReport();
    }, [accessToken, API_URL]);

    return  <div className='w-full h-100'>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={monthlyReport}
                        margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="month"
                            tick={{ fill: "#000000" }}
                        />

                        <YAxis
                            dataKey="tracksCount"
                            allowDecimals={false}
                            tick={{ fill: "#000000" }}
                        />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="tracksCount"
                            stroke="#000000"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
}

export default AnnualState;