db.createUser(
    {
        user: "guest",
        pwd: "passwordForGuest",
        roles: [{ role: "read", db: "myDatabase" }]
    }
)

db.createUser(
    {
        user: "mantainer",
        pwd: "passwordForMantainer",
        roles: [{ role: "readWrite", db: "myDatabase" }]
    }
)