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
    id: 1001,
    name: "FirstTestList",
    task: [
      {
        id: 1001,
        listId: 1001,
        title: "FirstTestTask",
        status: "incomplete",
      },
      {
        id: 1002,
        listId: 1001,
        title: "SecondTestTask",
        status: "incomplete",
      },
      {
        id: 1003,
        listId: 1001,
        title: "ThridTestTask",
        status: "incomplete",
      },
    ],
  },
  {
    id: 1002,
    name: "SecondTestList",
    task: [
      {
        id: 1004,
        listId: 1002,
        title: "FirstTestTask2",
        status: "incomplete",
      },
      {
        id: 1005,
        listId: 1002,
        title: "SecondTestTask2",
        status: "incomplete",
      },
      {
        id: 1006,
        listId: 1002,
        title: "ThridTestTask2",
        status: "incomplete",
      },
      {
        id: 1007,
        listId: 1002,
        title: "FourthTestTask2",
        status: "incomplete",
      },
    ],
  },
  {
    id: 1003,
    name: "ThirdTestList",
    task: [],
  },
];

const createTestData = async () => {
  await prisma.task.deleteMany();
  await prisma.list.deleteMany();
  await prisma.list.createMany({
    data: [
      {
        id: 1001,
        name: "FirstTestList",
      },
      {
        id: 1002,
        name: "SecondTestList",
      },
      {
        id: 1003,
        name: "ThirdTestList",
      },
    ],
  });
  await prisma.task.createMany({
    data: [
      {
        id: 1001,
        title: "FirstTestTask",
        listId: 1001,
      },
      {
        id: 1002,
        title: "SecondTestTask",
        listId: 1001,
      },
      {
        id: 1003,
        title: "ThridTestTask",
        listId: 1001,
      },
      {
        id: 1004,
        title: "FirstTestTask2",
        listId: 1002,
      },
      {
        id: 1005,
        title: "SecondTestTask2",
        listId: 1002,
      },
      {
        id: 1006,
        title: "ThridTestTask2",
        listId: 1002,
      },
      {
        id: 1007,
        listId: 1002,
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
  expect(await testCall(addTaskMutation("Something", 1003))).toEqual({
    data: {
      addTask: { title: "Something", status: "incomplete", listId: 1003 },
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
    await testCall(updateTaskMutation(1001, "testUpdateTask", "complete"))
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
  expect(await testCall(moveTaskUpMutation(1002))).toEqual({
    data: {
      moveTaskUp: { id: 1001, title: "SecondTestTask", status: "incomplete" },
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
  expect(await testCall(moveTaskDownMutation(1005))).toEqual({
    data: {
      moveTaskDown: {
        id: 1006,
        title: "SecondTestTask2",
        status: "incomplete",
      },
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
  expect(await testCall(moveTaskMutation(1007, 1))).toEqual({
    data: {
      moveTask: { id: 1004, title: "FourthTestTask2", status: "incomplete" },
    },
  });
});
