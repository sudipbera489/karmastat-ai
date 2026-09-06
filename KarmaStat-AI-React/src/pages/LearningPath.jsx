import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLearnerDashboard } from "../api";

function LearningPath() {
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
    if (!dashboard) return <main className="auth-loading">Loading your learning path...</main>;

    const profile = dashboard.profile;
    const skills = dashboard.skills || [];
    const recommendations = dashboard.recommendations || [];
    const hasAnalysis = Boolean(dashboard.hasResume || dashboard.enteredSkills?.length || skills.length);
    const prioritySkill = skills.length ? [...skills].sort((left, right) => left.level - right.level)[0] : null;

    return (
        <main className="learning-page">
            <header className="learning-topbar">
                <button className="workflow-brand" onClick={() => navigate("/learner-dashboard")}><span>k</span> karmastat <em>AI</em></button>
                <div className="learning-topbar-actions"><span><i></i> Learner Portal</span><button onClick={() => navigate("/learner-dashboard")}>Dashboard</button><button className="learning-avatar" onClick={() => navigate("/learner/assessment")}>{profile?.initials || "U"}</button></div>
            </header>

            <section className="learning-container">
                <div className="learning-box">
                    <header className="learning-header">
                        <div><p className="eyebrow">LEARNER PORTAL / LEARNING PATH</p><h1>Personalized Learning Path</h1><p>Courses recommended based on your competency gaps and learning interests.</p></div>
                        <div className="match-badge">AI Powered</div>
                    </header>

                    <div className="learning-profile"><h2>{profile?.name || "Learner"}</h2><p>{dashboard.interest || "Learning interest not selected"}</p></div>

                    {!hasAnalysis ? (
                        <section className="learning-empty"><strong>Your personalized path is waiting.</strong><p>Complete your learner assessment to receive courses based on your competency gaps and interests.</p><button onClick={() => navigate("/learner/assessment")}>Complete Assessment →</button></section>
                    ) : (
                        <>
                            <section className="priority-section"><h2>Your Priority Skill</h2><div className="priority-card"><div><h3>{prioritySkill?.name || "Skill development"}</h3><p>Current competency: <strong>{prioritySkill?.level || 0}%</strong></p></div><span className="priority-label">High Priority</span></div></section>
                            <h2 className="section-title">Recommended Courses</h2>
                            <div className="course-grid">
                                {recommendations.length ? recommendations.map((course, index) => <a className="course-card" href={course.url} target="_blank" rel="noreferrer" key={course.title}><div className="course-number">0{index + 1}</div><div className="course-card-copy"><span>{course.type || "Recommended lesson"}</span><h3>{course.title}</h3><p>{course.reason}</p><strong>Required skill: {course.skill}</strong></div><b className="course-arrow">↗</b></a>) : <p className="learning-empty-copy">No additional courses are required right now. Keep practicing your current skills.</p>}
                            </div>
                        </>
                    )}

                    <p className="learning-footer">Recommendations shown using personalized competency data • SIH 2026</p>
                </div>
            </section>
        </main>
    );
}

export default LearningPath;
