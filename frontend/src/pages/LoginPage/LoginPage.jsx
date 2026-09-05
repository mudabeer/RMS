import AuthPage from '../../components/Auth/AuthPage'
import LoginForm from './LoginForm'

function LoginPage({}){
    const childern = <LoginForm />
    const title = "Welcom Back"
    const description = "Login to manage your shared living."
    const brandingTitle = ["Fast, Efficient","and Productive"]
    const brandingDescription = "Streamline your shared living experience today."
    return (
        <AuthPage 
        childern={childern}
        title={title}
        description={description}
        brandingDescription={brandingDescription}
        brandingTitle={brandingTitle}
        />
    )
}

export default LoginPage