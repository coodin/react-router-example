import {
  Form,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router-dom";

import { getContacts, createContact } from "../contactData";
import { useEffect } from "react";

export async function rootLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  const contacts = await getContacts(search);
  return { contacts, search };
}

export async function action() {
  const contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export default function Root() {
  const { contacts, search } = useLoaderData() as Awaited<
    ReturnType<typeof rootLoader>
  >;
  let timeout: number;
  const navigation = useNavigation();
  const submit = useSubmit();
  useEffect(() => {
    (document.getElementById("search") as HTMLInputElement).value =
      search ?? "";
  }, [search]);
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("search");
  return (
    <>
      <div id="sidebar">
        <h1>React Router Contacts</h1>
        <div>
          <Form id="search-form" role="search">
            <input
              id="search"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="search"
              defaultValue={search ?? ""}
              className={searching ? "loading" : ""}
              onChange={(event) => {
                const isFirstSearch = search == null;
                if (timeout) {
                  clearTimeout(timeout);
                }
                timeout = setTimeout(() => {
                  submit(event.target.form, { replace: !isFirstSearch });
                }, 500);
              }}
            />
            <div id="search-spinner" aria-hidden hidden={!searching} />
            <div className="sr-only" aria-live="polite"></div>
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length > 0 ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    to={`contacts/${contact.id}`}
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {contact.favorite && <span>★</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div
        id="detail"
        className={navigation.state == "loading" ? "loading" : ""}
      >
        <Outlet />
      </div>
    </>
  );
}
