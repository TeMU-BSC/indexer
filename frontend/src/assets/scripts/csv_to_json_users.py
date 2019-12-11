import csv
import json

csvFilePath = 'users.csv'
jsonFilePath = 'users.json'

# Read the CSV file and add the data to a list
with open(csvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile)
    users = [csvRow for csvRow in csvReader]
    for user in users:
        user['password'] = 'inicial'

# Write data to a JSON file
with open(jsonFilePath, 'w') as jsonFile:
    jsonFile.write(json.dumps(users)) 
