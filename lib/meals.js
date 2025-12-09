import fs from "node:fs";

import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";

const db = sql("meals.db");

export async function getMeals() {
  // run은 데이터를 주입시킬 때,
  // all은 데이터를 전부 가져올 때,
  // get은 해당 열을 가져올 때 사용한다.
  await new Promise((resolve) => setTimeout(resolve, 5000));

  //throw new Error("Loading meals failed");
  return db.prepare("SELECT * FROM meals").all();
}

export function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions); //검열

  const extension = meal.image.name.split(".").pop();
  const fileName = `${meal.slug}.${extension}`;

  // 파일 경로
  const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer();

  stream.write(Buffer.from(bufferedImage), (error) => {
    if (error) {
      throw new Error("Saving image failed!");
    }
  });
  // public이 포함될 필요가 없다.
  meal.image = `/images/${fileName}`;
  // SQL 인젝션 공격 주의!
  db.prepare(
    `
      INSERT INTO meals 
      (title, summary, instructions, creator, creator_email, image, slug) 
      VALUES(@title, @summary, @instructions, @creator, @creator_email, @image, @slug )
    `
  ).run(meal);
}
