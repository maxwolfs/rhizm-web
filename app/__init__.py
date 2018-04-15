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
db.bind(provider='postgres', user='xacnpsztnthsnn', password='5e405b46617563293d9a313ff94c47542cf4df1e7db5e4d1f225e023939f61f6', host='ec2-79-125-110-209.eu-west-1.compute.amazonaws.com', database='dccridt2qs7hjp')

# SQLite for local Development
# db.bind(provider='sqlite', filename='database.sqlite', create_db=True)

db.generate_mapping(create_tables=True)

from app import routes