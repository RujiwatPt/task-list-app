import { RootQueryType, RootMutationType } from "./schema";
import { GraphQLSchema, graphql } from "graphql";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

const mockData = [
  {
    id: 1,
    name: "FirstTestList",
    task: [
      {
        id: 1,
        listId: 1,
        title: "FirstTestTask",
        status: "incomplete",
      },
      {
        id: 2,
        listId: 1,
        title: "SecondTestTask",
        status: "incomplete",
      },
      {
        id: 3,
        listId: 1,
        title: "ThridTestTask",
        status: "incomplete",
      },
    ],
  },
  {
    id: 2,
    name: "SecondTestList",
    task: [
      {
        id: 4,
        listId: 2,
        title: "FirstTestTask2",
        status: "incomplete",
      },
      {
        id: 5,
        listId: 2,
        title: "SecondTestTask2",
        status: "incomplete",
      },
      {
        id: 6,
        listId: 2,
        title: "ThridTestTask2",
        status: "incomplete",
      },
      {
        id: 7,
        listId: 2,
        title: "FourthTestTask2",
        status: "incomplete",
      },
    ],
  },
];

const createTestData = async () => {
  await prisma.task.deleteMany();
  await prisma.list.deleteMany();
  await prisma.list.createMany({
    data: [
      {
        id: 1,
        name: "FirstTestList",
      },
      {
        id: 2,
        name: "SecondTestList",
      },
    ],
  });
  await prisma.task.createMany({
    data: [
      {
        id: 1,
        title: "FirstTestTask",
        listId: 1,
      },
      {
        id: 2,
        title: "SecondTestTask",
        listId: 1,
      },
      {
        id: 3,
        title: "ThridTestTask",
        listId: 1,
      },
      {
        id: 4,
        title: "FirstTestTask2",
        listId: 2,
      },
      {
        id: 5,
        title: "SecondTestTask2",
        listId: 2,
      },
      {
        id: 6,
        title: "ThridTestTask2",
        listId: 2,
      },
      {
        id: 7,
        listId: 2,
        title: "FourthTestTask2",
      },
    ],
  });
};

beforeAll(() => {
  return createTestData();
});

const testCall = async (query: any) => {
  return graphql(schema, query);
};

const listQuery = `query{ list {
    id
    name
    task {
        id
        title
        status
        listId
    }
}}`;

test("Test fetching all lists ", async () => {
  expect(await testCall(listQuery)).toEqual({ data: { list: mockData } });
});

const addListMutation = (name: string) => {
  return `mutation {
    addList(name : "${name}"){
        name
    }
}`;
};

test("Test adding a list ", async () => {
  expect(await testCall(addListMutation("testAddList"))).toEqual({
    data: { addList: { name: "testAddList" } },
  });
});

const addTaskMutation = (title: String, listId: number) => {
  return `mutation {
    addTask(title : "${title}", listId: ${listId}){
      title
      status
      listId
    }
}`;
};

test("Test adding a task ", async () => {
  expect(await testCall(addTaskMutation("Something", 2))).toEqual({
    data: {
      addTask: { title: "Something", status: "incomplete", listId: 2 },
    },
  });
});

const updateTaskMutation = (id: number, title?: string, status?: string) => {
  return `mutation {
    updateTask(id : ${id}, title: "${title}",status: ${status}){
      title
      status
    }
}`;
};

test("Test update a task ", async () => {
  expect(
    await testCall(updateTaskMutation(1, "testUpdateTask", "complete"))
  ).toEqual({
    data: { updateTask: { title: "testUpdateTask", status: "complete" } },
  });
});

const moveTaskUpMutation = (id: number) => {
  return `mutation {
    moveTaskUp(id : ${id}){
      id
      title
      status
    }
}`;
};

test("Test moving a task up", async () => {
  expect(await testCall(moveTaskUpMutation(2))).toEqual({
    data: {
      moveTaskUp: { id: 1, title: "SecondTestTask", status: "incomplete" },
    },
  });
});

const moveTaskDownMutation = (id: number) => {
  return `mutation {
    moveTaskDown(id : ${id}){
      id
      title
      status
    }
}`;
};

test("Test moving a task down", async () => {
  expect(await testCall(moveTaskDownMutation(5))).toEqual({
    data: {
      moveTaskDown: { id: 6, title: "SecondTestTask2", status: "incomplete" },
    },
  });
});

const moveTaskMutation = (id: number, position: number) => {
  return `mutation {
    moveTask(id : ${id}, position : ${position}){
      id
      title
      status
    }
}`;
};

test("Test moving a task to specific position", async () => {
  expect(await testCall(moveTaskMutation(7, 1))).toEqual({
    data: {
      moveTask: { id: 4, title: "FourthTestTask2", status: "incomplete" },
    },
  });
});
