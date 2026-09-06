import json

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase


class ApiTests(TestCase):
	def test_backend_health(self):
		response = self.client.get("/api/test/")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()["status"], "success")

	def test_login_returns_user(self):
		response = self.client.post(
			"/api/login",
			data=json.dumps({"userId": "demo", "password": "demo123"}),
			content_type="application/json",
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()["user"]["id"], "demo")

	def test_login_requires_credentials(self):
		response = self.client.post(
			"/api/login",
			data=json.dumps({"userId": "", "password": ""}),
			content_type="application/json",
		)

		self.assertEqual(response.status_code, 400)

	def test_login_accepts_email(self):
		response = self.client.post(
			"/api/login",
			data=json.dumps({"userId": "demo@karmastat.ai", "password": "demo123"}),
			content_type="application/json",
		)

		self.assertEqual(response.status_code, 200)

	def test_signup_creates_user_and_analysis(self):
		response = self.client.post(
			"/api/signup",
			data=json.dumps({
				"name": "New Learner",
				"email": "new@karmastat.ai",
				"password": "StrongPass123!",
				"passwordConfirmation": "StrongPass123!",
			}),
			content_type="application/json",
		)

		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.json()["user"]["name"], "New Learner")
		dashboard = self.client.get("/api/learner/dashboard")
		self.assertEqual(dashboard.status_code, 200)
		self.assertEqual(dashboard.json()["skills"], [])
		self.assertEqual(dashboard.json()["readiness"], 0)

	def test_learner_dashboard_is_available(self):
		self.client.post(
			"/api/login",
			data=json.dumps({"userId": "demo", "password": "demo123"}),
			content_type="application/json",
		)
		response = self.client.get("/api/learner/dashboard")

		self.assertEqual(response.status_code, 200)
		self.assertIn("readiness", response.json())
		self.assertEqual(response.json()["profile"]["name"], "Arjun Sharma")
		self.assertEqual(response.json()["profile"]["initials"], "AS")

	def test_learner_can_analyze_skills(self):
		self.client.post(
			"/api/login",
			data=json.dumps({"userId": "demo", "password": "demo123"}),
			content_type="application/json",
		)
		response = self.client.post("/api/learner/analyze", {
			"name": "Updated Learner",
			"role": "Researcher",
			"experience": "Intermediate",
			"skills": "Excel, SQL",
			"interest": "Statistics",
		})

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()["enteredSkills"], ["Excel", "SQL"])
		self.assertEqual(response.json()["recommendations"][0]["skill"], "Python")
		self.assertEqual(response.json()["targetRole"], "Researcher")
		self.assertEqual(response.json()["experience"], "Intermediate")
		self.assertTrue(response.json()["recommendations"])

	def test_learner_can_generate_quiz(self):
		self.client.post(
			"/api/login",
			data=json.dumps({"userId": "demo", "password": "demo123"}),
			content_type="application/json",
		)
		material = SimpleUploadedFile("lesson.txt", b"Data quality means checking completeness and consistency before analysis.")
		response = self.client.post("/api/learner/quiz", {"questionCount": "10", "difficulty": "medium", "learningFile": material})

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()["questionCount"], 10)
		self.assertEqual(response.json()["difficulty"], "medium")
		self.assertEqual(len(response.json()["questions"]), 10)
		self.assertIn("Data quality", response.json()["questions"][0]["options"][0])

	def test_learner_can_submit_quiz(self):
		self.client.post(
			"/api/login",
			data=json.dumps({"userId": "demo", "password": "demo123"}),
			content_type="application/json",
		)
		material = SimpleUploadedFile("lesson.txt", b"Data quality means checking completeness and consistency before analysis.")
		quiz = self.client.post("/api/learner/quiz", {"questionCount": "5", "learningFile": material}).json()
		answers = {str(question["id"]): question["answer"] for question in quiz["questions"]}
		response = self.client.post(
			"/api/learner/quiz/submit",
			data=json.dumps({"questions": quiz["questions"], "answers": answers}),
			content_type="application/json",
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()["score"], 100)
		self.assertIn("strengths", response.json())
		self.assertIn("improvementAreas", response.json())
		self.assertIn("nextSteps", response.json())
		self.assertEqual(len(response.json()["review"]), 5)

	def test_learner_can_generate_quiz_from_topic(self):
		self.client.post(
			"/api/login",
			data=json.dumps({"userId": "demo", "password": "demo123"}),
			content_type="application/json",
		)
		response = self.client.post("/api/learner/quiz", {"topic": "Machine Learning", "skills": "classification, regression", "questionCount": "5"})

		self.assertEqual(response.status_code, 200)
		self.assertIn("Machine Learning", response.json()["questions"][0]["question"])
