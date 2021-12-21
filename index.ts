import express, { Application, Request, Response } from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLSchema } from "graphql";
import { RootQueryType, RootMutationType } from "./graphql/schema";

const app: Application = express();
const port = 3000;

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (e: unknown) {
  if (typeof e === "string") {
    console.error(`Error occured: ${e.toUpperCase()}`);
  } else if (e instanceof Error) {
    console.error(`Error occured: ${e.message}`);
  }
}
