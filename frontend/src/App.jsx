import {Routes, Route} from "react-router-dom"
import { lazy } from "react";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import GuestRoute from "./routes/GuestRoute.jsx";
const LandingPage  = lazy(()=>import("./pages/LandingPage/LandingPage.jsx"))
const RegistrationPage= lazy(() => import("./pages/registrationPage/RegistrationPage.jsx"))
const SendOtpPage= lazy(() => import("./pages/SendOtpPage/SendOtpPage.jsx"))
const LoginPage= lazy(() => import("./pages/LoginPage/LoginPage.jsx"))
const DashboardPage= lazy(() => import("./pages/DashboardPage/DashboardPage.jsx"))

export default function App(){
    return (
        <Routes>
            <Route element={<GuestRoute/>}>
                <Route index element={<LandingPage />}/>
                <Route path="/register" element={<RegistrationPage />}/>
                <Route path="/sendotp" element={<SendOtpPage />}/>
                <Route path="/login" element={<LoginPage />}/>
            </Route>

            <Route element={<ProtectedRoute/>}>
                <Route path="/Dashboard" element={<DashboardPage />}/>
            </Route>
        </Routes>
    )
}