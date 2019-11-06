import { InMemoryDbService } from 'angular-in-memory-web-api'

export class InMemDataService implements InMemoryDbService {
    createDb() {
        const users = [
            { id: 1, name: 'Windstorm' },
            { id: 2, name: 'Bombasto' },
            { id: 3, name: 'Magneta' },
            { id: 4, name: 'Tornado' },
            { id: 5, name: 'Agnosto' }
        ]
        return {
            users: {
                total: users.length,
                results: users
            }
        }
    }
}
