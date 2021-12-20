import express, { Application, Request, Response } from "express";
import { graphqlHTTP } from "express-graphql";
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql";
import { PrismaClient } from "@prisma/client";

const app: Application = express();
const port = 3000;

const TaskType = new GraphQLObjectType({
  name: "Task",
  description: "This represent the tasks",
  fields: () => ({
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
    status: { type: GraphQLBoolean },
    listId: { type: GraphQLInt },
  }),
});

const ListType = new GraphQLObjectType({
  name: "List",
  description: "This represent the list of tasks",
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    task: {
      type: new GraphQLList(TaskType),
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    list: {
      type: new GraphQLList(ListType),
      description: "List of all lists",
      resolve: (parent, args) =>
        prisma.list.findMany({ include: { task: true } }),
    },
    task: {
      type: new GraphQLList(ListType),
      description: "List of all tasks",
      resolve: (parent, args) => prisma.task.findMany(),
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
});

const prisma = new PrismaClient();

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

app.post("/list", async (req: Request, res: Response): Promise<Response> => {
  const { name } = req.body;
  const list = await prisma.list.create({
    data: {
      name: name,
    },
  });
  return res.json(list);
});

app.post("/task", async (req: Request, res: Response): Promise<Response> => {
  const { title, listId } = req.body;
  const task = await prisma.task.create({
    data: {
      title: title,
      status: false,
      listId: listId,
    },
  });
  return res.json(task);
});

app.patch("/task", async (req: Request, res: Response): Promise<Response> => {
  const { id, title, status } = req.body;
  const task = await prisma.task.update({
    where: {
      id: id,
    },
    data: {
      title: title,
      status: status,
    },
  });
  return res.json(task);
});

app.patch("/taskup", async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.body;
  const task = await prisma.task.update({
    where: {
      id: id,
    },
    data: {},
  });
  return res.json(task);
});

app.patch(
  "/taskdown",
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.body;
    const task = await prisma.task.update({
      where: {
        id: id,
      },
      data: {},
    });
    return res.json(task);
  }
);

app.get("/list", async (req: Request, res: Response): Promise<Response> => {
  const {} = req.body;
  const lists = await prisma.list.findMany();
  return res.json(lists);
});

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
