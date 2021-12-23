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

**Testing**

Change database for testing url in .env.test files then use command :

```
npm run migrate-test
npm t
```

**For Development**

```
npm run devStart
```
