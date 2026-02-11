FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download NudeNet model cache (optional optimization step, 
# otherwise it downloads on first run)
# RUN python -c "from nudenet import NudeDetector; NudeDetector()"

COPY . .

CMD ["python", "main.py"]
