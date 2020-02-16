import dotenv from "dotenv";

dotenv.config();

export default {
  key: process.env.HTTPS_KEY,
  ca: process.env.HTTPS_CA,
  cert: process.env.HTTPS_CERT
}
