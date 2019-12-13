# Make sure the mongo deamon is running
sudo service mongod start

# Open the mongo shell
mongo

# Copy and paste that block below into the mongo shell:
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

# [Option 1] Login with explicit port and password
mongo --port 27017 -u USER_NAME -p PASSWORD --authenticationDatabase DATABASE_NAME

# [Option 2] Login with the default port (27017) and password prompt
mongo -u USER_NAME --authenticationDatabase DATABASE_NAME

# Open port 27017 to the outside world (YOUR_IP_ADDRESS could be 84.88.52.79)
sudo iptables -A INPUT -s YOUR_IP_ADDRESS -p tcp --destination-port 27017 -m state --state NEW,ESTABLISHED -j ACCEPT
sudo iptables -A OUTPUT -d YOUR_IP_ADDRESS -p tcp --source-port 27017 -m state --state ESTABLISHED -j ACCEPT
