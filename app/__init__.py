from flask import Flask
from datetime import datetime
from pony.orm import *

app = Flask(__name__)

db = Database()

class Intercourse(db.Entity):
    id = PrimaryKey(int, auto=True)
    timestamp = Required(datetime)
    first = Required(str)
    second = Required(str)
    verified = Optional(bool)


class Card(db.Entity):
    id = PrimaryKey(str)
    password = Required(str)

# PostgreSQL for Deployment on Heroku
# db.bind(provider='postgres', user='', password='', host='', database='')

# SQLite for local Development
db.bind(provider='sqlite', filename='database.sqlite', create_db=True)

db.generate_mapping(create_tables=True)

from app import routes