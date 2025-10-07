import dotenv from "dotenv";

dotenv.config();

interface ConfigEnv {
  PORT: string;
  MONGO_URL: string;
  NODE_ENV: "development" | "production";
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_SALT_ROUNDS: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;
  Supper_Admin_Email: string;
  Password: string;
}

const loadEnvVariable = (): ConfigEnv => {
  const requiredEnvVariables: string[] = [
    "PORT",
    "MONGO_URL",
    "NODE_ENV",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "BCRYPT_SALT_ROUNDS",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",
    "Supper_Admin_Email",
    "Password",
  ];
  requiredEnvVariables.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${envVar} is not defined`);
    }
  });
  return {
    PORT: process.env.PORT as string,
    MONGO_URL: process.env.MONGO_URL!,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    Supper_Admin_Email: process.env.Supper_Admin_Email as string,
    Password: process.env.Password as string,
  };
};
export const configEnv: ConfigEnv = loadEnvVariable();
