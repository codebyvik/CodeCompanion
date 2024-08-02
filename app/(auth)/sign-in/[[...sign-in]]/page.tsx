import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Dev desk",
  description: "Dev Desk is a community of 1,000,000+ developers. Join us .",
};

export default function Page() {
  return <SignIn />;
}
