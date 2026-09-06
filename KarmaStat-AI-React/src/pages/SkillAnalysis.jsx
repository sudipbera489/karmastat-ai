import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLearnerDashboard } from "../api";

function SkillAnalysis() {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getLearnerDashboard()
            .then(setDashboard)
            .catch((requestError) => {
                if (requestError.status === 401) navigate("/");
                else setError(requestError.message);
            });
    }, [navigate]);

    if (error) return <main className="auth-loading">{error}</main>;
    if (!dashboard) return <main className="auth-loading">Loading your analysis...</main>;

    const skills = dashboard.skills || [];
    const recommendations = dashboard.recommendations || [];
    const hasAnalysis = Boolean(dashboard.hasResume || dashboard.enteredSkills?.length || skills.length);
    const profile = dashboard.profile;

    return (
        <main className="analysis-page">
            <header className="analysis-topbar">
                <button className="workflow-brand" onClick={() => navigate("/learner-dashboard")}><span>k</span> karmastat <em>AI</em></button>
                <div className="analysis-topbar-actions"><span><i></i> Learner Portal</span><button onClick={() => navigate("/learner-dashboard")}>Dashboard</button><button className="analysis-avatar" onClick={() => navigate("/learner/assessment")}>{profile?.initials || "U"}</button></div>
            </header>

            <section className="analysis-container">
                <div className="analysis-box">
                    <header className="analysis-header">
                        <p className="eyebrow">LEARNER PORTAL / SKILL GAP</p>
                        <h1>Skill Gap Analysis</h1>
                        <p>Your current competency profile has been analyzed.</p>
                    </header>

                    <div className="profile-summary">
                        <div><h2>{profile?.name || "Learner"}</h2><p>{dashboard.targetRole || "Role not selected"}</p></div>
                        <div className="analysis-readiness"><strong>{dashboard.readiness ?? 0}%</strong><span>overall competency</span></div>
                    </div>

                    {!hasAnalysis ? (
                        <section className="analysis-empty"><strong>Your profile has not been analyzed yet.</strong><p>Complete your learner assessment to see competency levels and skill gaps.</p><button onClick={() => navigate("/learner/assessment")}>Complete Assessment →</button></section>
                    ) : (
                        <>
                            <h2 className="section-title">Competency Overview</h2>
                            <div className="analysis-skill-results">
                                {skills.map((skill) => <div className="analysis-skill" key={skill.name}><div className="analysis-skill-info"><span>{skill.name}</span><strong>{skill.level}%</strong></div><div className="analysis-bar"><i style={{ width: `${skill.level}%` }}></i></div><small>{skill.category}</small></div>)}
                            </div>

                            <section className="gap-summary">
                                <h2>⚠ Skill Gaps Identified</h2>
                                <p>Based on your assessment, these competencies may require further development.</p>
                                <div className="gap-results">
                                    {recommendations.length ? recommendations.map((item) => <div className="gap-item" key={item.title}><span>{item.skill}</span><small>{item.reason}</small><b>Required</b></div>) : <div className="gap-item"><span>No major gaps identified</span><small>Keep practicing to maintain your progress.</small><b>On track</b></div>}
                                </div>
                            </section>
                        </>
                    )}

                    <button className="analysis-primary" onClick={() => navigate(hasAnalysis ? "/learner/learning-path" : "/learner/assessment")}>{hasAnalysis ? "View Personalized Learning Path" : "Start Learner Assessment"} →</button>
                    <p className="analysis-footer">KarmaStat AI • SIH 2026 Prototype</p>
                </div>
            </section>
        </main>
    );
}

export default SkillAnalysis;
