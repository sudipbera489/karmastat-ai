from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED

from .models import LearnerAnalysis, LearnerProfile

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None


DEFAULT_SKILLS = [
    {"name": "Data analysis", "category": "Technical", "level": 82, "tone": "mint", "icon": "01"},
    {"name": "Python fundamentals", "category": "Technical", "level": 68, "tone": "blue", "icon": "02"},
    {"name": "Problem solving", "category": "Core", "level": 54, "tone": "gold", "icon": "03"},
    {"name": "Communication", "category": "Core", "level": 41, "tone": "coral", "icon": "04"},
]

DEFAULT_LEARNING_PATH = [
    {"number": "01", "title": "Build your communication story", "type": "Skill sprint", "time": "25 min", "done": False},
    {"number": "02", "title": "Add 2 data projects to your portfolio", "type": "Portfolio task", "time": "1 hr 20 min", "done": False},
    {"number": "03", "title": "Practice your analyst introduction", "type": "AI mock interview", "time": "15 min", "done": True},
]

EMPTY_ANALYSIS = {
    "skills": [],
    "learning_path": [],
    "readiness": 0,
    "entered_skills": [],
    "recommendations": [],
}


def get_profile(user):
    profile, _ = LearnerProfile.objects.get_or_create(user=user)
    name = user.get_full_name() or user.username
    initials = "".join(part[0] for part in name.split()[:2]).upper() or "U"
    return {
        "name": name,
        "email": user.email,
        "initials": initials,
        "headline": profile.headline,
        "department": profile.department,
    }


def extract_resume_text(upload):
    if not upload:
        return ""
    content = upload.read()
    if upload.name.lower().endswith(".pdf") and PdfReader:
        reader = PdfReader(upload.file)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    return content.decode("utf-8", errors="ignore")


def build_recommendations(resume_text, entered_skills):
    combined = f"{resume_text} {' '.join(entered_skills)}".lower()
    recommendations = []
    catalog = [
        ("python", "Python for Data Analysis", "Python", "https://www.youtube.com/results?search_query=python+for+data+analysis", "Build stronger Python fundamentals."),
        ("sql", "SQL for Data Analysis", "SQL", "https://www.youtube.com/results?search_query=sql+for+data+analysis", "Practice querying and working with real datasets."),
        ("power bi", "Power BI Data Visualization", "Power BI", "https://www.youtube.com/results?search_query=power+bi+data+visualization", "Improve dashboard and reporting skills."),
        ("communication", "Data Storytelling", "Communication", "https://www.youtube.com/results?search_query=data+storytelling", "Turn analysis into clear recommendations."),
        ("statistics", "Statistics for Data Analysis", "Statistics", "https://www.youtube.com/results?search_query=statistics+for+data+analysis", "Strengthen statistical reasoning and interpretation."),
    ]
    for keyword, title, skill, url, reason in catalog:
        if keyword not in combined:
            recommendations.append({"title": title, "skill": skill, "url": url, "reason": reason, "type": "Video lesson"})
    return recommendations[:3]


def build_analyzed_skills(entered_skills):
    tones = ["mint", "blue", "gold", "coral"]
    return [
        {
            "name": skill,
            "category": "From your profile",
            "level": 70,
            "tone": tones[index % len(tones)],
            "icon": str(index + 1).zfill(2),
        }
        for index, skill in enumerate(entered_skills)
    ]


