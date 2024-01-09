import useToast from "@/hooks/useToast";

export const handleError = (error: unknown) => {
  const toast = useToast();
  if (error instanceof Error) {
    toast(error.message, "error");
    console.error(error.message);
  } else {
    console.error(error);
  }
}