import Jobcard from "@/components/cards/Jobcard";
import React from "react";

import { Job } from "@/types";
import { fetchCountries, fetchJobs, fetchLocation } from "@/lib/actions/job.action";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import Filter from "@/components/shared/filter/Filter";
import JobsFilter from "@/components/shared/filter/JobsFilter";

interface Props {
  searchParams: {
    q: string;
    location: string;
    page: string;
  };
}

const Page = async ({ searchParams }: Props) => {
  const userLocation = await fetchLocation();

  const jobs = await fetchJobs({
    query: `${searchParams.q}, ${searchParams.location}` ?? `Software Engineer in ${userLocation}`,
    page: searchParams.page ?? 1,
  });

  const countries = await fetchCountries();
  const page = parseInt(searchParams.page ?? 1);

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Jobs</h1>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center ">
        <LocalSearchbar
          route="/jobs"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for Jobs"
          otherClasses="flex-1"
        />
        <JobsFilter countries={countries} otherClasses="min-h-[56px] sm:min-w-[170px]" />
      </div>
      {jobs.length > 0 && jobs.map((job: any) => <Jobcard key={job.job_id} job={job} />)}
      pagination
    </div>
  );
};

export default Page;
