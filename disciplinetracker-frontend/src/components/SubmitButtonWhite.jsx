const SubmitButton = ({text}) =>{

    return <button type="submit" className="bg-white font-bold rounded-lg w-0.8 border text-xl border-white
    text-black px-3 py-2 outline-none focus:ring-2 focus:ring-white 
    hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] transition duration-300">
        {text}
    </button>
}

export default SubmitButton;