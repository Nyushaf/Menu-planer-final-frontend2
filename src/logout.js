import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Logout = () => {
    const { logout, isAuthenticated } = useAuth0();
    return (
        isAuthenticated && (
            <div className="login-logout">
                <button onClick={() => logout()}>
                Log Out
                </button>
            </div>
        )
    );
};

export default Logout;