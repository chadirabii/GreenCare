# Base image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install  -r requirements.txt

# Copy the Django app
COPY . .

# Expose the port Django will run on
EXPOSE 8000

# Command to run Django with gunicorn
CMD ["gunicorn", "Backend.wsgi:application", "--bind", "0.0.0.0:8000"]
