from flask import Flask, request, jsonify
import os
import threading
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.resnet50 import preprocess_input
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.models import Model
import requests
from google.cloud import storage
from flask_cors import CORS
import shutil 

app = Flask(__name__)
CORS(app)


SERVICE_ACCOUNT_KEY_FILE = 'authentication-daf7d-firebase-adminsdk-xh0aa-147c5bea06.json'

BUCKET_NAME = 'authentication-daf7d.appspot.com'

def get_storage_client():
    return storage.Client.from_service_account_json(SERVICE_ACCOUNT_KEY_FILE)

def download_images_from_storage(firebase_folder, local_folder):
    client = get_storage_client()
    bucket = client.get_bucket(BUCKET_NAME)
    blobs = bucket.list_blobs(prefix=firebase_folder)

    for blob in blobs:
        if blob.name.endswith('/'):
            continue 

        relative_path = os.path.relpath(blob.name, firebase_folder)
        local_file_path = os.path.join(local_folder, relative_path)


        os.makedirs(os.path.dirname(local_file_path), exist_ok=True)

        blob.download_to_filename(local_file_path)
        print(f"Downloaded {blob.name} to {local_file_path}")

@app.route('/retrain', methods=['POST'])
def retrain():
    data = request.get_json()
    predicted_breed = data.get('predictedBreed') 

    if not predicted_breed:
        return jsonify({'error': 'predictedBreed not provided'}), 400

    labels_txt_path = 'labels.txt'
    if os.path.exists(labels_txt_path):
        with open(labels_txt_path, 'r') as f:
            existing_breeds = [line.strip() for line in f.readlines()]
        if predicted_breed in existing_breeds:
            return jsonify({'message': f"The breed '{predicted_breed}' is already in the model. Retraining skipped."}), 200

    firebase_folder = f'Breeds/{predicted_breed}'
    local_folder = os.path.join('NewBreed', predicted_breed)

    try:
        print(f"Downloading images for breed '{predicted_breed}'...")
        download_images_from_storage(firebase_folder, local_folder)
        print(f"Images for breed '{predicted_breed}' downloaded successfully.")

        retrain_thread = threading.Thread(
            target=perform_lwf, 
            args=(predicted_breed, local_folder)
        )
        retrain_thread.start()

        retrain_thread.join()
        shutil.rmtree(local_folder) 
        print(f"Cleaned up local folder: {local_folder}")

        return jsonify({'message': f"Retraining started for new breed '{predicted_breed}'."}), 200

    except Exception as e:
        print(f"Error during retraining process: {e}")
        return jsonify({'error': str(e)}), 500


