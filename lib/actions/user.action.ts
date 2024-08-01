"use server";
import { FilterQuery } from "mongoose";
import UserModel from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import QuestionModel from "@/database/question.model";
import TagModel from "@/database/tag.model";
import AnswerModel from "@/database/answer.model";

export async function getUserByID(params: GetUserByIdParams) {
  try {
    await connectToDatabase();
    const { userId } = params;

    const user = await UserModel.findOne({ clerkId: userId });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();
    // TODO
    // const {page =1 , pageSize = 20 ,filter , searchQuery} = params;
    const { searchQuery, filter } = params;

    const query: FilterQuery<typeof QuestionModel> = {};

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case "new_users":
        sortOptions = { joinedAt: -1 };
        break;
      case "old_users":
        sortOptions = { joinedAt: 1 };
        break;
      case "top_contributers":
        sortOptions = { reputation: -1 };
        break;
      default:
        break;
    }

    const users = await UserModel.find(query).sort(sortOptions);

    return { users };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function CreateUser(userData: CreateUserParams) {
  try {
    await connectToDatabase();
    const newUser = await UserModel.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function UpdateUser(userData: UpdateUserParams) {
  try {
    await connectToDatabase();
    const { clerkId, updateData, path } = userData;
    await UserModel.findOneAndUpdate({ clerkId }, updateData, { new: true });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function DeleteUser(userData: DeleteUserParams) {
  try {
    await connectToDatabase();
    const { clerkId } = userData;
    const user = await UserModel.findOne({ clerkId });

    if (!user) {
      throw new Error("User not found");
    }

    // delete user from mongoDB , related questions , answers and comments

    // get question Id's
    // const userQuestionIds = await QuestionModel.find({ author: user._id }).distinct("_id");
    // delete questions
    await QuestionModel.deleteMany({ author: user._id });

    // todo: delete user answers,comments,etc

    const deletedUser = await UserModel.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    await connectToDatabase();
    const { userId, questionId, path } = params;

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isQuestionSaved = user.saved.includes(questionId);

    if (isQuestionSaved) {
      // remove question from saved
      await UserModel.findByIdAndUpdate(userId, { $pull: { saved: questionId } }, { new: true });
    } else {
      // add question to saved
      await UserModel.findByIdAndUpdate(
        userId,
        { $addToSet: { saved: questionId } },
        { new: true }
      );
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();

    const { clerkId, searchQuery, filter } = params;

    const query: FilterQuery<typeof QuestionModel> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};

    let sortOptions = {};

    switch (filter) {
      case "most_recent":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "most_voted":
        sortOptions = { upvotes: -1 };
        break;
      case "most_viewed":
        sortOptions = { views: -1 };
        break;
      case "most_answered":
        sortOptions = { answers: -1 };
        break;
      default:
        break;
    }

    const user = await UserModel.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: sortOptions,
      },
      populate: [
        { path: "tags", model: TagModel, select: "_id name" },
        { path: "author", model: UserModel, select: "_id clerkId name picture" },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    const savedQuestions = user.saved;

    return { questions: savedQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await UserModel.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const totalQuestions = await QuestionModel.countDocuments({ author: user._id });
    const totalAnswers = await AnswerModel.countDocuments({ author: user._id });

    return {
      user,
      totalQuestions,
      totalAnswers,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;

    const totalQuestions = await QuestionModel.countDocuments({ author: userId });

    const userQuestions = await QuestionModel.find({ author: userId })
      .sort({ views: -1, upvotes: -1 })
      .populate("tags", "_id name")
      .populate("author", "_id clerkId name picture");

    return { totalQuestions, questions: userQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;

    const totalAnswers = await AnswerModel.countDocuments({ author: userId });

    const userAnswers = await AnswerModel.find({ author: userId })
      .sort({ upvotes: -1 })
      .populate("question", "_id title")
      .populate("author", "_id clerkId name picture");

    return { totalAnswers, answers: userAnswers };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
