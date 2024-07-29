"use server";

import UserModel from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetUserByIdParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import QuestionModel from "@/database/question.model";

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

    const users = await UserModel.find({}).sort({ createdAt: -1 });

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
