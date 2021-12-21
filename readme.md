**Installation**

```
cp .env.example .env
npm i
```

**Database Migration**
Change database url in .env files then use command :
```
npx prisma migrate dev --name init
```


**For Development**
```
npm run devStart
```
