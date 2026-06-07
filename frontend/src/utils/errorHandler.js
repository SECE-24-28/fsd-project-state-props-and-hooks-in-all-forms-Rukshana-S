export const handleApiError = (error) => {
  if (!error.response) {
    return "Network Error";
  }

  switch (error.response.status) {
    case 400:
      return "Bad Request";

    case 401:
      return "Unauthorized";

    case 403:
      return "Forbidden";

    case 404:
      return "Not Found";

    case 500:
      return "Server Error";

    default:
      return "Something went wrong";
  }
};
