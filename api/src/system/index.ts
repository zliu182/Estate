export const getEnvVariableOrThrow = (envName: string): string => {
  const result = process.env[envName];

  if (result) {
    return result;
  } else {
    throw new Error(`Environment variable ${envName} is not found.`); // Return an error instance
  }
};

export const getDefaultValue = (
  envName: string,
  defaultValue: string
): string => {
  const result = process.env[envName];

  if (result) {
    return result;
  } else {
    return defaultValue;
  }
};
