"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formUrlQuery } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import React from "react";
import LocalSearchbar from "../search/LocalSearchbar";
import { Country } from "@/types";

interface JobsFilterProps {
  countries: Country[];
}

const JobsFilter = ({ countries }: JobsFilterProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramFilter = searchParams.get("location");
  const router = useRouter();
  const handleUpdateParams = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "location",
      value,
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="relative mt-11 flex w-full justify-between gap-5 max-sm:flex-col sm:items-center">
      <LocalSearchbar
        route={pathname}
        iconPosition="left"
        imgSrc="/assets/icons/job-search.svg"
        placeholder="Job Title, Company, or Keywords"
        otherClasses="flex-1 max-sm:w-full"
      />

      <Select onValueChange={handleUpdateParams} defaultValue={paramFilter || undefined}>
        <SelectTrigger className="body-regular light-border background-light800_dark300 text-dark500_light700 line-clamp-1 flex min-h-[56px] items-center gap-3 border p-4  sm:max-w-[210px]">
          <Image src="/assets/icons/carbon-location.svg" alt="location" width={18} height={18} />
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Select Location" />
          </div>
        </SelectTrigger>
        <SelectContent className="small-regular text-dark500_light700 max-h-[350px] max-w-full border-none bg-light-900 dark:bg-dark-300 sm:max-w-[250px]">
          <SelectGroup>
            {countries ? (
              countries.map((country: Country) => (
                <SelectItem
                  className="cursor-pointer focus:bg-light-800 dark:focus:bg-dark-400"
                  key={country.name.common}
                  value={country.name.common}
                >
                  {country.name.common}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="No results found">No results found</SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default JobsFilter;
