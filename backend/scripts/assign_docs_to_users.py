import json
import random


docs_path = '../selected_importants_ids.json'
users_path = '../uploads/users.json'

with open(docs_path) as f:
    selected_importants = json.load(f)
random.seed(777)
sample = random.sample(selected_importants, 500)

with open(users_path) as f:
    users = json.load(f)
assignments = [{'userId': user['id'], 'docIds': sample} for user in users]
print(json.dumps(assignments))
