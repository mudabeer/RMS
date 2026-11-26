import AuthPage from '../../components/Auth/AuthPage'
import LoginForm from './LoginForm'

function LoginPage({}){
    const title = "Welcom Back"
    const description = "Login to manage your shared living."
    const brandingTitle = ["Fast, Efficient","and Productive"]
    const brandingDescription = "Streamline your shared living experience today."
    return (
        <AuthPage 
        title={title}
        description={description}
        brandingDescription={brandingDescription}
        brandingTitle={brandingTitle}
        >
            <LoginForm />
        </AuthPage>
    )
}

export default LoginPage