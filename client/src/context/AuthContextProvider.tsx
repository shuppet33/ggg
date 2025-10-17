import {AuthContext} from "./AuthContext.tsx";
import * as React from "react";
import {useEffect, useState} from "react";
import type {RoleType} from "./AuthType.ts";
import {socket} from "../App.tsx";


export const AuthContextProvider = ({children}: { children: React.ReactNode }) => {

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [role, setRole] = useState<RoleType>('guest')
    const [isLoading, setIsLoading] = useState(true)

    const login = (userRole: RoleType) => {
        setRole(userRole)
        setIsAuthenticated(true)

        localStorage.setItem('role', userRole)

        socket.auth = {role: userRole}
        socket.connect()
    }

    const logout = () => {
        socket.disconnect();
        setRole('guest')
        setIsAuthenticated(false)

        localStorage.removeItem('role')
    }

    useEffect(() => {

        const savedRole = localStorage.getItem('role')

        if (savedRole === 'admin') login('admin')
        if (savedRole === 'user') login('user')

        setIsLoading(false)
    }, []);


    return <AuthContext value={{isAuthenticated, role, login, logout, isLoading}}>{children}</AuthContext>
}