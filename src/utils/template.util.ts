export function parseTemplateContent(
  string: string,
  variables: Record<string, string>,
) {
  const parsedNameTag = string.replace(/{{(.*?)}}/g, (match, key) => {
    // Check if the index exists in the variables object
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      return variables[key];
    }
    return match; // If no variable match, return the original placeholder
  });

  return parsedNameTag;
}
