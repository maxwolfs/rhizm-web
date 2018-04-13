from app import app
from app import db
from pony.orm import *
from app import Card, Intercourse

@app.route('/')
@app.route('/index')
def index():
    return "Hello, World!"

@app.route('/api/v1/intercourse', methods=['POST','GET'])
def intercourse():
    content = request.get_json()
    return "bla"

