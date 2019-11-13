sudo service mongod start

mongo

# use database_name
# > db.createUser(
#   {
#     user: "USER_NAME",
#     pwd: passwordPrompt(),  // or cleartext password
#     roles: [
#        { role: "readWrite", db: "DATABASE_NAME" }
#     ]
#   }
# )

# Option 1: Explicit port and password
mongo --port 27017 -u USER_NAME -p PASSWORD --authenticationDatabase DATABASE_NAME

# Option 2: Default port 27017 and password prompt
mongo -u USER_NAME --authenticationDatabase DATABASE_NAME

# Open port 27017 to the outside world
sudo iptables -A INPUT -s 84.88.52.79 -p tcp --destination-port 27017 -m state --state NEW,ESTABLISHED -j ACCEPT
sudo iptables -A OUTPUT -d 84.88.52.79 -p tcp --source-port 27017 -m state --state ESTABLISHED -j ACCEPT
