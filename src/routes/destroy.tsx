import {
  ActionFunctionArgs,
  ParamParseKey,
  Params,
  redirect,
} from "react-router-dom";
import { deleteContact } from "../contactData.ts";

const PathNames = {
  contact: "contacts/:contactId/destroy",
} as const;
interface destroyLoader extends ActionFunctionArgs {
  params: Params<ParamParseKey<typeof PathNames.contact>>;
}

export async function action({ params }: destroyLoader) {
  await deleteContact(params.contactId ?? "");
  return redirect("/");
}
