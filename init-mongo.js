db.createUser(
  {
    user: 'mesinesp',
    pwd: 'mesinesp',
    roles: [
      {
        role: 'readWrite',
        db: 'BvSalud'
      }
    ]
  }
)