/**
 * Utility for debugging API responses
 */

export function logObject(label: string, obj: any): void {
  console.group(`Debug: ${label}`);

  if (obj === null) {
    console.log("null");
  } else if (obj === undefined) {
    console.log("undefined");
  } else if (Array.isArray(obj)) {
    console.log(`Array with ${obj.length} items:`);
    if (obj.length > 0) {
      console.log("First item keys:", Object.keys(obj[0]));
      console.log("Sample item:", obj[0]);
    }
  } else if (typeof obj === "object") {
    console.log("Object keys:", Object.keys(obj));
    console.log("Object:", obj);
  } else {
    console.log(`${typeof obj}:`, obj);
  }

  console.groupEnd();
}

export function inspectError(error: any): void {
  console.group("Error Inspection");
  console.log("Error type:", error?.constructor?.name);
  console.log("Message:", error?.message);
  console.log("Stack:", error?.stack);
  console.log("Full error object:", error);
  console.groupEnd();
}
