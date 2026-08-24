import requests

BASE_URL = "http://127.0.0.1:8005/api"

def test():
    # Test Register
    reg_data = {
        "name": "Test User",
        "email": "test1234@gmail.com",
        "mobile": "9999999999",
        "aadhar": "123456789012",
        "address": "123 Test St",
        "pwd": "password"
    }
    r = requests.post(f"{BASE_URL}/register", json=reg_data)
    print("Register Response:", r.status_code, r.text)

    # Test Login
    login_data = {
        "email": "test1234@gmail.com",
        "pwd": "password"
    }
    r = requests.post(f"{BASE_URL}/login", json=login_data)
    print("Login Response:", r.status_code, r.text)

if __name__ == "__main__":
    test()
