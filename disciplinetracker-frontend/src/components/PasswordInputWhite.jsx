import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const PasswordInput = ({ value, onChange, type = "text", placeholder, error}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="rounded-lg border text-xl border-white bg-transparent w-9/10 text-white 
                px-3 py-2 outline-none focus:ring-2 focus:ring-white 
                hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] transition duration-300"
        placeholder={placeholder}
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className=" text-white w-5 ml-1 my-2"
      >
        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

export default PasswordInput;