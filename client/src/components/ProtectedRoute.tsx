import * as React from "react";
import {useContext} from "react";
import {Navigate} from "react-router-dom";
import type {RoleType} from "../context/AuthType.ts";
import {AuthContext} from "../context/AuthContext.tsx";


type ProtectedRouteType = {
    requiredRole: RoleType,
    children: React.ReactNode
}


export const ProtectedRoute = ({requiredRole, children}: ProtectedRouteType) => {

    const { isAuthenticated, role, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return null
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole !== role) {
        return <Navigate to="/no-access" replace />;
    }

    return <>{children}</>;
}