"use server";

import QuestionModel from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import TagModel from "@/database/tag.model";
import { CreateQuestionParams, GetQuestionsParams } from "./shared.types";
import UserModel from "@/database/user.model";
import { revalidatePath } from "next/cache";

export async function getAllQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const questions = await QuestionModel.find({})
      .populate({ path: "tags", model: TagModel })
      .populate({ path: "author", model: UserModel })
      .sort({ createdAt: -1 });

    return { questions };
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  try {
    connectToDatabase();
    const { title, content, tags, author, path } = params;

    // create question
    const question = await QuestionModel.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];
    // create the tag or get the tag is it exists
    for (const tag of tags) {
      const existingTag = await TagModel.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        {
          $setOnInsert: { name: tag },

          $push: { question: question._id },
        },
        { upsert: true, new: true }
      );

      tagDocuments.push(existingTag._id);
    }

    // update question
    await QuestionModel.findByIdAndUpdate(question._id, {
      $push: {
        tags: {
          $each: tagDocuments,
        },
      },
    });

    revalidatePath(path);

    // ToDo create an interaction record for the users ask_question action
    // ToDo Increment author's reputation by 5 points for creating question
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}