def perform_lwf(new_breed_name, new_breed_images_dir, labels_txt_path='labels.txt', alpha=0.5, temperature=2.0, epochs=120, batch_size=32):
    image_size = (224, 224)

    model_initial = load_model('cat_breed_model.h5')

    with open(labels_txt_path, 'r') as f:
        classes_old = [line.strip() for line in f.readlines()]

    if new_breed_name in classes_old:
        print(f"The breed '{new_breed_name}' is already in the model.")
        return

    classes = classes_old + [new_breed_name]
    with open(labels_txt_path, 'a') as f:
        f.write(f'\n{new_breed_name}')

    num_classes_initial = len(classes_old)
    num_classes_new = len(classes)

    new_breed_image_paths = [os.path.join(new_breed_images_dir, fname)
                             for fname in os.listdir(new_breed_images_dir)
                             if fname.lower().endswith(('png', 'jpg', 'jpeg'))]
    df_new_breed = pd.DataFrame({'filename': new_breed_image_paths, 'class': [new_breed_name] * len(new_breed_image_paths)})

    train_df_new_breed, val_df_new_breed = train_test_split(df_new_breed, test_size=0.3, random_state=42)

    train_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

    def data_generator(df, batch_size):
        datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
        generator = datagen.flow_from_dataframe(
            df,
            x_col='filename',
            y_col=None,
            target_size=image_size,
            class_mode=None,
            batch_size=batch_size,
            shuffle=True)
        while True:
            batch_images = next(generator)
            yield batch_images

    train_generator = data_generator(train_df_new_breed, batch_size)
    steps_per_epoch = int(np.ceil(len(train_df_new_breed) / batch_size))

    base_model = model_initial.get_layer('base_model')
    base_model.trainable = False 

    x = base_model.output
    x = GlobalAveragePooling2D(name='global_avg_pool')(x)
    x = Dropout(0.5, name='dropout')(x)
    new_predictions = Dense(num_classes_new, activation='softmax', name='new_output_layer')(x)
    model_new = Model(inputs=base_model.input, outputs=new_predictions)

    for layer in model_new.layers:
        if layer.name == 'new_output_layer':
            continue
        try:
            layer_in_initial = model_initial.get_layer(layer.name)
            weights = layer_in_initial.get_weights()
            layer.set_weights(weights)
        except ValueError:
            print(f"No matching layer found for {layer.name} in model_initial.")

    old_output_weights = model_initial.get_layer('output_layer').get_weights()
    new_kernel_shape = (old_output_weights[0].shape[0], num_classes_new)
    new_bias_shape = (num_classes_new,)

    new_kernel_weights = np.random.normal(loc=0.0, scale=0.05, size=new_kernel_shape)
    new_bias_weights = np.zeros(new_bias_shape)

    new_kernel_weights[:, :num_classes_initial] = old_output_weights[0]
    new_bias_weights[:num_classes_initial] = old_output_weights[1]

    model_new.get_layer('new_output_layer').set_weights([new_kernel_weights, new_bias_weights])

    optimizer = tf.keras.optimizers.Adam(learning_rate=1e-4)
    ce_loss_fn = tf.keras.losses.CategoricalCrossentropy()
    kld_loss_fn = tf.keras.losses.KLDivergence()

    for epoch in range(epochs):
        print(f'\nEpoch {epoch+1}/{epochs}')
        train_loss = 0.0
        train_steps = 0

        for step in range(steps_per_epoch):
            images = next(train_generator)
            batch_size_actual = images.shape[0]

            logits_teacher = model_initial.predict(images)
            probs_teacher = tf.nn.softmax(logits_teacher / temperature)
            probs_teacher_old = probs_teacher[:, :num_classes_initial]


            labels_new_class = np.zeros((batch_size_actual, num_classes_new))
            labels_new_class[:, num_classes_initial] = 1

            with tf.GradientTape() as tape:
                logits_student = model_new(images, training=True)
                probs_student = tf.nn.softmax(logits_student / temperature)

                distillation_loss = kld_loss_fn(probs_teacher_old, probs_student[:, :num_classes_initial])

                classification_loss = ce_loss_fn(labels_new_class, logits_student)

                total_loss = alpha * distillation_loss + (1 - alpha) * classification_loss

            gradients = tape.gradient(total_loss, model_new.trainable_variables)
            optimizer.apply_gradients(zip(gradients, model_new.trainable_variables))

            train_loss += total_loss.numpy()
            train_steps += 1

            if step % 10 == 0:
                print(f"Step {step}/{steps_per_epoch}, Loss: {total_loss.numpy():.4f}")

        avg_train_loss = train_loss / train_steps
        print(f"Epoch {epoch+1}, Average Training Loss: {avg_train_loss:.4f}")

    model_new.save('cat_breed_model.h5')
    print(f"The model has been updated and saved to 'cat_breed_model.h5'.")

    try:
        response = requests.post('http://localhost:5000/reload_model')
        if response.status_code == 200:
            print("Prediction server notified to reload the model.")
        else:
            print(f"Failed to notify prediction server. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error notifying prediction server: {e}")


@app.route('/')
def home():
    return "Flask server is running!"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
