import {Routes, Route} from "react-router-dom"
import { lazy } from "react";
const LandingPage  = lazy(()=>import("./pages/LandingPage/LandingPage.jsx"))
const RegistrationPage= lazy(() => import("./pages/registrationPage/RegistrationPage.jsx"))
const SendOtpPage= lazy(() => import("./pages/SendOtpPage/SendOtpPage.jsx"))
const LoginPage= lazy(() => import("./pages/LoginPage/LoginPage.jsx"))
const DashboardPage= lazy(() => import("./pages/DashboardPage/DashboardPage.jsx"))

export default function App(){
    return (
        <Routes>
            <Route index element={<LandingPage />}/>
            <Route path="/register" element={<RegistrationPage />}/>
            <Route path="/sendotp" element={<SendOtpPage />}/>
            <Route path="/login" element={<LoginPage />}/>
            <Route path="/Dashboard" element={<DashboardPage />}/>
        </Routes>
    )
}