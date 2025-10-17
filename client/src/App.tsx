import {useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";
import {AuthContextProvider} from "./context/AuthContextProvider.tsx";
import {ProtectedRoute} from "./components/ProtectedRoute.tsx";
import {DashboardUser} from './pages/DashboardUser.tsx'
import {DashboardAdmin} from './pages/DashboardAdmin.tsx'
import {NoAccess} from './pages/NoAccess.tsx'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/LoginPage.tsx";



const role = localStorage.getItem('role') || 'guest'

export const socket: Socket = io('http://localhost:5002', {
    autoConnect: false,
    auth: {
        role: 'guest'
    },
    withCredentials: true
})


function App() {
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        socket.on('connect', () => {
            setConnected(true)
            console.log("🟢 Connected to server")
        })

        socket.on('disconnect', () => {
            setConnected(false)
            console.log("🔴 Disconnected from server")
        })

        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };
    }, []);



    return (
        <AuthContextProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/no-access" element={<NoAccess />} />

                    <Route path="/user" element={
                        <ProtectedRoute requiredRole="user">
                            <DashboardUser />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                            <DashboardAdmin />
                        </ProtectedRoute>
                    } />

                </Routes>
            </BrowserRouter>
        </AuthContextProvider>
    )
}

export default App
