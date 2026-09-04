import RegistrationForm from "./RegistrationForm"
import BrandingHeadline from './BrandingHeadline'
import './RegistrationPage.css'

function RegistrationPage(){
    return (
        <div className="font-body-md text-on-surface antialiased w-full min-h-screen">
        <div className="w-full max-w-[1100px] flex flex-col md:flex-row relative z-10 p-md lg:p-xl gap-xl items-center mx-auto px-container-margin md:px-lg py-lg">
        <BrandingHeadline />
        <RegistrationForm />
        </div>
        </div>
    )
}

export default RegistrationPage