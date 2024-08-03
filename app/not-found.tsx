import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-auth-light bg-cover bg-center bg-no-repeat dark:bg-auth-dark">
      <h1 className="h2-bold text-primary-500">
        oooppsss!!!!!🫣 The page you are looking is Not Found
      </h1>

      <Link className="btn primary-gradient mt-5 rounded-md px-3 py-2.5 text-light-900 " href="/">
        Go back to Home
      </Link>
    </div>
  );
}
