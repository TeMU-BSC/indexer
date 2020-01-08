import csv
import json

csvFilePath = '../DeCS.2019.both.v5.tsv'
jsonFilePath = '../DeCS.2019.both.v5.json'

# Read the CSV file and add the data to a list
with open(csvFilePath) as csvFile:
    csvReader = csv.DictReader(csvFile, dialect=csv.excel_tab)
    descriptors = [csvRow for csvRow in csvReader]

# Write data to a JSON file
with open(jsonFilePath, 'w') as jsonFile:
    jsonFile.write(json.dumps(descriptors))

# Print the short terms in Spanish
[print(descriptor.get('termSpanish')) for descriptor in descriptors if len(descriptor.get('termSpanish')) <= 3]
