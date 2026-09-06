from django.db import models
from django.contrib.auth.models import User


class LearnerProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
	headline = models.CharField(max_length=120, default="Learner profile")
	department = models.CharField(max_length=120, default="Official statistics")
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Profile for {self.user.username}"


class LearnerAnalysis(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="analysis")
	target_role = models.CharField(max_length=120, default="Data Analyst")
	experience_level = models.CharField(max_length=40, blank=True)
	learning_interest = models.CharField(max_length=80, blank=True)
	readiness = models.PositiveSmallIntegerField(default=72)
	skills = models.JSONField(default=list)
	learning_path = models.JSONField(default=list)
	resume_text = models.TextField(blank=True)
	entered_skills = models.JSONField(default=list)
	recommendations = models.JSONField(default=list)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Analysis for {self.user.username}"
