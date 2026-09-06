import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkBackend, signup } from "../api";

function Signup() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [backendConnected, setBackendConnected] = useState(false);

    useEffect(() => {
        checkBackend()
            .then(() => setBackendConnected(true))
            .catch(() => setBackendConnected(false));
    }, []);

    async function handleSignup(event) {
        event.preventDefault();
        setError("");

        if (!name || !email || !password || !passwordConfirmation) {
            setError("Please complete every field.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await signup(name, email, password, passwordConfirmation);
            sessionStorage.setItem("karmastatUser", JSON.stringify(result.user));
            navigate("/role");
        } catch (signupError) {
            setError(signupError.message);
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
                    <h1>Build your<br /><i>next chapter.</i></h1>
                    <p className="tagline">Create a personal workspace for your skills, learning path, and career growth.</p>
                </div>
                <div className="login-highlights">
                    <div><strong>01</strong><span>Track your<br />skill strengths</span></div>
                    <div><strong>02</strong><span>See your<br />learning path</span></div>
                    <div><strong>03</strong><span>Grow with<br />clear guidance</span></div>
                </div>
                <div className="login-network"><span className="network-dot"></span><span>Designed for the people who make India count</span><span className="network-line"></span><span>SIH 2026 prototype</span></div>
            </div>

            <div className="login-box">
                <div className="login-box-inner">
                    <div className="login-box-top"><span className="mini-label">CREATE ACCOUNT</span><span className="secure-label">⌁ Secure workspace</span></div>
                    <h2>Start here<span>.</span></h2>
                    <p className="login-subtitle">Create your personal KarmaStat AI workspace.</p>
                    <p className={`backend-status ${backendConnected ? "connected" : "offline"}`}><span></span>{backendConnected ? "Backend connected" : "Backend offline"}</p>

                    <form onSubmit={handleSignup}>
                        <label>Full name</label>
                        <input type="text" placeholder="Enter your full name" value={name} onChange={(event) => setName(event.target.value)} />

                        <label>Email address</label>
                        <input type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />

                        <label>Password</label>
                        <input type="password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} />

                        <label>Confirm password</label>
                        <input type="password" placeholder="Repeat your password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} />

                        <button type="submit" disabled={isLoading}>{isLoading ? "Creating account..." : "Create workspace"} <span>→</span></button>
                    </form>

                    {error && <p className="login-error" role="alert">{error}</p>}
                    <p className="demo-text">Already have an account? <a href="/">Sign in</a></p>
                    <p className="login-legal">By continuing, you agree to the platform&apos;s terms of use and privacy policy.</p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
