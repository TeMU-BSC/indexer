import csv
import json
import hashlib


csvFilePath = '../sourcedata/users.csv'
jsonFilePath = '../uploads/users.json'

# Read the CSV file and add the data to a list
with open(csvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)
    users = [csvRow for csvRow in csvReader]
    # Build a unique hash for the password
    for user in users:
        if user['role'] == 'superannotator':
            base = user['fullname']
        else:
            base = user['email']
        user['password'] = hashlib.md5(base.encode()).hexdigest()

# Write data to a JSON file
with open(jsonFilePath, 'w') as jsonFile:
    jsonFile.write(json.dumps(users, ensure_ascii=False).encode('utf8').decode())
