import { string } from "zod";

// Create a function that takes parameters of type allIds & notThisOne that returns a type string
export const getFirstMember: (allIds: { id: string }[]) => {
  id: string;
  index: number;
} = (allIds) => {
  //Choose random id from allIds
  const index = Math.floor(Math.random() * allIds.length);
  //Get Member's id
  const id = allIds[index].id;
  return { id, index };
};

export const getSecondMember: (
  allIds: { id: string }[],
  firstId: string,
  firstIndex: number
) => string = (allIds, firstId, firstIndex) => {
  let selectedMember = "";
  let secondIndex = 0;

  //Do Logic for 50/50. Determine index of next member
  const random = Math.random();
  if (random > 0.5) {
    secondIndex = Math.floor(Math.random() * allIds.length);
  } else {
    const pickSize = 20;

    const randomRoll =
      Math.floor(Math.random() * pickSize) - Math.round(pickSize / 2);
    console.log("initial index: " + firstIndex);
    console.log("random Roll " + randomRoll);

    if (randomRoll + firstIndex < 0) {
      secondIndex = pickSize / 2 - randomRoll;
      console.log("Top " + secondIndex);
    } else if (randomRoll + firstIndex > allIds.length - 1) {
      secondIndex = allIds.length - 1 - (pickSize / 2 + randomRoll);
      console.log("Mid " + secondIndex);
    } else {
      secondIndex = firstIndex + randomRoll;
      console.log("Bot " + secondIndex);
    }
  }

  selectedMember = allIds[secondIndex].id;

  //Check if unique for 2nd member
  if (selectedMember !== firstId) return selectedMember;
  //If duplicate, run function again
  return getSecondMember(allIds, firstId, firstIndex);
};
