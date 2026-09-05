import RegistrationForm from "./RegistrationForm"
import AuhtPage from "../../components/Auth/AuthPage"

function RegistrationPage(){
    const childern = <RegistrationForm />
    const title = "Sign Up"
    const description = "Create an account to get started."
    const brandingTitle = ["Fast, Efficient","and Productive"]
    const brandingDescription = "Streamline your shared living experience today."
    return (
        <AuhtPage 
        childern={childern}
        title={title}
        description={description}
        brandingDescription={brandingDescription}
        brandingTitle={brandingTitle}
        />
    )
}

export default RegistrationPage