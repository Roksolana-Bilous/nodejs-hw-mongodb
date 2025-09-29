const parseContactType = (type) => {
  if (typeof type !== "string") return;

  const allowedTypes = ["work", "home", "personal"];
  if (allowedTypes.includes(type)) {
    return type;
  }
};

const parseBoolean = (value) => {
  if (typeof value !== "string") return;

  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
};

export const parseFilterParams = (query) => {
  const { type, isFavourite } = query;

  const parsedType = parseContactType(type);
  const parsedIsFavourite = parseBoolean(isFavourite);

  const filter = {};

  if (parsedType) {
    filter.contactType = parsedType;
  }

  if (typeof parsedIsFavourite === "boolean") {
    filter.isFavourite = parsedIsFavourite;
  }

  return filter;
};
