import streamlit as st
from PIL import Image
import requests
from bs4 import BeautifulSoup
import numpy as np
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models import load_model

model = load_model('FV.h5')

labels = {0: 'apple', 1: 'banana', 2: 'beetroot', 3: 'bell pepper', 4: 'cabbage', 5: 'capsicum', 6: 'carrot',
          7: 'cauliflower', 8: 'chilli pepper', 9: 'corn', 10: 'cucumber', 11: 'eggplant', 12: 'garlic', 13: 'ginger',
          14: 'grapes', 15: 'jalepeno', 16: 'kiwi', 17: 'lemon', 18: 'lettuce',
          19: 'mango', 20: 'onion', 21: 'orange', 22: 'paprika', 23: 'pear', 24: 'peas', 25: 'pineapple',
          26: 'pomegranate', 27: 'potato', 28: 'raddish', 29: 'soy beans', 30: 'spinach', 31: 'sweetcorn',
          32: 'sweetpotato', 33: 'tomato', 34: 'turnip', 35: 'watermelon'}

fruits = ['Apple', 'Banana', 'Bello Pepper', 'Chilli Pepper', 'Grapes', 'Jalepeno', 'Kiwi', 'Lemon', 'Mango', 'Orange',
          'Paprika', 'Pear', 'Pineapple', 'Pomegranate', 'Watermelon']
vegetables = ['Beetroot', 'Cabbage', 'Capsicum', 'Carrot', 'Cauliflower', 'Corn', 'Cucumber', 'Eggplant', 'Ginger',
              'Lettuce', 'Onion', 'Peas', 'Potato', 'Raddish', 'Soy Beans', 'Spinach', 'Sweetcorn', 'Sweetpotato',
              'Tomato', 'Turnip']

# Rabi Crops (Winter Crops)
rabi_crops = ['Apple', 'Grapes', 'Kiwi', 'Lemon', 'Orange', 'Pomegranate','Beetroot', 'Cabbage', 'Carrot',
              'Cauliflower', 'Onion', 'Peas', 'Potato', 'Radish', 'Spinach']

# Kharif Crops (Monsoon Crops)
kharif_crops = ['Banana', 'Bell Pepper', 'Chilli Pepper', 'Mango', 'Paprika', 'Pineapple', 'Watermelon',
                 'Capsicum', 'Corn', 'Cucumber', 'Eggplant', 'Lettuce', 'Onion', 'Peas', 'Tomato']


def fetch_calories(prediction):
    try:
        url = 'https://www.google.com/search?&q=calories in ' + prediction
        req = requests.get(url).text
        scrap = BeautifulSoup(req, 'html.parser')
        calories = scrap.find("div", class_="BNeawe iBp4i AP7Wnd").text
        return calories
    except Exception as e:
        st.error("Can't able to fetch the Calories")
        print(e)

def fetch_info(prediction):
    try:
        url = 'https://www.google.com/search?&q=description of ' + prediction
        req = requests.get(url).text
        scrap = BeautifulSoup(req, 'html.parser')
        info = scrap.find("div", class_="BNeawe s3v9rd AP7Wnd").text
        return info
    except Exception as e:
        st.error("Can't able to fetch the Info")
        print(e)

def fetch_benefits(prediction):
    try:
        url = 'https://www.google.com/search?&q=benefits of ' + prediction
        req = requests.get(url).text
        scrap = BeautifulSoup(req, 'html.parser')
        benefit = scrap.find("div", class_="BNeawe s3v9rd AP7Wnd").text
        return benefit
    except Exception as e:
        st.error("Can't able to fetch the Benefits")
        print(e)

def fetch_price(prediction):
    try:
        url = 'https://www.google.com/search?&q=average price of ' + prediction + ' in Pakistan'
        req = requests.get(url).text
        scrap = BeautifulSoup(req, 'html.parser')
        price = scrap.find("div", class_="BNeawe s3v9rd AP7Wnd").text
        return price
    except Exception as e:
        st.error("Can't able to fetch the Benefits")
        print(e)


def prepare_image(img_path):
    img = load_img(img_path, target_size=(224, 224, 3))
    img = img_to_array(img)
    img = img / 255
    img = np.expand_dims(img, [0])
    answer = model.predict(img)
    y_class = answer.argmax(axis=-1)
    print(y_class)
    y = " ".join(str(x) for x in y_class)
    y = int(y)
    res = labels[y]
    print(res)
    return res.capitalize()


def run():
    st.title("Fruits-Vegetable Classification")
    img_file = st.file_uploader("Choose an Image", type=["jpg", "png"])
    if img_file is not None:
        img = Image.open(img_file).resize((250, 250))
        st.image(img, use_column_width=False)
        save_image_path = './upload_images/' + img_file.name
        with open(save_image_path, "wb") as f:
            f.write(img_file.getbuffer())

        # if st.button("Predict"):
        if img_file is not None:
            result = prepare_image(save_image_path)
            if result in vegetables:
                st.info('*Category : Vegetables*')
            else:
                st.info('*Category : Fruit*')

            st.success("**Predicted : " + result + '**')

            # Rabi or Kharif
            if ((result).title() in rabi_crops):
                st.info('**Type : Rabi**')
            elif ((result).title() in kharif_crops):
                st.info('**Type : Kharif**')
            else:
                st.info('**Type : None**')

            cal = fetch_calories(result)
            if cal:
                st.warning('*' + cal + '(100 grams)*')

            info = fetch_info(result)
            if info:
                st.info('*About : ' + info + '*')

            benefits = fetch_benefits(result)
            if benefits:
                st.success('*Benefits : ' + benefits + '*')

            price = fetch_price(result)
            if price:
                st.info('*Price : ' + price + '*')

run()