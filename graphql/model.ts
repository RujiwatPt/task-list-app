import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLEnumType,
} from "graphql";
import { sortById } from "../service/util";

export const StatusType = new GraphQLEnumType({
  name: "Status",
  values: {
    incomplete: { value: "incomplete" },
    complete: { value: "complete" },
  },
});

export const TaskType = new GraphQLObjectType({
  name: "Task",
  description: "This represents the tasks",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLNonNull(GraphQLString) },
    status: { type: GraphQLNonNull(StatusType) },
    listId: { type: GraphQLInt },
  }),
});

export const ListType = new GraphQLObjectType({
  name: "List",
  description: "This represents the list of tasks",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    task: {
      type: new GraphQLList(TaskType),
      resolve: (List) => {
        return List.task.sort(sortById);
      },
    },
  }),
});
