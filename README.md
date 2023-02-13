# rhizm-web

flask app / api of rhizomaticmachines.com

This is the Repository for rhizomaticmachines.com.

Microcontroller of type ESP8266 is pushing a JSON http Post Request to API endpoint: www.rhizomaticmachines.com/api/v1/intercourses

JSON Post Request Schema:

```python
 { 'my_id': 'f049cd234b5a445766394925a2f0c46961d526f2', 'secret_key': 'genesis', 'other_id': 'e62ed43fffb6b96168089033be8efb65937c62a8' }
```

If the request is not valid e.g. my_id is not in the database or secret_key does not match http Post is aborted with 403. If the request is valid data will be posted into database. If there is already a pair of matching my_id and other_id, the "verified" attribute is set to "True".

Flask App is hosted on heroku.com. Blake2b is the hashing algorithm for ids and passwords. Database is of type PostgreSQL hosted on heroku.com. ORM is PonyORM to map incoming json to python objects to SQL format. Admininium is the GUI Extension for browsing the full database.

## how to run

```terminal
clone repo
install python 3.6.5
install pip
install pipenv
$ pipenv shell
$ pipenv install
$ export FLASK_APP=app.py on UNIX and $ set FLASK_APP=app.py on Windows
```
