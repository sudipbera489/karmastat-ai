from django.urls import path
from .views import admin_dashboard, analyze_learner, current_user, generate_quiz, learner_dashboard, login_api, logout_api, signup_api, submit_quiz, test_api, workflow


urlpatterns = [
    path("test/", test_api),
    path("login", login_api),
    path("signup", signup_api),
    path("logout", logout_api),
    path("me", current_user),
    path("learner/dashboard", learner_dashboard),
    path("learner/analyze", analyze_learner),
    path("learner/quiz", generate_quiz),
    path("learner/quiz/submit", submit_quiz),
    path("admin/dashboard", admin_dashboard),
    path("workflow/<str:role>/<str:section>", workflow),
]