export async function request(url: string, method: string, body: unknown) {
  const result = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await result.json();
  if (!result.ok)
    throw new Error(
      payload.error || "The current is a little rough. Please try again.",
    );
  return payload;
}
export function readableError(error: Error) {
  if (error.name === "ZodError") {
    try {
      return JSON.parse(error.message)[0].message;
    } catch {
      return "Please check your words and try again.";
    }
  }
  return error.message;
}
