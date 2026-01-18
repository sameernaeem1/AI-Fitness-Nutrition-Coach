from openai import OpenAI

import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(env_path)

openai_api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=openai_api_key)

def generate_workout_plan(prompt):
    system_prompt = "You are a helpful assistant designed to output JSON. Do not include any markdown backticks in your response."
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}],
        seed=42,
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content


def build_prompt(profile, exercises):
    return f"""
    Create an effective 4 week workout plan specifically tailored for the user profile below. Your answer must be strictly JSON.
    Guide:
    - For each workout day, include 5-8 exercises that together take approximately 60 minutes to complete (including rest periods)
    - For each workout day, group together exercises so that the user can hit all main muscle groups effectively in a week given their weekly frequency, so they have a structured split (e.g. push,pull,legs / upper, lower etc)
    - Do not include duplicate or nearly-identical exercises on the same day (e.g. Barbell full squat and Barbell squat)

    User Profile:
    Gender: {profile.gender}
    Goal: {profile.goal}
    Height in cm: {profile.height_cm}
    Weight in kg: {profile.weight_kg}
    Experience Level: {profile.experience_level}
    Weekly Frequency: {profile.frequency}
    Equipment Available: {[e.name for e in profile.equipment]}
    Injuries Sustained: {[i.name for i in profile.injuries]}

    Available exercises (Only choose from these and make sure they are suitable for the user given their profile details, try to pick more conventional exercises that the user will be able to easily understand):
    {[
        {
            "id": e.id,
            "name": e.name,
            "muscle": e.target_muscle,
            "equipment": e.equipment.name if e.equipment else None
        }
        for e in exercises
    ]}

    Format the ouput in JSON so it has the following structure (provide cumulative offsets from the first day of the plan):
    {{
        "weeks": [
        {{
            "week_number": 1,
            "days": [
            {{
                "day_number": 1,
                "date_offset": 0,
                "exercises": [
                {{
                    "exercise_id": 20,
                    "name": "Shoulder press",
                    "sets": 3,
                    "reps": "10-12",
                    "suggested_weight": "40kg-45kg",
                    "suggested_rest_period": "60 seconds",
                    "notes": "Do a couple of warm up sets with light weight if needed"
                }}
                ]
            }}
            ]
        }}
        ]
    }}

    """
