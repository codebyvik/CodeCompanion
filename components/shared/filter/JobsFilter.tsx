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
import { useRouter, useSearchParams } from "next/navigation";

import React from "react";

const JobsFilter = ({ countries, containerClasses, otherClasses }: any) => {
  const searchParams = useSearchParams();
  const paramFilter = searchParams.get("filter");
  const router = useRouter();
  const handleUpdateParams = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "filter",
      value,
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className={`relative ${containerClasses}`}>
      <Select onValueChange={handleUpdateParams} defaultValue={paramFilter || undefined}>
        <SelectTrigger
          className={`${otherClasses} body-regular light-border background-light800_dark300 text-dark500_light700 line-clamp-1 flex min-h-[56px]  items-center gap-5 border p-4 sm:max-w-[210px]`}
        >
          <Image src="/assets/icons/carbon-location.svg" alt="location" width={18} height={18} />
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Select a Country" />
          </div>
        </SelectTrigger>
        <SelectContent className="text-dark500_light700 small-regular body-semibold  border-none bg-light-900 dark:bg-dark-300">
          <SelectGroup>
            {countries &&
              countries.map((country: any) => (
                <SelectItem
                  className="cursor-pointer py-3 focus:bg-light-800 dark:focus:bg-dark-400"
                  key={country.name.common}
                  value={country.name.common}
                >
                  {country.name.common}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default JobsFilter;
