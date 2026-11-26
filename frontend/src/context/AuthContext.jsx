import {useContext,createContext,useState,useEffect} from 'react'
import refreshAxios from '../api/refreshAxios';
import { tokenStore } from '../api/tokenStore';
import api from '../api/axios';

const AuthContext = createContext(null)

export default function AuthProvider({children}){
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setloading] = useState(true);

    useEffect(() => {
        const unsubscribe = tokenStore.subscribe((token) => {
            setAccessToken(token);
            if (!token) {
                setUser(null);
            }
        });

        const restoreSession = async () => {
            try {
                const response = await refreshAxios.post("auth/refresh")
                tokenStore.set(response.data.accessToken);
                setUser(response.data.user);
            }catch{
                tokenStore.set(null);
                setUser(null);
            }finally{
                setloading(false)
            }
        }

        restoreSession()
        return unsubscribe;
    }, [])

    const login = (token, userData) => {
        tokenStore.set(token);
        setUser(userData);
    }

    const logout = async () => {
        try {
            await api.post('auth/logout');
        } catch {
            // Clear the local session even if the server is unreachable.
        } finally {
            tokenStore.set(null);
            setAccessToken(null);
            setUser(null);
        }
    }

    const value = {
        accessToken,
        user,
        loading,
        isAuthenticated: !!accessToken,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    const context = useContext(AuthContext);

    if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}
