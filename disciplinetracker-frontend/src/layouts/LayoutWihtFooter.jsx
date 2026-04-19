import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

const LayoutWithFooter = () => {
    return (
        <div>
            <div className="pb-20">
                <Outlet/>
            </div>
            <Footer/>
        </div>
    );
};

export default LayoutWithFooter;