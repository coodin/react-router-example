import {
  ActionFunctionArgs,
  Form,
  ParamParseKey,
  Params,
  useLoaderData,
  useFetcher,
} from "react-router-dom";
import { getContact, updateContact } from "../contactData";

export interface IContact {
  id: string;
  first: string;
  last: string;
  avatar: string;
  twitter: string;
  notes: string;
  favorite: boolean;
  createdAt: number;
}
const PathNames = {
  contact: "contacts/:contactId",
} as const;
interface loaderArgs extends ActionFunctionArgs {
  params: Params<ParamParseKey<typeof PathNames.contact>>;
}
export async function contactLoader({ params }: loaderArgs) {
  const contact = await getContact(params.contactId ?? "");
  if (!contact) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }
  return { contact };
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: Params<ParamParseKey<typeof PathNames.contact>>;
}) {
  let formData = await request.formData();
  return updateContact(params.contactId ?? "", {
    favorite: formData.get("favorite") === "true",
  });
}

export default function Contact() {
  const { contact } = useLoaderData() as Awaited<
    ReturnType<typeof contactLoader>
  >;

  return (
    <div id="contact">
      <div>
        <img key={contact?.avatar} src={contact?.avatar} />
      </div>

      <div>
        <h1>
          {contact?.first || contact?.last ? (
            <>
              {contact?.first} {contact?.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          {contact && <Favorite {...contact} />}
        </h1>

        {contact?.twitter && (
          <p>
            <a target="_blank" href={`https://twitter.com/${contact?.twitter}`}>
              {contact?.twitter}
            </a>
          </p>
        )}

        {contact?.notes && <p>{contact?.notes}</p>}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form
            method="post"
            action="destroy"
            onSubmit={(event) => {
              if (!confirm("Please confirm you want to delete this record.")) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({ favorite }: IContact) {
  const fetcher = useFetcher();
  // yes, this is a `let` for later
  //let favorite = myContact.favorite;
  if (fetcher.formData) {
    favorite = fetcher.formData.get("favorite") === "true";
  }
  return (
    <fetcher.Form method="post">
      <button
        name="favorite"
        value={favorite ? "false" : "true"}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}
