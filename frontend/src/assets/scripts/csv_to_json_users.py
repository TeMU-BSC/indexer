import csv
import json
import hashlib


csvFilePath = '../sourcedata/users.csv'
jsonFilePath = '../uploads/users.json'

# Read the CSV file and add the data to a list
with open(csvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)
    users = [csvRow for csvRow in csvReader]
    for user in users:
        # Make a unique hash taking the user email string
        hash_object = hashlib.md5(user.get('email').encode())

        if user.get('id').startswith('G'):
            password = 'guest'
        elif user.get('id').startswith('T'):
            password = 'tester'
        else:
            password = hash_object.hexdigest()

        user['password'] = password

# Write data to a JSON file
with open(jsonFilePath, 'w') as jsonFile:
    jsonFile.write(json.dumps(users, ensure_ascii=False).encode('utf8').decode())
