import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
sys.path.insert(0, os.getcwd())

import django

django.setup()

from django.test import Client
import json

client = Client()
resp = client.post('/api/payments/', json.dumps({'booking_id': 1, 'amount': 100, 'payment_type': 'advance'}), content_type='application/json')
print('STATUS', resp.status_code)
print('CONTENT', resp.content.decode('utf-8'))
