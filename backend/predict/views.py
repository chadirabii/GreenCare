import os
import json
import traceback

from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import cloudinary.uploader
import tensorflow as tf
import numpy as np
from PIL import Image
from tensorflow.keras.preprocessing import image as keras_image

from openai import OpenAI

from .models import DetectionResult
from .serializers import DetectionResultSerializer

# === Paths to model and classes ===
MODEL_PATH = os.path.join(settings.BASE_DIR, "predict", "trainedModel", "plant_disease_prediction_model.h5")
CLASS_PATH = os.path.join(settings.BASE_DIR, "predict", "trainedModel", "classes.json")

model = None

def get_model():
    global model
    if model is None:
        model = tf.keras.models.load_model(MODEL_PATH)
    return model

# === Load classes ===
with open(CLASS_PATH, "r") as f:
    CLASSES = json.load(f)

# === Groq Client ===
groq_client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

class DetectionResultViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    # -----------------------------
    # GET /api/predict/history/
    # -----------------------------
    @action(detail=False, methods=["get"])
    def history(self, request):
        user = request.user
        try:
            detections = DetectionResult.objects.filter(user=user).order_by("-created_at")
            serializer = DetectionResultSerializer(detections, many=True)
            return Response(serializer.data)
        except Exception as e:
            print("Error fetching history:", e)
            traceback.print_exc()
            return Response({"error": "Failed to fetch history."}, status=500)

    # -----------------------------
    # GET /api/predict/<id>/history_detail/
    # -----------------------------
    @action(detail=True, methods=["get"])
    def history_detail(self, request, pk=None):
        """
        Retrieve a single DetectionResult by ID.
        Recommendations are returned as a list.
        """
        try:
            detection = DetectionResult.objects.get(id=pk, user=request.user)
        except DetectionResult.DoesNotExist:
            return Response(
                {"error": "History entry not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Parse recommendations from Groq response if stored as raw text
        recommendations = detection.recommendations or []
        if not isinstance(recommendations, list):
            # If it's a string, split by newline or bullet
            recommendations = [r.strip("• ").strip() for r in detection.recommendations.split("\n") if r.strip()]

        data = DetectionResultSerializer(detection).data
        data['recommendations'] = recommendations  # overwrite with parsed list
        return Response(data, status=status.HTTP_200_OK)

    # -----------------------------
    # POST /api/predict/predict/
    # -----------------------------
    @action(detail=False, methods=["post"])
    def predict(self, request):
        user = request.user
        img_file = request.FILES.get("image")

        if not img_file:
            return Response({"error": "Image file is required."}, status=400)

        try:
            # -----------------------------
            # 1) Upload to Cloudinary
            # -----------------------------
            upload_result = cloudinary.uploader.upload(
                img_file,
                folder="greencare/predict",
                resource_type="image"
            )
            image_url = upload_result.get("secure_url")

            # -----------------------------
            # 2) Load & preprocess image
            # -----------------------------
            img = Image.open(img_file).convert("RGB")
            img = img.resize((224, 224))
            x = keras_image.img_to_array(img)
            x = np.expand_dims(x, axis=0) / 255.0

            # -----------------------------
            # 3) Predict disease
            # -----------------------------
            model = get_model()
            preds = model.predict(x)[0]

            class_idx = int(np.argmax(preds))
            confidence = float(preds[class_idx] * 100)
            disease_name = CLASSES.get(str(class_idx), "Unknown")
            status_label = "healthy" if "healthy" in disease_name.lower() else "diseased"

            # -----------------------------
            # 4) Groq AI Recommendations
            # -----------------------------
            recommendations = []
            groq_raw_response_str = None

            if status_label == "diseased":
                prompt = f"Give clear, short treatment steps for this plant disease: {disease_name}."

                try:
                    groq_response = groq_client.responses.create(
                        model="llama-3.3-70b-versatile",
                        input=prompt
                    )

                    # Log raw response for debugging
                    print("Groq raw response:", groq_response)
                    groq_raw_response_str = str(groq_response)

                    # Extract text safely
                    if hasattr(groq_response, "output") and groq_response.output:
                        for item in groq_response.output:
                            if hasattr(item, "content") and item.content:
                                for c in item.content:
                                    if hasattr(c, "text") and c.text:
                                        for line in c.text.split("\n"):
                                            line = line.strip()
                                            if line:
                                                recommendations.append(line)

                    if not recommendations:
                        recommendations = ["Failed to get recommendations from AI."]
                except Exception as e:
                    print("Groq API error:", e)
                    traceback.print_exc()
                    recommendations = ["Failed to get recommendations from AI."]

            # -----------------------------
            # 5) Save to DB
            # -----------------------------
            detection = DetectionResult.objects.create(
                user=user,
                image_url=image_url,
                status=status_label,
                disease=disease_name,
                confidence=confidence,
                recommendations=recommendations,
                groq_raw_response=groq_raw_response_str  # Optional debug field in DB
            )

            serializer = DetectionResultSerializer(detection)
            return Response(serializer.data)

        except Exception as e:
            print("Prediction error:", e)
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)
