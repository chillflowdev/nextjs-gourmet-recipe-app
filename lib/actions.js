"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveMeal } from "./meals";

function isInvalidText(text) {
  return !text || text.trim() === "";
}

// 오직 서버에서만 실행되는 함수이다. async를 붙여서 실제로 서버에서 실행되고 있음을?
export async function shareMeal(prevState, formData) {
  // form의 name과 매칭
  const meal = {
    title: formData.get("title"),
    summary: formData.get("summary"),
    instructions: formData.get("instructions"),
    image: formData.get("image"),
    creator: formData.get("name"),
    creator_email: formData.get("email"),
  };

  if (
    isInvalidText(meal.title) ||
    isInvalidText(meal.summary) ||
    isInvalidText(meal.instructions) ||
    isInvalidText(meal.creator) ||
    isInvalidText(meal.creator_email) ||
    !meal.creator_email.includes("@") ||
    !meal.image ||
    meal.image.size === 0
  ) {
    // 클라이언트에 보내기 위해서는 직렬화가 가능한 객체여야 한다.
    return {
      message: "Invalid Input.",
    };
  }
  await saveMeal(meal);
  // 유효성 재검사 (해당 캐시를 비우는 것을 의미한다.)
  revalidatePath("/meals");
  redirect("/meals");
}
