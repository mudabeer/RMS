import {Routes, Route} from "react-router-dom"
import { LandingPage } from "./pages/LandingPage/LandingPage.jsx"
import RegistrationPage from "./pages/registrationPage/RegistrationPage.jsx"

export default function App(){
    return (
        <Routes>
            <Route index element={<LandingPage />}/>
            <Route path="/register" element={<RegistrationPage />}/>
        </Routes>
    )
}