def build_quiz_questions(material_text, count, difficulty, learner_skills, topic=""):
    topic = topic.strip() or (learner_skills[0] if learner_skills else "official statistics")
    source = material_text.strip()[:120]
    passages = [
        passage.strip(" -:;,.\n\t")
        for passage in material_text.replace("\n", " ").replace(".", ".| ").split("|")
        if len(passage.strip()) > 35
    ]
    passages = passages or [f"The topic {topic} covers key concepts, practical application, evidence, and competency development."]
    distractors = [
        "The material recommends ignoring evidence and context.",
        "The material says competency does not require practice.",
        "The material focuses only on unrelated administrative tasks.",
    ]
    templates = [
        f"What is an important concept in {topic}?",
        f"Which statement best describes {topic}?",
        f"What should a learner understand when studying {topic}?",
        f"Which option best applies to {topic}?",
    ]
    questions = []
    for index in range(count):
        passage = passages[index % len(passages)]
        options = [passage, distractors[index % len(distractors)], distractors[(index + 1) % len(distractors)], distractors[(index + 2) % len(distractors)]]
        questions.append({
            "id": index + 1,
            "question": templates[index % len(templates)],
            "options": options,
            "answer": 0,
            "explanation": "The correct answer is taken from the uploaded learning material.",
            "difficulty": difficulty,
            "sourceHint": source,
        })
    return questions


@ensure_csrf_cookie
@api_view(['GET'])
def test_api(request):
    return Response({
        "message": "KarmaStat AI Backend Connected!",
        "status": "success"
    })


@api_view(['POST'])
def login_api(request):
    user_id = str(request.data.get("userId", "")).strip()
    password = str(request.data.get("password", ""))

    if not user_id or not password:
        return Response({"message": "User ID and password are required."}, status=HTTP_400_BAD_REQUEST)

    account = User.objects.filter(Q(username__iexact=user_id) | Q(email__iexact=user_id)).first()
    username = account.username if account else user_id
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({"message": "Invalid user ID or password."}, status=HTTP_401_UNAUTHORIZED)

    login(request, user)
    analysis, _ = LearnerAnalysis.objects.get_or_create(
        user=user,
        defaults=EMPTY_ANALYSIS,
    )
    get_profile(user)
    return Response({
        "user": {"id": user.username, "name": user.get_full_name() or user.username, "role": "admin" if user.is_staff else "learner"},
        "analysisId": analysis.id,
        "message": "Login successful.",
    })


@api_view(['POST'])
def signup_api(request):
    name = str(request.data.get("name", "")).strip()
    email = str(request.data.get("email", "")).strip().lower()
    password = str(request.data.get("password", ""))
    password_confirmation = str(request.data.get("passwordConfirmation", ""))

    if not name or not email or not password or not password_confirmation:
        return Response({"message": "Name, email, and both password fields are required."}, status=HTTP_400_BAD_REQUEST)
    if password != password_confirmation:
        return Response({"message": "Passwords do not match."}, status=HTTP_400_BAD_REQUEST)
    if User.objects.filter(Q(username__iexact=email) | Q(email__iexact=email)).exists():
        return Response({"message": "An account with this email already exists."}, status=HTTP_400_BAD_REQUEST)

    try:
        validate_password(password)
    except ValidationError as error:
        return Response({"message": error.messages[0]}, status=HTTP_400_BAD_REQUEST)

    first_name, *last_names = name.split()
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=" ".join(last_names),
    )
    analysis = LearnerAnalysis.objects.create(
        user=user,
        **EMPTY_ANALYSIS,
    )
    get_profile(user)
    login(request, user)

    return Response({
        "user": {"id": user.username, "name": user.get_full_name(), "role": "learner"},
        "analysisId": analysis.id,
        "message": "Account created successfully.",
    }, status=201)


@api_view(['POST'])
def logout_api(request):
    logout(request)
    return Response({"message": "Logged out."})


@api_view(['GET'])
def current_user(request):
    if not request.user.is_authenticated:
        return Response({"message": "Authentication required."}, status=HTTP_401_UNAUTHORIZED)

    return Response({
        "user": {"id": request.user.username, "name": request.user.get_full_name() or request.user.username, "role": "admin" if request.user.is_staff else "learner"},
        "profile": get_profile(request.user),
    })


