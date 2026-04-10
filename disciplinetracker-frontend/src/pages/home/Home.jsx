import {Link} from 'react-router-dom'

const Home = () => {

    let date = new Date();
    let year = date.getFullYear();
    let day = date.getDay();
    let dayName = date.toLocaleDateString("ES-es", {weekday: 'long'});
    dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    let monthName = date.toLocaleDateString("ES-es", {month:'long'})
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    console.log(monthName);


    return (
        <div className='body-container'>
            <h1 className='text-2xl'>{dayName}, {day} de {monthName} de {year} </h1>
            <ul>
                <li>Gimnasio</li>
            </ul>
            <h2>ESTADO SEMANAL</h2>
            <div>
                <Link to='/register'>Ir a registro</Link>
            </div>
        </div>

    );
}

export default Home;