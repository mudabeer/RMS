import BrandingHeadline from "./BrandlingHeadline"
import AuthCard from "./AuthCard"
import './AuthPage.css'

function AuhtPage({childern, title, description,brandingTitle,brandingDescription}){
    return (
        <div className="flex justify-center font-body-md text-on-surface antialiased w-full min-h-screen">
        <div className="w-full max-w-[1100px] flex flex-col md:flex-row relative z-10 p-md lg:p-xl gap-xl items-center mx-auto px-container-margin md:px-lg py-lg">
        <BrandingHeadline brandingDescription={brandingDescription} brandingTitle={brandingTitle}/>
        <AuthCard childern={childern} title={title} description={description}/>
        </div>
        </div>
    )
}

export default AuhtPage