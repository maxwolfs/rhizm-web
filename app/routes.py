from app import app
from app import db
from pony.orm import *
from app import Card, Intercourse
from flask import request, jsonify, abort
from hashlib import blake2b

# {'my_id' : '123456', 'secret_key' : '123456', 'other_id' : '1234567'}

@app.route('/')
@app.route('/index')
def index():
    return "Hello World!"

@app.route('/api/v1/intercourse', methods=['POST','GET'])
def intercourse():
    data = request.get_json()
    myid = data['my_id']
    otherid = data['other_id']
    c = Card[data['my_id']]
    h = blake2b(digest_size=20)
    # if c not None and c.password == h.update(data['secret_key']).hexdigest():
    #     intercourses = select(i for i in Intercourse if i.second == myid and i.first == otherid and if not i.verified == False)
    #     if intercourses:
    #         for i in Intercourse: 
    #             i.verified = True
    #     else 
    #         Intercourse(timestamp = datetime(),first = myid, second = otherid, verified = False)
    # else 
    #     return abort(403)
    # commit()   
    return jsonify(data)