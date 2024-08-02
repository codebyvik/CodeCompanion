"use server";

import QuestionModel from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import TagModel from "@/database/tag.model";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from "./shared.types";
import UserModel from "@/database/user.model";
import { revalidatePath } from "next/cache";
import AnswerModel from "@/database/answer.model";
import InteractionModel from "@/database/interaction.model";
import { FilterQuery } from "mongoose";

export async function getAllQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 20 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof QuestionModel> = {};

    if (searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, "i") } },
        { content: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case "newest":
        sortOptions = {
          createdAt: -1,
        };
        break;
      case "frequent":
        sortOptions = {
          views: -1,
        };
        break;
      case "unanswered":
        query.answers = { $size: 0 };
        break;
      default:
        break;
    }

    const questions = await QuestionModel.find(query)
      .populate({ path: "tags", model: TagModel })
      .populate({ path: "author", model: UserModel })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalQuestions = await QuestionModel.countDocuments(query);

    const isNext = totalQuestions > skipAmount + questions.length;

    return { questions, isNext };
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

          $push: { questions: question._id },
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

    // create an interaction
    await InteractionModel.create({
      user: author,
      action: "ask_question",
      question: question._id,
      tags: tagDocuments,
    });
    // Increment author's reputation by 5 points for creating question
    await UserModel.findByIdAndUpdate(author, { $inc: { reputation: 5 } });

    revalidatePath(path);
  } catch (error) {
    console.log("error", error);
    throw error;
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    connectToDatabase();

    const { questionId } = params;

    const question = await QuestionModel.findById(questionId)
      .populate({ path: "tags", model: TagModel, select: "_id name" })
      .populate({ path: "author", model: UserModel, select: "_id clerkId name picture" });

    return question;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }

    const question = await QuestionModel.findByIdAndUpdate(questionId, updateQuery, { new: true });

    if (!question) {
      throw new Error("Question not found");
    }

    // Increment users's reputation +1 or -1 for upvoting/revoking
    await UserModel.findByIdAndUpdate(userId, { $inc: { reputation: hasupVoted ? -2 : 2 } });

    // Increment author's reputation +10 or -10 for receiving upvoting/revoking
    await UserModel.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasupVoted ? -10 : 10 },
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if (hasdownVoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }

    const question = await QuestionModel.findByIdAndUpdate(questionId, updateQuery, { new: true });

    if (!question) {
      throw new Error("Question not found");
    }

    // Increment users's reputation +1 or -1 for upvoting/revoking
    await UserModel.findByIdAndUpdate(userId, { $inc: { reputation: hasdownVoted ? -2 : 2 } });

    // Increment author's reputation +10 or -10 for receiving upvoting/revoking
    await UserModel.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasdownVoted ? -10 : 10 },
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, path } = params;

    await QuestionModel.deleteOne({ _id: questionId });
    await AnswerModel.deleteMany({ question: questionId });
    await InteractionModel.deleteMany({ question: questionId });
    await TagModel.updateMany({ questions: questionId }, { $pull: { questions: questionId } });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}
export async function editQuestion(params: EditQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, title, content, path } = params;

    const question = await QuestionModel.findById(questionId).populate("tags");

    if (!question) {
      throw new Error("Question not found");
    }

    question.title = title;
    question.content = content;

    await question.save();

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}
export async function getHotQuestions() {
  try {
    connectToDatabase();

    const hotQuestions = await QuestionModel.find({}).sort({ views: -1, upvote: -1 }).limit(5);

    return hotQuestions;
  } catch (error) {
    console.log(error);
  }
}
