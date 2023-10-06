**Installation**

```
cp .env.example .env
cp .env.example .env.test
npm i
```

**Database Migration**

Change database url in .env files then use command :

```
npm run migrate
```

**For Development**

Run command

```
npm run devStart
```

then access the graphql via http://localhost:3000/graphql

**Testing**

Change database for testing url in .env.test files then use command :

```
npm run migrate-test
npm t
```
