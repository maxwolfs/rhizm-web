import unittest
from app import app
from pony.orm import *
from datetime import datetime
from flask import json

class Unittest(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()

        self.db = Database()

        class Intercourse(self.db.Entity):
            id = PrimaryKey(int, auto=True)
            timestamp = Required(datetime)
            first = Required(str)
            second = Required(str)
            verified = Optional(bool)

        class Card(self.db.Entity):
            id = PrimaryKey(str)
            password = Required(str)

        self.db.bind(provider='sqlite', filename=':memory:', create_db=True)

        self.db.generate_mapping(create_tables=True)

        with db_session:
            Card(id='f049cd234b5a445766394925a2f0c46961d526f2',
                 password='355cfa655e41054cbe6c411226924151f42a80f2')  # pw = genesis

    def test_card(self):
        self.assertEqual(True, True)

    def test_front_page_loads(self):
        r = self.app.get('/')
        self.assertIn(b'Hello World', r.data)

    def test_post_request_api(self):

        # Example POST Request of a Card

        data = {
            'my_id': 'f049cd234b5a445766394925a2f0c46961d526f2',
            'secret_key': 'genesis',
            'other_id': 'e62ed43fffb6b96168089033be8efb65937c62a8',
        }

        p = self.app.post('/api/v1/intercourse',data=json.dumps(data), content_type='application/json')
        self.assertEqual(data,p.data)




