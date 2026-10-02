import urllib.request
import json

base_url = "http://localhost:5173/api"

def post(url, data, token=None):
    req = urllib.request.Request(
        base_url + url,
        data=json.dumps(data).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            **({'Authorization': f'Bearer {token}'} if token else {})
        }
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get(url, token=None):
    req = urllib.request.Request(
        base_url + url,
        headers={'Authorization': f'Bearer {token}'} if token else {}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

# 1. Health check
health = get('/health')
print("Health check:", health['message'])

# 2. Login Admin
admin_login = post('/auth/login', {'email': 'admin@rideflow.lk', 'password': 'Admin123!'})
admin_token = admin_login['data']['token']
print("Admin Login OK, Token prefix:", admin_token[:20], "Role:", admin_login['data']['role'])

# 3. Login Staff
staff_login = post('/auth/login', {'email': 'staff@rideflow.lk', 'password': 'Staff123!'})
staff_token = staff_login['data']['token']
print("Staff Login OK, Role:", staff_login['data']['role'])

# 4. Login Customer
cust_login = post('/auth/login', {'email': 'customer@rideflow.lk', 'password': 'Customer123!'})
cust_token = cust_login['data']['token']
print("Customer Login OK, Role:", cust_login['data']['role'])

# 5. Fetch Vehicles
vehicles = get('/vehicles')
print(f"Vehicle Fleet OK: {vehicles['data']['totalElements']} vehicles active in database")

# 6. Admin Analytics
metrics = get('/reports/admin', admin_token)
print("Admin Metrics OK:", metrics['data'])

print("ALL VERIFICATIONS PASSED SUCCESSFULLY!")
