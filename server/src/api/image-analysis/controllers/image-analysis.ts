import fs from "fs";
import { analyzeImage } from "../services/gemini";

export default {
  async analyze(ctx) {
    try {
      const files = ctx.request.files;

      if (!files || !files.image) {
        return ctx.throw(400, "No image uploaded");
      }

      const file = Array.isArray(files.image)
        ? files.image[0]
        : files.image;

      const base64Image = fs.readFileSync(file.filepath, {
        encoding: "base64",
      });

      const result = await analyzeImage(base64Image);

if (!result) {
  return ctx.throw(500, "AI failed to return structured data");
}

ctx.body = { result };


      ctx.body = { result };
    } catch (error) {
      console.error("IMAGE ANALYSIS ERROR:", error);
      ctx.throw(500, error.message);
    }
  },
};
