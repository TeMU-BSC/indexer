iptables -A INPUT -s 84.88.52.79 -p tcp --destination-port 27017 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -d 84.88.52.79 -p tcp --source-port 27017 -m state --state ESTABLISHED -j ACCEPT