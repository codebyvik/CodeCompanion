"use server";

import QuestionModel from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { SearchParams } from "./shared.types";
import UserModel from "@/database/user.model";
import AnswerModel from "@/database/answer.model";
import TagModel from "@/database/tag.model";

const searchableTypes = ["question", "answer", "user", "tag"];

export async function globalSearch(params: SearchParams) {
  try {
    await connectToDatabase();
    const { query, type } = params;
    const regexQuery = { $regex: query, $options: "i" };

    let results = [];

    const modelsAndTypes = [
      { model: QuestionModel, searchField: "title", type: "question" },
      { model: UserModel, searchField: "name", type: "user" },
      { model: AnswerModel, searchField: "content", type: "answer" },
      { model: TagModel, searchField: "name", type: "tag" },
    ];

    const typeLower = type?.toLowerCase();

    if (!typeLower || !searchableTypes.includes(typeLower)) {
      // search everything
      for (const { model, searchField, type } of modelsAndTypes) {
        const queryresult = await model
          .find({
            [searchField]: regexQuery,
          })
          .limit(2);

        results.push(
          ...queryresult.map((item) => ({
            title: type === "answer" ? `Answers containing ${query}` : item[searchField],
            type,
            id: type === "user" ? item.clerkId : type === "answer" ? item.question : item._id,
          }))
        );
      }
    } else {
      // search specified model type

      const modelInfo = modelsAndTypes.find((item) => item.type === type);

      if (!modelInfo) {
        throw new Error("invalid search type");
      }

      const queryResults = await modelInfo.model
        .find({
          [modelInfo.searchField]: regexQuery,
        })
        .limit(8);

      results = queryResults.map((item) => ({
        title: type === "answer" ? `Answers containing ${query}` : item[modelInfo.searchField],
        type,
        id: type === "user" ? item.clerkId : type === "answer" ? item.question : item._id,
      }));
    }

    return JSON.stringify(results);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
