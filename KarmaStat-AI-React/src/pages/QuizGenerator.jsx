import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateQuiz, submitQuiz } from "../api";

function QuizGenerator() {
    const navigate = useNavigate();
    const [learningFile, setLearningFile] = useState(null);
    const [quizMode, setQuizMode] = useState("topic");
    const [topic, setTopic] = useState("");
    const [skills, setSkills] = useState("");
    const [questionCount, setQuestionCount] = useState("5");
    const [difficulty, setDifficulty] = useState("easy");
    const [status, setStatus] = useState("");
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleGenerate(event) {
        event.preventDefault();
        setStatus("");
        if (quizMode === "material" && !learningFile) {
            setStatus("Upload a PDF or learning material before generating the quiz.");
            return;
        }
        if (quizMode === "topic" && !topic.trim()) {
            setStatus("Enter a topic before generating the quiz.");
            return;
        }
        setIsGenerating(true);
        const formData = new FormData();
        formData.append("questionCount", questionCount);
        formData.append("difficulty", difficulty);
        formData.append("topic", quizMode === "topic" ? topic : "");
        formData.append("skills", skills);
        if (learningFile) formData.append("learningFile", learningFile);

        try {
            const result = await generateQuiz(formData);
            setQuiz(result);
            setAnswers({});
            setResult(null);
            setStatus(result.message);
        } catch (error) {
            if (error.status === 401) navigate("/");
            else setStatus(error.message);
        } finally {
            setIsGenerating(false);
        }
    }

    async function handleSubmitQuiz(event) {
        event.preventDefault();
        setStatus("");
        setIsSubmitting(true);
        try {
            const response = await submitQuiz({
                questions: quiz.questions,
                answers,
            });
            setResult(response);
            setStatus(response.message);
        } catch (error) {
            if (error.status === 401) navigate("/");
            else setStatus(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="quiz-generator-page">
            <header className="quiz-topbar">
                <button className="workflow-brand" onClick={() => navigate("/learner-dashboard")}><span>k</span> karmastat <em>AI</em></button>
                <div className="quiz-topbar-actions"><span><i></i> Learner Portal</span><button onClick={() => navigate("/learner-dashboard")}>Dashboard</button></div>
            </header>

            <section className="quiz-generator-container">
                <div className="quiz-generator-box">
                    <header className="quiz-generator-header">
                        <p className="eyebrow">LEARNER PORTAL / PRACTICE</p>
                        <h1>AI Quiz Generator</h1>
                        <p>Upload learning material and generate competency-based MCQs automatically.</p>
                    </header>

                    <form onSubmit={handleGenerate}>
                        <div className="quiz-mode-tabs"><button type="button" className={quizMode === "topic" ? "active" : ""} onClick={() => setQuizMode("topic")}>Topic &amp; Skills</button><button type="button" className={quizMode === "material" ? "active" : ""} onClick={() => setQuizMode("material")}>Upload Material</button></div>

                        {quizMode === "topic" ? <section className="quiz-topic-section"><h2>1. Choose a Topic or Skill</h2><label htmlFor="quiz-topic">Topic<input id="quiz-topic" type="text" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Machine Learning, Statistics, Python" /></label><label htmlFor="quiz-skills">Skills to practice<input id="quiz-skills" type="text" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="e.g. classification, regression, data analysis" /><small>Separate skills with commas.</small></label></section> : <section className="quiz-upload-section">
                            <h2>1. Upload Learning Material</h2>
                            <label className="quiz-upload-box" htmlFor="learning-file">
                                <span className="quiz-upload-icon">▤</span>
                                <strong>{learningFile ? learningFile.name : "Upload PDF, PPT or DOCX"}</strong>
                                <small>Choose a file to use as quiz context</small>
                                <input id="learning-file" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.txt" onChange={(event) => setLearningFile(event.target.files?.[0] || null)} />
                            </label>
                        </section>}

                        <section className="quiz-settings">
                            <label htmlFor="question-count">Number of Questions<select id="question-count" value={questionCount} onChange={(event) => setQuestionCount(event.target.value)}><option value="5">5 Questions</option><option value="10">10 Questions</option><option value="15">15 Questions</option><option value="20">20 Questions</option></select></label>
                            <label htmlFor="quiz-difficulty">Difficulty<select id="quiz-difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
                        </section>

                        <button className="generate-quiz-button" type="submit" disabled={isGenerating}>{isGenerating ? "Generating..." : "✨ Generate AI Quiz"}</button>
                    </form>

                    {status && <p className="quiz-status" role="status">{status}</p>}
                    {quiz && <form className="quiz-results" onSubmit={handleSubmitQuiz}><div className="quiz-results-heading"><div><p className="eyebrow">GENERATED PRACTICE</p><h2>{quiz.title}</h2></div><span>{quiz.questionCount} questions / {quiz.difficulty}</span></div>{quiz.questions.map((question) => <fieldset className="quiz-question" key={question.id}><legend>{question.id}. {question.question}</legend><div>{question.options.map((option, index) => <label key={option}><input type="radio" name={`question-${question.id}`} value={index} checked={String(answers[question.id]) === String(index)} onChange={() => setAnswers((current) => ({ ...current, [question.id]: index }))} />{String.fromCharCode(65 + index)}. {option}</label>)}</div></fieldset>)}<button className="submit-quiz-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Checking answers..." : "Submit Quiz →"}</button>{result && <section className="quiz-analysis"><div className={`quiz-score ${result.passed ? "passed" : "needs-practice"}`}><strong>{result.score}%</strong><span>{result.correct} correct / {result.incorrect} incorrect / {result.unanswered} unanswered</span><b>{result.passed ? "Great work. You passed." : "Keep practicing and try again."}</b><p>{result.summary}</p></div><div className="quiz-analysis-grid"><div><h3>Strengths</h3><ul>{result.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Improvement Areas</h3><ul>{result.improvementAreas.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Next Steps</h3><ul>{result.nextSteps.map((item) => <li key={item}>{item}</li>)}</ul></div></div><div className="quiz-review"><h3>Question Review</h3>{result.review.map((item) => <article className={item.isCorrect ? "review-correct" : "review-incorrect"} key={item.id}><strong>{item.id}. {item.isCorrect ? "Correct" : "Needs review"}: {item.question}</strong><span>Your answer: {item.selected}</span><span>Correct answer: {item.correctAnswer}</span><p>{item.explanation}</p></article>)}</div></section>}</form>}
                    <p className="quiz-footer">KarmaStat AI • AI Quiz Generator • SIH 2026</p>
                </div>
            </section>
        </main>
    );
}

export default QuizGenerator;
