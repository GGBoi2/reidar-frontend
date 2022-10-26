// Create a function that takes parameters of type allIds & notThisOne that returns a type string
export const getRandomMember: (
  allIds: { id: string }[],
  notThisOne?: string
) => string = function (allIds, notThisOne?) {
  //Choose random id from allIds
  const index = Math.floor(Math.random() * allIds.length);

  const selectedMember = allIds[index].id;
  //Check if unique for 2nd member
  if (selectedMember !== notThisOne) return selectedMember;
  //If duplicate, run function again
  return getRandomMember(allIds, notThisOne);
};
