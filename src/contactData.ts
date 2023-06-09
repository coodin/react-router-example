import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";
import { IContact } from "./routes/contact";

type FakeCacheType = Record<string, boolean>;
// interface Contact {
//   id: string;
//   first: string;
//   last: string;
//   avatar: string;
//   twitter: string;
//   notes: string;
//   favorite: boolean;
//   createdAt: number;
// }

export async function getContacts(query: string | null = null) {
  await fakeNetwork(`getContacts:${query}`);
  let contacts = await localforage.getItem<IContact[]>("contacts");
  if (!contacts) contacts = [];
  if (query) {
    contacts = matchSorter(contacts, query, { keys: ["first", "last"] });
  }
  return contacts.sort(sortBy("last", "createdAt"));
}

export async function createContact() {
  await fakeNetwork();
  let id = Math.random().toString(36).substring(2, 9);
  //let contact = { id, createdAt: Date.now() };
  let contact: IContact = {
    id,
    first: "Ogün",
    last: "AcIg",
    avatar: "",
    favorite: false,
    notes: "Hello my name is ogün ",
    twitter: "",
    createdAt: Date.now(),
  };
  let contacts = await getContacts();
  contacts.unshift(contact);
  await set(contacts);
  return contact;
}

export async function getContact(id: string) {
  await fakeNetwork(`contact:${id}`);
  let contacts = await localforage.getItem<IContact[]>("contacts");
  let contact = contacts?.find((contact) => contact.id === id);
  return contact ?? null;
}

export async function updateContact(id: string, updates: any) {
  await fakeNetwork();
  let contacts = await localforage.getItem<IContact[]>("contacts");
  let contact = contacts?.find((contact) => contact.id === id);
  if (!contact) throw new Error("No contact found for" + id);
  Object.assign(contact, updates);
  await set(contacts!);
  return contact;
}

export async function deleteContact(id: string) {
  let contacts = await localforage.getItem<IContact[]>("contacts");
  let index = contacts?.findIndex((contact) => contact.id === id);
  if (index == undefined) throw new Error("No contact found for" + id);
  if (index > -1) {
    contacts?.splice(index, 1);
    await set(contacts!);
    return true;
  }
  return false;
}

function set(contacts: IContact[]) {
  return localforage.setItem("contacts", contacts);
}

// fake a cache so we don't slow down stuff we've already seen
let fakeCache: FakeCacheType = {};

async function fakeNetwork(key: string | null = null): Promise<unknown> {
  if (!key) {
    fakeCache = {};
  }

  if (fakeCache[key!]) {
    return;
  }

  fakeCache[key!] = true;
  return new Promise((res) => {
    setTimeout(res, Math.random() * 800);
  });
}
