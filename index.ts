import express, { Application, Request, Response } from "express";
import { graphqlHTTP } from "express-graphql";
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from "graphql";
import { PrismaClient } from "@prisma/client";
import { sortById } from "./service/util";
import { StatusType, TaskType, ListType } from "./graphql/model";

const app: Application = express();
const port = 3000;

const prisma = new PrismaClient();

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    list: {
      type: new GraphQLList(ListType),
      description: "List of all lists",
      resolve: async () => {
        const lists = await prisma.list.findMany({ include: { task: true } });
        return lists.sort(sortById);
      },
    },
    task: {
      type: new GraphQLList(TaskType),
      description: "List of all tasks",
      resolve: async () => {
        const tasks = await prisma.task.findMany();
        return tasks.sort(sortById);
      },
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addList: {
      type: ListType,
      description: "Add a new list",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const list = await prisma.list.create({ data: { name: args.name } });
        return list;
      },
    },
    addTask: {
      type: TaskType,
      description: "Add a new task to a list",
      args: {
        listId: { type: GraphQLNonNull(GraphQLInt) },
        title: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const task = await prisma.task.create({
          data: { title: args.title, listId: args.listId },
        });
        return task;
      },
    },
    updateTask: {
      type: TaskType,
      description: "Update an existing task",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        title: { type: GraphQLString },
        status: { type: StatusType },
      },
      resolve: async (parent, args) => {
        const task = await prisma.task.update({
          where: { id: args.id },
          data: { title: args.title, status: args.status },
        });
        return task;
      },
    },
    moveTaskUp: {
      type: TaskType,
      description: "Move an existing task up",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, args) => {
        const task = await prisma.task.findFirst({ where: { id: args.id } });
        if (task) {
          const tasks = await prisma.task.findMany({
            where: { listId: task.listId },
          });
          tasks.sort(sortById);
          const position = tasks.findIndex((x) => x.id === task.id);
          if (position !== 0) {
            const newTask = await prisma.task.update({
              where: { id: tasks[position - 1].id },
              data: {
                title: task.title,
                status: task.status,
              },
            });
            await prisma.task.update({
              where: { id: task.id },
              data: {
                title: tasks[position - 1].title,
                status: tasks[position - 1].status,
              },
            });
            return newTask;
          } else {
            return task;
          }
        }
      },
    },
    moveTaskDown: {
      type: TaskType,
      description: "Move an existing task down",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, args) => {
        const task = await prisma.task.findFirst({ where: { id: args.id } });
        if (task) {
          const tasks = await prisma.task.findMany({
            where: { listId: task.listId },
          });
          tasks.sort(sortById);
          const position = tasks.findIndex((x) => x.id === task.id);
          if (position !== tasks.length - 1) {
            const newTask = await prisma.task.update({
              where: { id: tasks[position + 1].id },
              data: {
                title: task.title,
                status: task.status,
              },
            });
            await prisma.task.update({
              where: { id: task.id },
              data: {
                title: tasks[position + 1].title,
                status: tasks[position + 1].status,
              },
            });
            return newTask;
          } else {
            return task;
          }
        }
      },
    },
    moveTask: {
      type: TaskType,
      description: "Move an existing task to a new position",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        position: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: async (parent, args) => {
        const task = await prisma.task.findFirst({ where: { id: args.id } });
        if (task) {
          const tasks = await prisma.task.findMany({
            where: { listId: task.listId },
          });
          tasks.sort((a, b) => (a.id > b.id ? 1 : -1));
          const position = tasks.findIndex((x) => x.id === task.id);
          if (
            position !== args.position &&
            args.position - 1 <= tasks.length &&
            args.position > 0
          ) {
            const newTask = await prisma.task.update({
              where: { id: tasks[args.position - 1].id },
              data: {
                title: task.title,
                status: task.status,
              },
            });
            await prisma.task.update({
              where: { id: task.id },
              data: {
                title: tasks[args.position - 1].title,
                status: tasks[args.position - 1].status,
              },
            });
            return newTask;
          } else {
            return task;
          }
        }
      },
    },
  }),
});

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
