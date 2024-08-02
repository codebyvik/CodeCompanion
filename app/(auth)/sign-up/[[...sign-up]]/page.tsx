import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Dev desk",
  description: "Dev Desk is a community of 1,000,000+ developers. Join us .",
};
export default function Page() {
  return <SignUp />;
}
