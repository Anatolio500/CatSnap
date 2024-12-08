import os
import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.models import Model
import tensorflow as tf

data_dir = 'data'  
breeds_dir = os.path.join(data_dir, 'Breeds')


breeds = sorted(os.listdir(breeds_dir)) 
image_paths = []
labels = []

for breed in breeds:
    breed_dir = os.path.join(breeds_dir, breed)
    if os.path.isdir(breed_dir):
        for img_file in os.listdir(breed_dir):
            img_path = os.path.join(breed_dir, img_file)
            image_paths.append(img_path)
            labels.append(breed)


df_initial = pd.DataFrame({'filename': image_paths, 'class': labels})


train_df_initial, temp_df_initial = train_test_split(
    df_initial, test_size=0.3, stratify=df_initial['class'], random_state=42)
val_df_initial, test_df_initial = train_test_split(
    temp_df_initial, test_size=0.5, stratify=temp_df_initial['class'], random_state=42)


train_df_initial.to_csv('train_df_initial.csv', index=False)
val_df_initial.to_csv('val_df_initial.csv', index=False)
test_df_initial.to_csv('test_df_initial.csv', index=False)

with open('labels.txt', 'w') as f:
    for breed in sorted(df_initial['class'].unique()):
        f.write(f"{breed}\n")

image_size = (224, 224)
batch_size = 32

train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=40,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
)
val_test_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)


train_generator_initial = train_datagen.flow_from_dataframe(
    train_df_initial,
    x_col='filename',
    y_col='class',
    target_size=image_size,
    class_mode='categorical',
    batch_size=batch_size,
)

validation_generator_initial = val_test_datagen.flow_from_dataframe(
    val_df_initial,
    x_col='filename',
    y_col='class',
    target_size=image_size,
    class_mode='categorical',
    batch_size=batch_size,
    shuffle=False,
)

base_model = ResNet50(
    weights='imagenet',
    include_top=False,
    input_shape=image_size + (3,),
    name='base_model',
)
base_model.trainable = False


num_classes_initial = len(train_generator_initial.class_indices)

x = base_model.output
x = GlobalAveragePooling2D(name='global_avg_pool')(x)
x = Dropout(0.5, name='dropout')(x)
predictions = Dense(num_classes_initial, activation='softmax', name='output_layer')(x)
model_initial = Model(inputs=base_model.input, outputs=predictions)


model_initial.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy'],
)


epochs = 10 

history = model_initial.fit(
    train_generator_initial,
    epochs=epochs,
    validation_data=validation_generator_initial,
)


base_model.trainable = True
fine_tune_at = 100
for layer in base_model.layers[:fine_tune_at]:
    layer.trainable = False


model_initial.compile(
    optimizer=tf.keras.optimizers.Adam(1e-5),
    loss='categorical_crossentropy',
    metrics=['accuracy'],
)

fine_tune_epochs = 5 

history_fine = model_initial.fit(
    train_generator_initial,
    epochs=fine_tune_epochs,
    validation_data=validation_generator_initial,
)

model_initial.save('cat_breed_model.h5')
print("Initial model saved as 'cat_breed_model.h5'")