@api_view(['GET'])
def learner_dashboard(request):
    if not request.user.is_authenticated:
        return Response({"message": "Authentication required."}, status=HTTP_401_UNAUTHORIZED)

    analysis, _ = LearnerAnalysis.objects.get_or_create(
        user=request.user,
        defaults=EMPTY_ANALYSIS,
    )
    profile = get_profile(request.user)
    return Response({
        "user": {"name": request.user.get_full_name() or request.user.username},
        "profile": profile,
        "targetRole": analysis.target_role,
        "experience": analysis.experience_level,
        "interest": analysis.learning_interest,
        "readiness": analysis.readiness,
        "skills": analysis.skills,
        "learningPath": analysis.learning_path,
        "enteredSkills": analysis.entered_skills,
        "recommendations": analysis.recommendations,
        "hasResume": bool(analysis.resume_text.strip()),
    })


@api_view(['POST'])
def analyze_learner(request):
    if not request.user.is_authenticated:
        return Response({"message": "Authentication required."}, status=HTTP_401_UNAUTHORIZED)

    analysis, _ = LearnerAnalysis.objects.get_or_create(
        user=request.user,
        defaults={"skills": DEFAULT_SKILLS, "learning_path": DEFAULT_LEARNING_PATH},
    )
    resume_text = str(request.data.get("resumeText", "")).strip()
    uploaded_resume = request.FILES.get("resume")
    if uploaded_resume:
        resume_text = extract_resume_text(uploaded_resume).strip()

    raw_skills = request.data.get("skills", "")
    entered_skills = raw_skills if isinstance(raw_skills, list) else [skill.strip() for skill in str(raw_skills).split(",") if skill.strip()]
    target_role = str(request.data.get("role", "")).strip()
    experience_level = str(request.data.get("experience", "")).strip()
    learning_interest = str(request.data.get("interest", "")).strip()
    if not resume_text and not entered_skills:
        return Response({"message": "Add a resume or at least one skill before analyzing."}, status=HTTP_400_BAD_REQUEST)

    submitted_name = str(request.data.get("name", "")).strip()
    if submitted_name:
        name_parts = submitted_name.split()
        request.user.first_name = name_parts[0]
        request.user.last_name = " ".join(name_parts[1:])
        request.user.save(update_fields=["first_name", "last_name"])

    recommendations = build_recommendations(resume_text, entered_skills)
    analyzed_skills = build_analyzed_skills(entered_skills)
    readiness = min(95, 45 + len(entered_skills) * 8 + (10 if resume_text else 0))
    analysis.resume_text = resume_text
    analysis.entered_skills = entered_skills
    analysis.skills = analyzed_skills
    if target_role:
        analysis.target_role = target_role
    analysis.experience_level = experience_level
    analysis.learning_interest = learning_interest
    analysis.recommendations = recommendations
    analysis.readiness = readiness
    analysis.save(update_fields=["resume_text", "entered_skills", "skills", "recommendations", "readiness", "target_role", "experience_level", "learning_interest", "updated_at"])

    return Response({
        "readiness": analysis.readiness,
        "enteredSkills": analysis.entered_skills,
        "recommendations": analysis.recommendations,
        "targetRole": analysis.target_role,
        "experience": analysis.experience_level,
        "interest": analysis.learning_interest,
        "message": "Your profile was analyzed.",
    })


