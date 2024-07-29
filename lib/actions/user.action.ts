"use server";

import UserModel from "@/database/user.model";
import { connectToDatabase } from "../mongoose";

export async function getUserByID(params: any) {
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
