const SimpleInputWhite = ({ value, onChange, type = "text", placeholder, error}) => {
    return (
        <div className=" w-0.8">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="rounded-lg border text-xl border-white bg-transparent w-full text-white 
                px-3 py-2 outline-none focus:ring-2 focus:ring-white 
                hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] transition duration-300"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    )
}

export default SimpleInputWhite;