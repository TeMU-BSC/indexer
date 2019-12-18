# Use the Python3.7 image
FROM python:3.7-stretch

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app 
ADD . /app

# Install the dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# [Production] Run the command to start uWSGI
# CMD ["uwsgi", "app.ini"]

# [Development] Run the flask server
# ENV FLASK_ENV=development
# CMD flask run --host 0.0.0.0