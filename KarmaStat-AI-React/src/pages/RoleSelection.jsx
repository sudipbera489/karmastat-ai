import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLearnerDashboard } from "../api";

function RoleSelection() {

    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem("karmastatUser") || "null");
    const [isOpeningLearner, setIsOpeningLearner] = useState(false);

    async function selectRole(role) {

        if (role === "learner") {
            setIsOpeningLearner(true);
            try {
                const dashboard = await getLearnerDashboard();
                const hasAssessment = Boolean(dashboard.hasResume || dashboard.enteredSkills?.length);
                navigate(hasAssessment ? "/learner-dashboard" : "/learner/assessment");
            } finally {
                setIsOpeningLearner(false);
            }
        }

        else if (role === "admin") {
            navigate("/admin-dashboard");
        }

    }

    return (

        <div className="role-page">
            <div className="role-orbit role-orbit-one"></div>
            <div className="role-orbit role-orbit-two"></div>
            <header className="role-header">
                <div className="role-brand"><span>k</span> karmastat <em>AI</em></div>
                <div className="role-session"><span className="session-dot"></span> Signed in as <strong>{user?.name || user?.id || "authenticated user"}</strong></div>
            </header>

            <main className="role-main">
                <div className="role-intro">
                    <p className="role-kicker">YOUR PERSONALIZED STATISTICS WORKSPACE</p>
                    <h1>Choose your<br /><i>way in.</i></h1>
                    <p>Select the workspace that fits your responsibility. You can switch roles any time from your profile.</p>
                </div>

                <div className="role-options">
                    <button className="role-card role-card-learner" onClick={() => selectRole("learner")} disabled={isOpeningLearner}>
                        <span className="role-card-top"><span className="role-number">01</span><span className="role-arrow">↗</span></span>
                        <span className="role-symbol">◌</span>
                        <span className="role-title">Learner</span>
                        <span className="role-description">Build the skills to make better data decisions.</span>
                        <span className="role-items"><span>Skill gap analysis</span><span>Personal learning path</span><span>Assessments &amp; progress</span></span>
                        <span className="role-cta">{isOpeningLearner ? "Opening assessment..." : "Enter learner workspace"} <b>→</b></span>
                    </button>

                    <button className="role-card role-card-admin" onClick={() => selectRole("admin")}>
                        <span className="role-card-top"><span className="role-number">02</span><span className="role-arrow">↗</span></span>
                        <span className="role-symbol">⌘</span>
                        <span className="role-title">Administrator</span>
                        <span className="role-description">Grow capability across your statistical team.</span>
                        <span className="role-items"><span>Team skill intelligence</span><span>Competency analytics</span><span>Learning interventions</span></span>
                        <span className="role-cta">Enter admin workspace <b>→</b></span>
                    </button>
                </div>
            </main>

            <footer className="role-footer"><span><b>k</b> KarmaStat AI</span><span>Official statistics, made stronger by people.</span><span>SIH 2026 prototype</span></footer>

        </div>

    );
}

export default RoleSelection;