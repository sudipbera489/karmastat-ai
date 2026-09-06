import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkBackend, login } from "../api";

function Login() {

    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [backendConnected, setBackendConnected] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        checkBackend()
            .then(() => setBackendConnected(true))
            .catch(() => setBackendConnected(false));
    }, []);

    async function handleLogin(event) {

        event.preventDefault();

        if (!userId || !password) {
            setError("Please enter your ID and password.");
            return;
        }

        setError("");
        setIsLoading(true);
        try {
            const result = await login(userId, password);
            sessionStorage.setItem("karmastatUser", JSON.stringify(result.user));
            navigate("/role");
        } catch (loginError) {
            setError(loginError.message);
        } finally {
            setIsLoading(false);
        }

    }

    return (

        <div className="login-page">
            <div className="login-info">
                <div className="login-brand"><span>k</span> karmastat <em>AI</em></div>
                <div className="login-hero-copy">
                    <p className="login-kicker">THE LEARNING LAYER FOR OFFICIAL STATISTICS</p>
                    <h1>Grow the people<br /><i>behind the data.</i></h1>
                    <p className="tagline">
                        An AI-enabled learning and competency platform for India&apos;s Official Statistical System.
                    </p>
                </div>
                <div className="login-highlights">
                    <div><strong>01</strong><span>Discover your<br />skill gaps</span></div>
                    <div><strong>02</strong><span>Learn with a<br />personal path</span></div>
                    <div><strong>03</strong><span>Build a stronger<br />statistical system</span></div>
                </div>
                <div className="login-network"><span className="network-dot"></span><span>Designed for the people who make India count</span><span className="network-line"></span><span>SIH 2026 prototype</span></div>
            </div>

            <div className="login-box">
                <div className="login-box-inner">
                    <div className="login-box-top"><span className="mini-label">MEMBER ACCESS</span><span className="secure-label">⌁ Secure workspace</span></div>
                    <h2>Welcome back<span>.</span></h2>
                    <p className="login-subtitle">Sign in to continue building your capability.</p>
                    <p className={`backend-status ${backendConnected ? "connected" : "offline"}`}>
                        <span></span>{backendConnected ? "Backend connected" : "Backend offline"}
                    </p>


                <form onSubmit={handleLogin}>

                    <label>Email / Employee ID</label>

                    <input
                        type="text"
                        placeholder="Enter your ID"
                        value={userId}
                        onChange={(event) =>
                            setUserId(event.target.value)
                        }
                    />


                    <label>Password <a href="#forgot">Forgot password?</a></label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                    />


                    <button type="submit" disabled={isLoading}>{isLoading ? "Connecting..." : "Enter workspace"} <span>→</span></button>

                </form>

                    {error && <p className="login-error" role="alert">{error}</p>}


                    <div className="login-divider"><span>or</span></div>
                    <button className="sso-button" type="button"><span className="sso-icon">◈</span> Continue with official SSO <span>↗</span></button>
                    <p className="demo-text">New to KarmaStat AI? <button className="inline-link" type="button" onClick={() => navigate("/signup")}>Create an account</button></p>
                    <p className="login-legal">By continuing, you agree to the platform&apos;s terms of use and privacy policy.</p>
                </div>

            </div>

        </div>

    );
}

export default Login;