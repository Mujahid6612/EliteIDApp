export const textMapper = (text: string) => {
  if (text === "CONFIRM TO ARRIVE")
    return "Confirm to arrive at pickup".toUpperCase();
  else return text;
};