@api_view(['POST'])
def generate_quiz(request):
    if not request.user.is_authenticated:
        return Response({"message": "Authentication required."}, status=HTTP_401_UNAUTHORIZED)

    try:
        count = int(request.data.get("questionCount", 5))
    except (TypeError, ValueError):
        count = 5
    count = max(5, min(count, 20))
    difficulty = str(request.data.get("difficulty", "easy")).strip().lower()
    if difficulty not in {"easy", "medium", "hard"}:
        difficulty = "easy"

    material = request.FILES.get("learningFile")
    material_text = str(request.data.get("materialText", ""))
    topic = str(request.data.get("topic", "")).strip()
    topic_skills = str(request.data.get("skills", ""))
    if material:
        if material.name.lower().endswith(".pdf") and PdfReader:
            reader = PdfReader(material.file)
            material_text = "\n".join(page.extract_text() or "" for page in reader.pages)
        elif material.name.lower().endswith((".txt", ".md")):
            material_text = material.read().decode("utf-8", errors="ignore")

    if not material and not topic:
        return Response({"message": "Upload learning material or enter a topic before generating the quiz."}, status=HTTP_400_BAD_REQUEST)
    if material and not material_text.strip():
        return Response({"message": "We could not extract text from this file. Please upload a text-based PDF."}, status=HTTP_400_BAD_REQUEST)

    analysis, _ = LearnerAnalysis.objects.get_or_create(user=request.user, defaults=EMPTY_ANALYSIS)
    entered_skills = [skill.strip() for skill in topic_skills.split(",") if skill.strip()] or analysis.entered_skills
    questions = build_quiz_questions(material_text, count, difficulty, entered_skills, topic)
    return Response({
        "title": "KarmaStat AI Competency Quiz",
        "difficulty": difficulty,
        "questionCount": len(questions),
        "questions": questions,
        "message": "Quiz generated successfully.",
    })


@api_view(['POST'])
def submit_quiz(request):
    if not request.user.is_authenticated:
        return Response({"message": "Authentication required."}, status=HTTP_401_UNAUTHORIZED)

    questions = request.data.get("questions", [])
    answers = request.data.get("answers", {})
    if not isinstance(questions, list) or not isinstance(answers, dict):
        return Response({"message": "Quiz answers are invalid."}, status=HTTP_400_BAD_REQUEST)

    correct = 0
    review = []
    for question in questions:
        question_id = str(question.get("id"))
        selected = answers.get(question_id)
        correct_answer = int(question.get("answer", -1))
        try:
            selected_answer = int(selected) if selected is not None else None
        except (TypeError, ValueError):
            selected_answer = None
        is_correct = selected_answer == correct_answer
        if is_correct:
            correct += 1
        options = question.get("options", [])
        review.append({
            "id": question_id,
            "question": question.get("question", ""),
            "selected": options[selected_answer] if selected_answer is not None and selected_answer < len(options) else "Not answered",
            "correctAnswer": options[correct_answer] if 0 <= correct_answer < len(options) else "Unavailable",
            "isCorrect": is_correct,
            "explanation": question.get("explanation", "Review the uploaded material for this concept."),
        })

    total = len(questions)
    score = round(correct / total * 100) if total else 0
    incorrect = total - correct
    return Response({
        "correct": correct,
        "total": total,
        "score": score,
        "passed": score >= 60,
        "incorrect": incorrect,
        "unanswered": sum(item["selected"] == "Not answered" for item in review),
        "summary": "Strong understanding of the uploaded material." if score >= 80 else "Review the highlighted concepts and revisit the uploaded material.",
        "strengths": ["Evidence-based reasoning", "Understanding key concepts"] if score >= 60 else ["Attempted the assessment"],
        "improvementAreas": ["Review incorrect answers", "Practice applying concepts from the material"] if incorrect else ["Continue practicing to reinforce retention"],
        "nextSteps": ["Rewatch the relevant lesson", "Take the quiz again", "Apply the concept to a small practical example"],
        "review": review,
        "message": "Quiz submitted successfully.",
    })


@api_view(['GET'])
def admin_dashboard(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({"message": "Administrator access required."}, status=HTTP_401_UNAUTHORIZED)

    return Response({
        "activeLearners": User.objects.filter(is_staff=False, is_active=True).count(),
        "readiness": 68,
        "completion": 74,
        "needsAttention": 38,
    })


@api_view(['GET'])
def workflow(request, role, section):
    if not request.user.is_authenticated:
        return Response({"message": "Authentication required."}, status=HTTP_401_UNAUTHORIZED)

    return Response({"role": role, "section": section, "status": "available"})

