from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app)

# Load class labels from labels.txt
with open('labels.txt', 'r') as f:
    labels = [line.strip() for line in f.readlines()]

# Load the Keras model
model = tf.keras.models.load_model('cat_breed_model.h5')

def preprocess_image(image):
    """Resize and normalize the image for the model."""
    image = image.resize((224, 224))  # Adjust size based on your model
    image = np.array(image).astype('float32')
    image = image / 255.0  # Normalize to [0, 1]
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

@app.route('/')
def home():
    return "Flask server is running!"

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    # Get the uploaded image
    img_file = request.files['image']
    img_bytes = img_file.read()
    image = Image.open(io.BytesIO(img_bytes))

    # Preprocess the image
    input_data = preprocess_image(image)

    # Make prediction
    predictions = model.predict(input_data)[0]  # Get prediction probabilities
    predicted_class_idx = int(np.argmax(predictions))  # Convert to native Python int
    predicted_class_label = labels[predicted_class_idx]  # Map index to label

    # Get the top 5 predictions and their probabilities
    top_5_indices = np.argsort(predictions)[-5:][::-1]  # Get indices of the 5 highest probabilities
    top_5_labels = [labels[i] for i in top_5_indices]
    top_5_probabilities = [predictions[i] for i in top_5_indices]

    # Convert predictions to a Python list of floats
    predictions_list = predictions.tolist()

    return jsonify({
        'predictions': predictions_list,
        'class_index': predicted_class_idx,
        'class_label': predicted_class_label,
        'top_5': [
            {'class_label': top_5_labels[i], 'probability': float(top_5_probabilities[i])}
            for i in range(5)
        ]
    })

@app.route('/reload_model', methods=['POST'])
def reload_model():
    global model
    global labels

    try:
        # Reload the labels
        with open('labels.txt', 'r') as f:
            labels = [line.strip() for line in f.readlines()]
        print("Labels reloaded successfully.")

        # Reload the model
        model = tf.keras.models.load_model('cat_breed_model.h5')
        print("Model reloaded successfully.")

        return jsonify({'message': 'Model and labels reloaded successfully.'}), 200
    except Exception as e:
        print(f"Error reloading model or labels: {e}")
        return jsonify({'error': f"Failed to reload model or labels: {e}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
