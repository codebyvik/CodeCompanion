import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Dev desk",
  description: "Dev Desk is a community of 1,000,000+ developers. Join us .",
};

export default function Page() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-auth-light bg-cover bg-center bg-no-repeat dark:bg-auth-dark">
      <SignIn />
    </div>
  );
}
