import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeLearner, getLearnerDashboard } from "../api";

function AssessmentPage() {
    const navigate = useNavigate();
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [skills, setSkills] = useState([]);
    const [interest, setInterest] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [readiness, setReadiness] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        getLearnerDashboard()
            .then((dashboard) => {
                setName(dashboard.profile?.name || "");
                setReadiness(dashboard.readiness);
                setRecommendations(dashboard.recommendations || []);
                setSkills(dashboard.enteredSkills || []);
                setRole(dashboard.targetRole || "");
                setExperience(dashboard.experience || "");
                setInterest(dashboard.interest || "");
            })
            .catch((requestError) => {
                if (requestError.status === 401) navigate("/");
                else setError(requestError.message);
            })
            .finally(() => setIsLoading(false));
    }, [navigate]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("role", role);
        formData.append("experience", experience);
        formData.append("skills", skills.join(","));
        formData.append("interest", interest);
        formData.append("resumeText", resumeText);
        if (resumeFile) formData.append("resume", resumeFile);

        try {
            const result = await analyzeLearner(formData);
            setReadiness(result.readiness);
            setRecommendations(result.recommendations || []);
            navigate("/learner-dashboard");
        } catch (requestError) {
            if (requestError.status === 401) navigate("/");
            else setError(requestError.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) return <main className="auth-loading">Loading your assessment...</main>;

    return (
        <main className="assessment-shell">
            <header className="workflow-header">
                <button className="workflow-brand" onClick={() => navigate("/learner-dashboard")}><span>k</span> karmastat <em>AI</em></button>
                <div className="workflow-context"><span className="workflow-status"></span>Learner workspace<button onClick={() => navigate("/learner-dashboard")}>Back to dashboard</button></div>
            </header>
            <section className="assessment-content">
                <div className="assessment-heading">
                    <div>
                        <p className="eyebrow">LEARNER PROFILE / ASSESSMENT</p>
                        <h1>Tell us about yourself.</h1>
                        <p>Complete your profile so KarmaStat AI can personalize your learning path and required skills.</p>
                    </div>
                    {readiness !== null && <div className="assessment-score"><strong>{readiness}%</strong><span>profile readiness</span></div>}
                </div>

                <div className="assessment-grid">
                    <form className="assessment-form" onSubmit={handleSubmit}>
                        <label htmlFor="name">Full name</label>
                        <input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" />

                        <label htmlFor="role">Current role</label>
                        <select id="role" value={role} onChange={(event) => setRole(event.target.value)} required>
                            <option value="">Select your role</option>
                            <option value="Statistical Analyst">Statistical Analyst</option>
                            <option value="Data Analyst">Data Analyst</option>
                            <option value="Researcher">Researcher</option>
                            <option value="Student / Trainee">Student / Trainee</option>
                            <option value="Other">Other</option>
                        </select>

                        <label htmlFor="experience">Experience level</label>
                        <select id="experience" value={experience} onChange={(event) => setExperience(event.target.value)} required>
                            <option value="">Select experience level</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>

                        <label>Current skills</label>
                        <div className="assessment-checkboxes">
                            {["Statistics", "Python", "Machine Learning", "Data Analysis", "GIS"].map((skill) => <label key={skill}><input type="checkbox" checked={skills.includes(skill)} onChange={(event) => setSkills((current) => event.target.checked ? [...current, skill] : current.filter((item) => item !== skill))} />{skill}</label>)}
                        </div>

                        <label htmlFor="interest">Primary learning interest</label>
                        <select id="interest" value={interest} onChange={(event) => setInterest(event.target.value)} required>
                            <option value="">Select an area</option>
                            <option value="Statistics">Statistics</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Machine Learning">Machine Learning</option>
                            <option value="Official Statistics">Official Statistics</option>
                            <option value="GIS & Spatial Analysis">GIS &amp; Spatial Analysis</option>
                        </select>

                        <label htmlFor="resume-file">Resume (optional)</label>
                        <input id="resume-file" type="file" accept=".pdf,.txt" onChange={(event) => setResumeFile(event.target.files?.[0] || null)} />
                        <small>PDF or TXT. You can also paste the text below.</small>

                        <label htmlFor="resume-text">Resume text</label>
                        <textarea id="resume-text" rows="8" value={resumeText} onChange={(event) => setResumeText(event.target.value)} placeholder="Paste your experience, projects, education, and tools..." />

                        <button className="assessment-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Analyzing..." : "Analyse my skills"}<span>-&gt;</span></button>
                        {error && <p className="login-error" role="alert">{error}</p>}
                    </form>

                    <section className="recommendation-panel">
                        <p className="eyebrow">YOUR NEXT WATCH</p>
                        <h2>{recommendations.length ? "Videos selected for you" : "Your recommendations will appear here"}</h2>
                        {recommendations.length ? recommendations.map((item) => (
                            <a className="recommendation-card" href={item.url} target="_blank" rel="noreferrer" key={item.title}>
                                <span className="recommendation-icon">01</span>
                                <span><strong>{item.title}</strong><small>{item.type} / {item.skill}</small><em>{item.reason}</em></span>
                                <b>-&gt;</b>
                            </a>
                        )) : <p className="recommendation-empty">Submit your resume or skills to get a focused learning list.</p>}
                    </section>
                </div>
            </section>
        </main>
    );
}

export default AssessmentPage;
