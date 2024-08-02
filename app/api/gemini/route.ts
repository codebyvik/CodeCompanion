import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function run() {
  // Choose a model that's appropriate for your use case.
}

run();

export const POST = async (request: Request) => {
  const { question } = await request.json();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(question);
    const response = result.response;
    const responseData = response.text();

    // const responseData = await text.json();
    // const reply = responseData.choices[0].message.content;

    // convert plain txt to html

    return NextResponse.json({ responseData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
};
