import RegistrationForm from "./RegistrationForm"
import AuthPage from "../../components/Auth/AuthPage"

function RegistrationPage(){
    const title = "Sign Up"
    const description = "Create an account to get started."
    const brandingTitle = ["Fast, Efficient","and Productive"]
    const brandingDescription = "Streamline your shared living experience today."
    return (
        <AuthPage
        title={title}
        description={description}
        brandingDescription={brandingDescription}
        brandingTitle={brandingTitle}
        >
            <RegistrationForm />
        </AuthPage>
    )
}

export default RegistrationPage