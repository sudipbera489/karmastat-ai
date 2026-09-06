const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

function getCookie(name) {
    return document.cookie
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${name}=`))
        ?.split("=")[1] || "";
}

async function request(path, options = {}) {
    const csrfToken = getCookie("csrftoken");
    const isFormData = options.body instanceof FormData;
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
            ...options.headers,
        },
        credentials: "include",
        ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data.message || "The KarmaStat API is unavailable.");
        error.status = response.status;
        throw error;
    }
    return data;
}

export function login(userId, password) {
    return request("/login", {
        method: "POST",
        body: JSON.stringify({ userId, password }),
    });
}

export function signup(name, email, password, passwordConfirmation) {
    return request("/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, passwordConfirmation }),
    });
}

export function checkBackend() {
    return request("/test/");
}

export function getCurrentUser() {
    return request("/me");
}

export function logout() {
    return request("/logout", { method: "POST" });
}

export function getLearnerDashboard() {
    return request("/learner/dashboard");
}

export function analyzeLearner(formData) {
    return request("/learner/analyze", {
        method: "POST",
        body: formData,
    });
}

export function generateQuiz(formData) {
    return request("/learner/quiz", {
        method: "POST",
        body: formData,
    });
}

export function submitQuiz(payload) {
    return request("/learner/quiz/submit", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function getAdminDashboard() {
    return request("/admin/dashboard");
}

export function getWorkflow(role, section) {
    return request(`/workflow/${role}/${section}`);
}
