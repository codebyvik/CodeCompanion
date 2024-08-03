"use server";

export const fetchLocation = async () => {
  const response = await fetch("http://ip-api.com/json/?fields=country");
  const location = await response.json();
  return location.country;
};

export const fetchCountries = async () => {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
};

export async function fetchJobs(filters: any) {
  try {
    const { query, page } = filters;

    const url = `https://jsearch.p.rapidapi.com/search?query=${query}&page=${page}`;

    const headers = {
      "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPID_API_KEY ?? "",
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    };
    const response = await fetch(url, {
      headers,
    });

    const result = await response.json();

    return result.data;
  } catch (error) {
    console.log(error);
  }
}
