export default function (schemaValidation, bodyData = {}) {
  const checkValidate = schemaValidation.safeParse(bodyData);

  let result = { success: checkValidate.success };

  if (checkValidate.success) result.data = checkValidate.data;
  else {
    const errors = checkValidate.error.issues.map((item) => {
      return {
        path: item.path.join("."),
        message: item.message,
      };
    });

    result.errors = errors;
  }

  return result;
}
