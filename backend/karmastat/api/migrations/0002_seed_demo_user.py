from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_demo_user(apps, schema_editor):
    User = apps.get_model("auth", "User")
    LearnerAnalysis = apps.get_model("api", "LearnerAnalysis")

    user, created = User.objects.get_or_create(
        username="demo",
        defaults={"first_name": "Arjun", "last_name": "Sharma", "email": "demo@karmastat.ai"},
    )
    if created:
        user.password = make_password("demo123")
        user.save()

    LearnerAnalysis.objects.get_or_create(
        user=user,
        defaults={
            "skills": [
                {"name": "Data analysis", "category": "Technical", "level": 82, "tone": "mint", "icon": "01"},
                {"name": "Python fundamentals", "category": "Technical", "level": 68, "tone": "blue", "icon": "02"},
                {"name": "Problem solving", "category": "Core", "level": 54, "tone": "gold", "icon": "03"},
                {"name": "Communication", "category": "Core", "level": 41, "tone": "coral", "icon": "04"},
            ],
            "learning_path": [
                {"number": "01", "title": "Build your communication story", "type": "Skill sprint", "time": "25 min", "done": False},
                {"number": "02", "title": "Add 2 data projects to your portfolio", "type": "Portfolio task", "time": "1 hr 20 min", "done": False},
                {"number": "03", "title": "Practice your analyst introduction", "type": "AI mock interview", "time": "15 min", "done": True},
            ],
        },
    )


def remove_demo_user(apps, schema_editor):
    User = apps.get_model("auth", "User")
    User.objects.filter(username="demo").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_demo_user, remove_demo_user),
    ]
