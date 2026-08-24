# 🌾 Crop Classification using Deep Learning (TensorFlow & PyTorch)

This project implements a deep learning approach to classify crops using image datasets. We provide two parallel implementations — **TensorFlow** and **PyTorch** — for performance comparison and reproducibility.
In addition, a **Streamlit-based GUI** is developed to make predictions interactive and fetch additional information about the crop.

---

## 📌 Project Overview

The goal of this project is to build and evaluate deep learning models for **crop classification** using image data. Both TensorFlow and PyTorch implementations are provided to compare training pipelines, performance metrics, and overall usability. The GUI allows users to upload images and view predictions along with nutritional information, crop benefits, and market price.

---

## 🛠️ Tech Stack

* **Languages:** Python
* **Frameworks:** TensorFlow, PyTorch, Streamlit
* **Model:** CNN (Convolutional Neural Network)
* **Tools:** NumPy, Pandas, Matplotlib, Scikit-learn, Pillow, Requests, BeautifulSoup

---

## 🚀 Steps in the Workflow

### 1. Dataset Preparation

* Collected and preprocessed crop images.
* Performed **train-test split**.
* Applied normalization and resizing for compatibility with CNN models.
* Used **data augmentation** (rotation, flipping, zoom) to reduce overfitting.

### 2. Model Building

* **TensorFlow:** Implemented a **CNN** using `tf.keras.Sequential`.
* **PyTorch:** Implemented a CNN using `torch.nn.Module`.
* Layers included convolutional, pooling, dropout, and dense layers.

### 3. Model Training

* Defined **loss functions**: Cross-Entropy Loss.
* Optimizers: Adam / SGD.
* Used **early stopping** and checkpoints (TensorFlow).
* Trained on GPU (if available).

### 4. Model Evaluation

* Calculated accuracy, precision, recall, and F1-score.
* Compared **macro** and **weighted averages** for imbalanced classes.
* Generated **confusion matrices** and **classification reports**.

### 5. Results & Comparison

| Framework  | Accuracy |
| ---------- | -------- |
| TensorFlow | \~0.95   |
| PyTorch    | \~0.76   |

📊 **Conclusion:** TensorFlow outperformed PyTorch in this classification task, maintaining higher accuracy and balanced metrics.

---

## 🖥️ Streamlit GUI

To make the model user-friendly, we created a **Streamlit web application**.

### Features:

* Upload an image (fruit or vegetable).
* Classify into **Fruit** or **Vegetable**.
* Detect whether it is a **Rabi crop** (winter) or **Kharif crop** (monsoon).
* Fetch details dynamically from Google:

  * Calories (per 100 grams)
  * Description
  * Health Benefits
  * Average Price (in Pakistan)

### Run the GUI:

1. Ensure the trained model `FV.h5` is available in the project root.
2. Start the app:

   ```bash
   streamlit run Utilizing TensorFlow Model Using Streamlit GUI.py
   ```
3. Upload an image and view predictions along with crop insights.

---

## 📷 Sample Outputs

* Streamlit GUI showing:

![3](https://github.com/user-attachments/assets/89ef099b-87cd-4a9b-a2ef-9aed192f842c)

---

## 📌 How to Run

1. Clone this repository:

   ```bash
   git clone https://github.com/ummeabiha/CropClassification.git
   cd CropClassification
   ```
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```
3. Run either training notebooks or the GUI:

   * `Training Tensor Flow Model.ipynb`
   * `Training PyTorch Model.ipynb`
   * `Utilizing TensorFlow Model Using Streamlit GUI.py` (for GUI)

---

