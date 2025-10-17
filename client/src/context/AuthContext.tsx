import {createContext} from "react";
import type {RoleType} from "./AuthType.ts";


type AuthContextType = {
    isAuthenticated: boolean,
    role: RoleType,
    login: (role: RoleType) => void,
    logout: () => void,
    isLoading: boolean
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    role: 'guest',
    login: () => {},
    logout: () => {},
    isLoading: true
})