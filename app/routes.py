from app import app
from app import db
from pony.orm import *
from app import Card, Intercourse
from flask import request, jsonify, abort, render_template
from hashlib import blake2b
from datetime import datetime
import json

# {'my_id' : '123456', 'secret_key' : '123456', 'other_id' : '1234567'}

# curl -d '{ 'my_id': 'f049cd234b5a445766394925a2f0c46961d526f2', 'secret_key': 'genesis', 'other_id': 'e62ed43fffb6b96168089033be8efb65937c62a8', }' -H "Content-Type: application/json" -X POST http://localhost:5000/api/v1/intercourse

@app.route('/')
@app.route('/index')
@db_session
def index():
    intercourses = select(i for i in Intercourse)
    return render_template('index.html',intercourses=intercourses)



@app.route('/api/v1/intercourse', methods=['POST'])
@db_session
def intercourse():
    data = request.get_json()
    myid = data['my_id']
    otherid = data['other_id']
    p = data['secret_key'].encode('utf-8')
    c = Card[data['my_id']]
    h = blake2b(digest_size=20)
    d = h.update(p)
    if c is not None and c.password == h.hexdigest():
        # print ('login successful')
        existing_matches = select(i for i in Intercourse if i.second[:21] == myid[:21] and i.first[:21] == otherid[:21] and i.verified == False)
        # print("-----\nDEBUG:")
        # print(type(myid))
        # print(myid)
        # print(existing_matches)
        # print(existing_matches.count())
        # print("-----")
        if existing_matches:
            # print (existing_matches.show())
            # print ('want to set True')
            for i in existing_matches:
                # print ('setting True')
                i.verified = True
        else: 
            # print ('creating Intercourse Request')
            Intercourse(timestamp = datetime.utcnow(),first = myid, second = otherid, verified = False)
    else: 
        return abort(403)
    commit()   
    return jsonify(data)

@app.route('/api/v1/graph', methods=['GET'])
@db_session
def graph():
    starting_point = request.args.get('starting_point')
    if (starting_point):
        starting_point = int(request.args.get('starting_point'))
        #print(starting_point)
        new_intercourses = select(i for i in Intercourse if i.id > starting_point and i.verified == True)
        response = {'data': [i.to_dict() for i in new_intercourses]}
        #print (response)
    else:
        return abort(404)
    return jsonify(response)