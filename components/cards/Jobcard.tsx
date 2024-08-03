import Image from "next/image";
import Link from "next/link";
import React from "react";

interface JobLocationProps {
  city?: string;
  country?: string;
  state?: string;
}

const JobLocation = ({ city, country, state }: JobLocationProps) => {
  return (
    <div className="background-light800_dark400 flex items-center justify-end gap-2 rounded-2xl px-3 py-1.5">
      <Image
        src={`https://flagsapi.com/${country}/flat/64.png`}
        alt="country symbol"
        width={16}
        height={16}
        className="rounded-full"
      />
      <p className="body-medium text-dark400_light700">
        {city && `${city}`} , {state && `${state}`} , {country && `${state}`}
      </p>
    </div>
  );
};

const company = {
  image:
    "https://devflow-rose.vercel.app/_next/image?url=https%3A%2F%2Fclarivate.com%2Fwp-content%2Fuploads%2F2020%2F11%2Flogo.png&w=3840&q=75",
  title: " Online Tasker - QuickRewards - Patna - India - DoScouting",
  short_desc:
    "QuickRewards is seeking a detail-oriented and motivated Online Tasker to join our team. In this role, you will be responsible for completing various online tasks and surveys that help our clients gath",
  type: "FULLTIME",
  salary: "Not disclosed",
  link: "https://careers.clarivate.com/job/JREQ128528/Senior-Software-Engineer-JAVA-Full-Stack?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
  location: {
    city: "Bengaluru",
    state: "KA",
    country: "IN",
  },
};

const Jobcard = async (job: any) => {
  return (
    <section className="mt-8 rounded-md border bg-light-900 px-5 py-3">
      <div className="flex gap-2">
        <Image
          src={job.job?.employer_logo || company.image}
          width={100}
          height={100}
          alt="Company_logo"
          className="border object-contain p-2"
        />
        <div>
          <div>
            <p>{job.job.job_title}</p>
            <JobLocation
              city={job.job.job_city}
              country={job.job.job_country}
              state={job.job.job_state}
            />
          </div>

          <p>{job.job.job_description}</p>

          <div>
            <p>{job.job.job_employment_type}</p>
            <p>{job.job.job_min_salary || "NOT Disclosed"}</p>
            <Link href={job.job.job_apply_link}>View Job</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Jobcard;
