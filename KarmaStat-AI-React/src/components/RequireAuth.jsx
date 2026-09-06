import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../api";

function RequireAuth({ children }) {
    const [status, setStatus] = useState("checking");

    useEffect(() => {
        getCurrentUser()
            .then(() => setStatus("authenticated"))
            .catch(() => setStatus("unauthenticated"));
    }, []);

    if (status === "checking") {
        return <main className="auth-loading">Checking your workspace...</main>;
    }

    if (status === "unauthenticated") {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default RequireAuth;
